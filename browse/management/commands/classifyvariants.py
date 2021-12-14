from django.core.management.base import BaseCommand, CommandError

from browse.models import Histone, Variant, Sequence, Score, ScoreHmm, ScoreForHistoneType, Feature
from tools.browse_service import *
from tools.test_model import test_model

from Bio import SearchIO, SeqIO, AlignIO #, pairwise2
from Bio.Blast.Applications import NcbiblastpCommandline
from Bio.Blast import NCBIXML
from Bio.Emboss.Applications import NeedleCommandline

import os, sys, io
import re
import logging
from tqdm import tqdm
from datetime import date, datetime
from cProfile import Profile

import pandas as pd


# This command is the main one in classifying histone sequences using one of the two ways^
# by using HMMs constructed based on these alignment to classify the bigger database or
# by using BLASTP alignments to classify the bigger database
# see handle() for the workflow description.

class Command(BaseCommand):
    help = 'Build HistoneDB by first loading the seed sequences and then parsing the database file'

    # Logging info
    logging.basicConfig(filename=os.path.join(LOG_DIRECTORY, "classifyvariants.log"),
                        format='%(asctime)s %(name)s %(levelname)-8s %(message)s',
                        level=logging.INFO,
                        datefmt='%Y-%m-%d %H:%M:%S')
    log = logging.getLogger(__name__)

    def add_arguments(self, parser):
        parser.add_argument(
            "-c",
            "--curated",
            default=False,
            action="store_true",
            help="Blast curated sequences and saves all scores against other curated sequences (?)")

        parser.add_argument(
            "-f",
            "--force",
            default=False,
            action="store_true",
            help="Force the regeneration of HMM from seeds, HUMMER search in db_file, Test models and loading of results to database")

        parser.add_argument(
            "--test",
            default=False,
            action="store_true",
            help="Use this option for test running if you need a small version of specified database")

        parser.add_argument(
            "--profile",
            default=False,
            action="store_true",
            help="Profile the command")

    def _handle(self, *args, **options):
        self.log.info('=======================================================')
        self.log.info('===            classifyvariants START               ===')
        self.log.info('=======================================================')
        self.start_time = datetime.now()

        self.log.info('HMMER_PROCS !!!! {}'.format(HMMER_PROCS))

        if 'HMM' in CLASSIFICATION_TYPES:
            if options["force"]:
                ScoreHmm.objects.all().delete()
                Sequence.objects.exclude(reviewed=True).update(variant_hmm=None)
                # Determine HMMER thresholds params used to classify sequence based on HMMER
                self.estimate_hmm_thresholds()
                self.get_scores_for_curated_via_hmm()
            self.classify_via_hmm()
            self.get_stats_hmm()

        if 'BLAST' in CLASSIFICATION_TYPES:
            if options["force"] and options["curated"]:
                assert "You can use option --curated only with --force=False"
            if options["force"]:
                Score.objects.all().delete()
                Sequence.objects.exclude(reviewed=True).update(variant=None)
            if options["force"] or options["curated"]:
                Score.objects.filter(sequence__reviewed=True).delete()
                self.get_scores_for_curated_via_blast()
                # self.estimate_thresholds()
            if not options["curated"]:
                self.classify_via_blast(force=options["force"])
                self.get_stats_blast()

        seq_num = Sequence.objects.count()
        seqauto_num = Sequence.objects.filter(reviewed=False).count()

        self.log.info(' The database has %d sequences now !!!' % seq_num)
        self.log.info(' %d sequences came from automatic search !!!' % seqauto_num)
        self.log.info('=======================================================')
        self.log.info('===     classifyvariants SUCCESSFULLY finished      ===')
        self.log.info('=======================================================')

    def handle(self, *args, **options):
        if options['profile']:
            profiler = Profile()
            profiler.runcall(self._handle, *args, **options)
            profiler.print_stats()
        else:
            self._handle(*args, **options)

    # For HMM classification
    def estimate_hmm_thresholds(self, specificity=0.95):

        """
        Estimate HMM threshold that we will use for variant classification.
        Construct two sets for every variant:
            negative: The seed alignmnents from every other variant
            positive: the current seed alignment for the variant
        And estimate params from ROC-curves.
        """
        for hist_type_pos, seed_pos in get_seeds():
            variant_name = seed_pos[:-6]

            # Getting all paths right
            positive_seed_aln_file = os.path.join(SEED_DIRECTORY, hist_type_pos, seed_pos)
            hmm_file = os.path.join(HMM_DIRECTORY, hist_type_pos, "{}.hmm".format(variant_name))

            output_dir = os.path.join(MODEL_EVALUATION, hist_type_pos)

            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            positive_examples_file = os.path.join(output_dir, "{}_postive_examples.fasta".format(variant_name))
            positive_examples_out = os.path.join(output_dir, "{}_postive_examples.out".format(variant_name))
            negative_examples_file = os.path.join(output_dir, "{}_negative_examples.fasta".format(variant_name))
            negative_examples_out = os.path.join(output_dir, "{}_negative_examples.out".format(variant_name))

            # Unagapping all sequence from seed aln - this will be the positive example
            with open(positive_examples_file, "w") as pf:
                for s in SeqIO.parse(positive_seed_aln_file, "fasta"):
                    s.seq = s.seq.ungap("-")
                    SeqIO.write(s, pf, "fasta")

            # Searching the positive examples set
            self.search_via_hmm(hmms_db=hmm_file, out=positive_examples_out, sequences=positive_examples_file, procs=1, E=500)

            # Build negative examples from all other varaints
            with open(negative_examples_file, "w") as nf:
                for hist_type_neg, seed_neg in get_seeds():
                    if ((hist_type_pos == hist_type_neg) and (seed_neg == seed_pos)):
                        continue
                    else:
                        sequences = os.path.join(SEED_DIRECTORY, hist_type_neg, seed_neg)

                    for s in SeqIO.parse(sequences, "fasta"):
                        s.seq = s.seq.ungap("-")
                        SeqIO.write(s, nf, "fasta")

            # Searching through negative example set
            self.search_via_hmm(hmms_db=hmm_file, out=negative_examples_out, sequences=negative_examples_file, procs=1, E=500)

            # Here we are doing ROC curve analysis and returning parameters
            specificity = 0.8 if ("canonical" in variant_name) else 0.9
            # Hack to make canoical have a lower threshold and ther variants higher threshold
            # specificity = 0.05 if ("generic" in variant_name)  else specificity #Hack to make canoical have a lower threshold and ther variants higher threshold

            parameters = test_model(variant_name, output_dir, positive_examples_out, negative_examples_out,
                                    measure_threshold=specificity)

            # Let's put the parameter data to the database,
            # We can set hist_type directly by ID, which is hist_type_pos in this case - because it is the primary key in Histone class.
            variant_model = Variant.objects.get(id=variant_name)
            self.log.info("Updating thresholds for {}".format(variant_model.id))
            self.log.info("Threshold = {}, roc_auc = {}".format(parameters["threshold"], parameters["roc_auc"]))
            variant_model.hmmthreshold = parameters["threshold"]
            variant_model.aucroc = parameters["roc_auc"]
            variant_model.save()

    def get_scores_for_curated_via_hmm(self):
        """
        For every curated variant we want to generate a set of scores against HMMs.
        This is needed to supply the same type of information for curated as well as for automatic seqs.
        """
        # Construct the one big file from all cureated seqs.
        with open(CURATED_GENERICLESS_FASTA, "w") as f, open(CURATED_GENERIC_FASTA, "w") as fg:
            for hist_type, seed in get_seeds(generic=True):
                seed_aln_file = os.path.join(SEED_DIRECTORY, hist_type, seed)
                for s in SeqIO.parse(seed_aln_file, "fasta"):
                    s.seq = s.seq.ungap("-")
                    if 'generic' in seed:
                        SeqIO.write(s, fg, "fasta")
                    else:
                        SeqIO.write(s, f, "fasta")
        # Search all curated except generic by our HMMs
        self.search_via_hmm(hmms_db=COMBINED_HMM_VARIANTS_FILE, out=CURATED_HISTVAR_RESULTS_FILE,
                    sequences=CURATED_GENERICLESS_FASTA, procs=1, E=10)
        ##We need to parse this results file;
        ##we take here a snippet from load_hmmsearch.py, and tune it to work for our curated seq header format
        for variant_query in SearchIO.parse(CURATED_HISTVAR_RESULTS_FILE, "hmmer3-text"):
            self.log.info("Loading hmmsearch for variant: {}".format(variant_query.id))
            variant_model = Variant.objects.get(id=variant_query.id)
            for hit in variant_query:
                accession = hit.id.split("|")[1]
                seq = Sequence.objects.get(id=accession)
                try:  # sometimes we get this:    [No individual domains that satisfy reporting thresholds (although complete target did)]
                    best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
                    add_hmm_score(seq, variant_model, best_hsp, seq.variant_hmm == variant_model)
                except Exception as e:
                    self.log.warning('Failed while loading scores for curated: {}'.format(str(e)))
                    pass
        # Search generic by our HMMs for histone types
        self.search_via_hmm(hmms_db=COMBINED_HMM_HISTTYPES_FILE, out=CURATED_GEN_HISTVAR_RESULTS_FILE,
                    sequences=CURATED_GENERIC_FASTA, procs=1, E=10)
        ##We have no any scores by variants for generic, but we can add scores to histone types
        self.log.info("Loading hmmsearch for generic curated")
        for histtype_query in SearchIO.parse(CURATED_GEN_HISTVAR_RESULTS_FILE, "hmmer3-text"):
            histtype = histtype_query.id
            self.log.info("Loading hmmsearch for histone type: {}".format(histtype))
            for hit in histtype_query:
                accession = hit.id.split("|")[1]
                seq = Sequence.objects.get(id=accession)
                # best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
                # hist_score = add_histone_score(seq, Histone.objects.get(id=histtype), best_hsp)
                # add_generic_score(seq, Variant.objects.get(id='generic_{}'.format(histtype)), hist_score)
                try:  # sometimes we get this:    [No individual domains that satisfy reporting thresholds (although complete target did)]
                    best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
                    hist_score = add_histone_score(seq, Histone.objects.get(id=histtype), best_hsp)
                    add_generic_score(seq, Variant.objects.get(id='generic_{}'.format(histtype)), hist_score)
                except Exception as e:
                    self.log.warning('Failed while loading scores for curated generic: {}'.format(str(e)))
                    pass

    def classify_via_hmm(self, reset=True):
        """Classify loaded data in the histone database according to hmmer results"""
        # TODO: Test method
        self.log.info("Classification of the data of HistoneDB...")
        # accessions = Sequence.objects.filter(reviewed=False).values_list('id', flat=True)
        self.search_via_hmm(hmms_db=COMBINED_HMM_VARIANTS_FILE, out=DB_HISTVARIANTS_HMM_RESULTS_FILE,
                            sequences=FULL_LENGTH_SEQS_FILE, procs=HMMER_PROCS)
        for i in range(HMMER_PROCS):
            if not os.path.isfile(DB_HISTVARIANTS_HMM_RESULTS_FILE.format('%02d' % (i + 1))): continue
            self.log.info("Processing file %s ..." % (DB_HISTVARIANTS_HMM_RESULTS_FILE.format('%02d' % (i + 1))))
            self.load_hmm_classification_results(DB_HISTVARIANTS_HMM_RESULTS_FILE.format('%02d' % (i + 1)))
            self.log.info('Total classified {} sequences'.format(
                Sequence.objects.exclude(variant_hmm__isnull=True).count()))
        self.load_generic_scores()
        self.canonical2H2AX()

    def search_via_hmm(self, hmms_db, out, sequences, procs, E=10):
        """Use HMMs to search the nr database"""
        self.log.info("Searching HMMs...")
        self.log.info("Launching %d processes" % procs)
        child_procs = []
        for i in range(procs):
            try:
                self.log.info(" ".join(["nice", "hmmsearch", "-o", out.format('%02d' % (i + 1)), "-E", str(E), "--notextw", hmms_db,sequences.format('%02d' % (i + 1))]))
                p = subprocess.Popen(["nice", "hmmsearch", "-o", out.format('%02d' % (i + 1)), "-E", str(E), "--notextw", hmms_db,sequences.format('%02d' % (i + 1))])
            except TypeError:  # if procs=1 we have sequences as string without formating %02d st the end
                self.log.info(" ".join(["nice", "hmmsearch", "-o", out, "-E", str(E), "--notextw", hmms_db, sequences]))
                p = subprocess.Popen(["nice", "hmmsearch", "-o", out, "-E", str(E), "--notextw", hmms_db, sequences])
            child_procs.append(p)
        for cp in child_procs:
            cp.wait()

    # @transaction.atomic # looks like we cannot do it here, since transactions are not atomic in this block
    def load_hmm_classification_results(self, hmmerFile):
        """Save domain hits from a hmmer hmmsearch file into the Panchenko Histone
        Variant DB format.

        Parameters:
        ___________
        hmmerFile : string
          Path to HMMer hmmsearch output file.
        id_file : str
          Path to id file, to extract full lenght GIs
        """
        # TODO: Test method and rewrite description

        for variant_query in tqdm(SearchIO.parse(hmmerFile, "hmmer3-text")):
            self.log.info("Loading variant: {}".format(variant_query.id))
            variant_model = Variant.objects.get(id=variant_query.id)
            for hit in tqdm(variant_query):
                # Below we are fetching a list of headers if there are multiple headers for identical sequences
                # Technically HUMMER might put the second and on gis in description column.
                # The format should be strictly the genbank format: gi|343434|fafsf gdgfdg gi|65656|534535 fdafaf
                # print("{}-----{}".format(hit.id, hit.description))
                headers = "{} {}".format(hit.id, hit.description).split('\x01')
                self.load_hmmhsps(headers, hit.hsps, variant_model)
        # load_generic()
        # delete_unknown()

    def load_hmmhsps(self, headers, hsps, variant_model):
        ###Iterate through high scoring fragments.
        for hsp in hsps:
            # Compare bit scores
            hmmthreshold_passed = hsp.bitscore >= variant_model.hmmthreshold
            ##Iterate through headers of identical sequences.
            for header in headers:
                # to distinct accession from description and if accession is like pir||S24178 get S24178
                accession = header.split(" ")[0]

                seqs = Sequence.objects.filter(id=accession)
                if len(seqs) <= 0:
                    self.log.error("New sequence is found: {}. This is strange.".format(accession))
                    continue

                # Now if loaded bit score is greater than current, reassign variant and update scores. Else, append score
                seq = seqs.first()
                if (seq.reviewed == True):
                    continue  # we do not want to alter a reviewed sequence!

                if not hmmthreshold_passed:
                    add_hmm_score(seq, variant_model, hsp, best=hmmthreshold_passed)
                    continue

                best_scores = seq.all_model_hmm_scores.filter(used_for_classification=True)
                if len(best_scores) > 0:
                    ##Sequence have passed the threshold for one of previous models.
                    best_score = best_scores.first()
                    if hsp.bitscore > best_score.score:
                        # best scoring
                        seq.variant_hmm = variant_model
                        best_score_2 = ScoreHmm.objects.get(id=best_score.id)
                        best_score_2.used_for_classification = False
                        best_score_2.save()
                        seq.save()
                        add_hmm_score(seq, variant_model, hsp, best=True)
                    else:
                        add_hmm_score(seq, variant_model, hsp, best=False)
                else:
                    # No previous model passed the threshold, it is the first
                    seq.variant_hmm = variant_model
                    seq.save()
                    add_hmm_score(seq, variant_model, hsp, best=True)

    def load_generic_scores(self):
        for hist_type in ['H2A', 'H2B', 'H3', 'H4', 'H1']:
            generic_model_sequences = Sequence.objects.filter(histone_type__id=hist_type, variant_hmm__isnull=True)
            self.log.info("Found %d seqs did not pass threshold for %s" % (generic_model_sequences.count(), hist_type))
            for generic_model_seq in generic_model_sequences:
                # self.log.error('variant_hmm is null? {}'.format(generic_model_seq.variant_hmm))
                if generic_model_seq.reviewed:
                    self.log.error('Among unclassified sequences found reviewed. This is strange.')
                    # self.log.error('Seq variant {}'.format(generic_model_seq.variant))
                    # self.log.error('Seq variant_hmm {}'.format(generic_model_seq.variant_hmm))
                    # self.log.error('Seq histone_type {}'.format(generic_model_seq.histone_type))
                    # self.log.error('Seq reviewed {}'.format(generic_model_seq.reviewed))
                    continue
                generic_model = get_or_create_unknown_variant(hist_type=hist_type)
                generic_model_seq.variant_hmm = generic_model
                generic_model_seq.save()
                try:
                    add_generic_score(generic_model_seq, generic_model, generic_model_seq.histone_model_scores.first())
                except Exception as e:
                    self.log.warning('Failed: {}'.format(str(e)))
                    pass
            self.log.info("Total classified %d seqs as generic %s" % (Sequence.objects.filter(variant_hmm__hist_type__id=hist_type,
                                                                                              variant_hmm__id__startswith='generic').count(), hist_type))

    def canonical2H2AX(self):
        """Fix an issue where the canonical variant takes over sequence from H2A.X.
        The H2A.X motif SQ[ED][YFL]$ is not strong enough, but is the correct variant.
        """
        self.log.info('Starting canonical2H2AX transformation ...')

        for s in Sequence.objects.filter(variant_hmm="canonical_H2A",reviewed=False, sequence__regex="SQ[ED][YFLIA]$"):
            old_score = s.all_model_hmm_scores.get(used_for_classification=True)
            old_score.used_for_classification = False
            old_score.save()
            # new_score, created = ScoreHmm.objects.get_or_create(variant_hmm__id="H2A.X",sequence=s)
            obj = ScoreHmm.objects.filter(variant_hmm__id="H2A.X",sequence=s)
            if(len(obj)>1):
                self.log.warning('More than one score object for one variant found - strange!!!')
                self.log.warning(obj)
            if(len(obj)==0):
                new_score, created = ScoreHmm.objects.get_or_create(variant_hmm__id="H2A.X",sequence=s)
            else:
                new_score=obj.first()
            new_score.used_for_classification = True
            new_score.regex = True
            s.variant_hmm_id="H2A.X"
            new_score.save()
            s.save()


    # For BLAST classification
    def get_scores_for_curated_via_blast(self):
        # Score.objects.filter(sequence__reviewed=True).delete()
        thresholds_dict = {'accession': [],
                           'variant': [],
                           'histone_type': [],
                           'taxonomy': [],
                           'header': [],
                           'reviewed': [],
                           'threshold': []}
        for histone_type in ['H1', 'H2A', 'H2B', 'H3', 'H4']:
            sequences = [seq.format(format='fasta') for seq in Sequence.objects.filter(reviewed=True, histone_type=histone_type)]
            seqs_file = os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "HistoneDB_sequences.fa")

            blastp = os.path.join(os.path.dirname(sys.executable), "blastp")
            # output = os.path.join("/", "tmp", "{}.xml".format(uuid.uuid4()))
            blastp_cline = NcbiblastpCommandline(
                cmd=blastp,
                db=seqs_file,
                evalue=.01, outfmt=5)
            result, error = blastp_cline(stdin="\n".join([s.format("fasta") for s in sequences]))

            with open(DB_CURATED_BLAST_RESULTS_FILE.format(histone_type), 'w') as f:
                f.write(result)

            log.info('Blast results saved to {}'.format(DB_CURATED_BLAST_RESULTS_FILE.format(histone_type)))

            with open(DB_CURATED_BLAST_RESULTS_FILE.format(histone_type)) as blastFile:
                for i, blast_record in enumerate(NCBIXML.parse(blastFile)):
                    query_split = blast_record.query.split('|')
                    accession = query_split[0]
                    sequence = Sequence.objects.get(id=accession)
                    if len(blast_record.alignments) == 0:
                        self.log.error(
                            'No BLAST record alignments for {} during adding scores for curated sequences'.format(sequence.id))
                        continue

                    threshold = None
                    for algn in blast_record.alignments:
                        algn_self = (sequence.id == algn.hit_def.split("|")[0])  # alignment on itself
                        variant_model = Variant.objects.get(id=algn.hit_def.split("|")[2])
                        for hsp in algn.hsps:
                            add_score(sequence, variant_model, hsp, algn.hit_def.split("|")[0], best=algn_self)
                            if algn_self and (not threshold or threshold > hsp.score):
                                threshold = hsp.score

                    thresholds_dict['accession'].append(sequence.id)
                    thresholds_dict['variant'].append(sequence.variant.id)
                    thresholds_dict['histone_type'].append(sequence.histone_type.id)
                    thresholds_dict['taxonomy'].append(sequence.taxonomy.name)
                    thresholds_dict['header'].append(sequence.header)
                    thresholds_dict['reviewed'].append(sequence.reviewed)
                    thresholds_dict['threshold'].append(threshold)
        pd.DataFrame(thresholds_dict).to_csv(os.path.join(BLAST_DIRECTORY, "model_evaluation", "thresholds.csv"))

    def classify_via_blast(self, force=True):
        for hist_type in ['H1', 'H2A', 'H2B', 'H3', 'H4']:
            self.log.info("Predicting variants for {} via BLAST".format(hist_type))
            # sequences = [seq.format(format='fasta') for seq in
            #              Sequence.objects.filter(reviewed=False).filter(variant_hmm__hist_type__id=hist_type)]
            sequences = [seq.format(format='fasta') for seq in
                         Sequence.objects.filter(reviewed=False).filter(histone_type__id=hist_type)]
            self.predict_variants_via_blast(sequences=sequences, blastout=DB_HISTVARIANTS_BLAST_RESULTS_FILE,
                                            blastdb=BLASTDB_FILE, hist_type=hist_type,
                                            result_file=DB_HISTVARIANTS_PARSED_RESULTS_FILE,
                                            do_search=force, load_to_db=True, procs=BLAST_PROCS)
            self.load_in_db_nonclassified(hist_type=hist_type)
        # self.checkH2AX()

    def predict_variants_via_blast(self, sequences, blastout, blastdb, hist_type, result_file=None, do_search=True, load_to_db=True, procs=1):
        if do_search:
            self.search_blast(sequences=sequences, blastdb=blastdb.format(hist_type),
                              blastout=blastout.format(hist_type, "%d"), procs=procs)
        for i in range(procs + 1):
            # if os.stat(blastout.format(hist_type, "%d") % i).st_size == 0: continue
            with open(blastout.format(hist_type, "%d") % i, 'r') as blastFile:
                if re.search(r'^\s*$', blastFile.read()):
                    self.log.warning('Results of {} is empty'.format(blastout.format(hist_type, "%d") % i))
                    continue
            result = self.parse_blast_search_out(blastFile_name=blastout.format(hist_type, "%d") % i, hist_type=hist_type)
            if load_to_db:
                self.load_in_db(parsed_blastout=result, hist_type=hist_type)
            result = pd.DataFrame(result).fillna('').drop(columns=['hsp', 'hit_accession'])
            if result_file:
                result[result['best']].to_csv(result_file.format(hist_type, "%d") % i, index=False)
                self.log.info("Predicted sequences saved to {}".format(result_file.format(hist_type, '%d') % i))

    def search_blast(self, sequences, blastdb, blastout, procs):
        self.log.info("Running BLASTP for {} sequences...".format(len(sequences)))
        split_count = int(len(sequences)/procs)
        for i in range(procs+1):
            sequences_split = sequences[split_count * i:split_count * i + split_count]
            self.log.info('Starting Blast sequences for {}/{}'.format(i, procs))
            self.make_blastp(sequences_split, blastdb, save_to=blastout % i)

    def make_blastp(self, sequences, blastdb, save_to):
        # log.error('Error:: sequences {}'.format(len(sequences)))
        # log.error('Error:: hasattr {}'.format(hasattr(sequences, '__iter__')))
        if not hasattr(sequences, '__iter__'):
            sequences = [sequences]

        blastp = os.path.join(os.path.dirname(sys.executable), "blastp")
        # output = os.path.join("/", "tmp", "{}.xml".format(uuid.uuid4()))
        blastp_cline = NcbiblastpCommandline(
            cmd=blastp,
            # db=os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "HistoneDB_sequences.fa"),
            db=blastdb,
            evalue=.01, outfmt=5)
        # evalue=0.004, outfmt=5)
        result, error = blastp_cline(stdin="\n".join([s.format("fasta") for s in sequences]))

        with open(save_to, 'w') as f:
            f.write(result)

        log.info('Blast results saved to {}'.format(save_to))

    def parse_blast_search_out(self, blastFile_name, hist_type):
        """Parse blastFile file and return results as dict.
            Parameters:
            ___________
            blastFile: blastFile
            return e.g.: [{'accession': NP_563627.1, 'histone_type': H3, 'histone_variant': cenH3, 'score': 2.14, 'best': True,
                            'description': Histone superfamily protein [Arabidopsis thaliana], 'hsp': best HSPObject, 'hit_accession': DAA13058.1},
                            {'accession': DAA13058.1, 'histone_type': H2B, 'histone_variant': H2B.W, 'score': 3.11, 'best': False,
                            'description': [Bos taurus], 'hsp': best HSPObject, 'hit_accession': DAA13058.1},]
        """
        blastFile = open(blastFile_name)
        result = []
        count_new = 0
        for i, blast_record in enumerate(NCBIXML.parse(blastFile)): # <Iteration>
            query_split = blast_record.query.split('|')
            # self.log.info('DEBUG:: query_split = {}'.format(query_split))
            accession, description = query_split[0], query_split[-1]
            if accession == 'pir' or accession == 'prf':
                accession = '|'.join(query_split[:3])
                self.log.info('Non-standard accession {} got from {}'.format(accession, blast_record.query))

            if len(blast_record.alignments) == 0: # <Hit> count = 0
                # log.info("No blast hits for {} with e-value {}".format(blast_record.query, blast_record.descriptions[0]))
                self.log.info("No blast hits for {}".format(blast_record.query))
                # raise InvalidFASTA("No blast hits for {}.".format(blast_record.query))
                result.append({'accession': accession, 'histone_type': hist_type,
                               'histone_variant': 'generic_{}'.format(hist_type),
                               'score': .000001, 'best': True, 'description': description,
                               'hsp': None, 'hit_accession': None})
                continue

            best_alignments = []
            for alignment in blast_record.alignments: # <Hit>
                best_algn_hsp = self.get_best_hsp(alignment.hsps, align_longer=.25 * blast_record.query_letters)
                best_alignments.append({'hit_accession': alignment.hit_def.split("|")[0],
                                        'hit_variant': alignment.hit_def.split("|")[2],
                                        'best_hsp': best_algn_hsp,
                                        'score': best_algn_hsp.score})
            best_alignments = sorted(best_alignments, key=lambda algn: algn['score'], reverse=True)

            # If hsp contains macro domain?
            if best_alignments[0]['hit_variant'] == 'macroH2A':
                f = self.check_features_macroH2A(query_accession=accession,
                                                 hsp_hit_start=best_alignments[0]['best_hsp'].sbjct_start, # get start and end of hit HSP
                                                 hsp_hit_end=best_alignments[0]['best_hsp'].sbjct_end)
                if not f: continue

            histone_variant = best_alignments[0]['hit_variant']
            # print('DEBUG::{}: {}'.format(variant_model.id, variant_model.blastthreshold))
            # print('DEBUG::best_score: {}'.format(best_alignments[0]['best_hsp'].score))
            # print('--------------------------------------------------------------')
            # break
            # if best_alignments[0]['best_hsp'].score < variant_model.blastthreshold:
            #   histone_variant = 'generic_{}'.format(variant_model.hist_type.id)

            result.append({'accession': accession, 'histone_type': hist_type, 'histone_variant': histone_variant,
                           'score': best_alignments[0]['score'], 'best': True, 'description': description,
                           'hsp': best_alignments[0]['best_hsp'], 'hit_accession': best_alignments[0]['hit_accession']})

            for best_algn in best_alignments[1:]:
                result.append({'accession': accession, 'histone_type': hist_type,'histone_variant': best_algn['hit_variant'],
                               'score': best_algn['score'], 'best': False, 'description': description,
                               'hsp': best_algn['best_hsp'], 'hit_accession': best_algn['hit_accession']})

        blastFile.close()
        return result

    def load_in_db(self, parsed_blastout, hist_type):
        """Save parsed_blastout given as list of dicts to HistoneDB for current hist_type.
          Parameters:
          ___________
          parsed_blastout: list of dists
            e.g.: [{'accession': NP_563627.1, 'histone_type': H3, 'histone_variant': cenH3, 'score': 2.14, 'best': True,
                   'description': Histone superfamily protein [Arabidopsis thaliana], 'hsp': best HSPObject},
                    {'accession': DAA13058.1, 'histone_type': H2B, 'histone_variant': H2B.W, 'score': 3.11, 'best': False,
                    'description': [Bos taurus], 'hsp': best HSPObject},]
          hist_type: string of histone type id
        """
        self.log.info("Loading BLASTP data for {} into HistoneDB...".format(hist_type))
        for record in parsed_blastout:
            seq = Sequence.objects.get(id=record['accession'])
            if not seq: self.log.error('There is no such sequence {} in database. This is strange.'.format(seq.id))
            variant_model = Variant.objects.get(id=record['histone_variant'])
            if record['best']:
                seq.variant = variant_model
                seq.save()
            try:
                if record['hit_accession']: add_score(seq, variant_model, record['hsp'], record['hit_accession'], best=record['best'])
                else: add_score(seq, variant_model)
            except Exception as e:
                self.log.warning('Failed to add histone variant score: {}'.format(str(e)))
                pass
        self.log.info('Classified {} from {} in database'.format(Sequence.objects.exclude(variant=None).count(),
                                                                 Sequence.objects.all().count()))

    def load_in_db_nonclassified(self, hist_type):
        non_classified = Sequence.objects.filter(variant=None, histone_type__id=hist_type)
        self.log.info('Found {} sequences are not classified for {}'.format(non_classified.count(), hist_type))
        for s in non_classified:
            s.variant = Variant.objects.get(id='generic_{}'.format(s.histone_type.id))
            s.save()
            add_score(s, s.variant)
        self.log.info('All these sequences classified as generic_{}'.format(hist_type))

    def get_best_hsp(self, hsps, align_longer=0):
        best_alignment_hsp = hsps[0]
        for hsp in hsps[1:]:
            if hsp.score > best_alignment_hsp.score and hsp.align_length > align_longer:
                best_alignment_hsp = hsp
        return best_alignment_hsp

    def check_features_macroH2A(self, query_accession, hsp_hit_start, hsp_hit_end):
        feature = Feature.objects.filter(template__variant='macroH2A', name='Macro domain').first()
        ratio = (min(hsp_hit_end, feature.end) - max(hsp_hit_start, feature.start)) / (feature.end - feature.start)
        self.log.info(
            '{} expected as macroH2A with ratio={} of macro domain contained in hsp'.format(query_accession, ratio))
        if ratio < .8:
            self.log.info('{} expected as macroH2A cannot pass 0.8 ratio_treshhold'.format(query_accession))
            return False
        return True

    def checkH2AX(self):
        """Fix an issue where the canonical variant takes over sequence from H2A.X.
        The H2A.X motif SQ[ED][YFL]$ is not strong enough, but is the correct variant.
        """
        self.log.info('Starting canonical2H2AX transformation ...')
        seqs = Sequence.objects.filter(variant__id="canonical_H2A",reviewed=False, sequence__regex="SQ[ED][YFLIA]$")
        self.log.info('Found {} sequences classified as canonical H2A with H2A.X-motif'.format(seqs.count()))

        for s in seqs:
            old_score = s.all_model_scores.get(used_for_classification=True)
            old_score.used_for_classification = False
            old_score.save()
            obj = Score.objects.filter(variant__id="H2A.X",sequence=s)
            if(len(obj)>1):
                self.log.warning('More than one score object for one variant found - strange!!!')
                self.log.warning(obj)
            if(len(obj)==0):
                # new_score, created = Score.objects.get_or_create(variant__id="H2A.X",sequence=s)
                add_score(s, Variant.objects.get(id="H2A.X"))
            else:
                new_score=obj.first()
                new_score.used_for_classification = True
                # new_score.regex = True
                new_score.save()
            s.variant_id="H2A.X"
            s.save()

        self.log.info('Starting H2AX2generic transformation ...')
        seqs = Sequence.objects.filter(variant__id="H2A.X", reviewed=False).exclude(sequence__regex="SQ[ED][YFLIA]$")
        self.log.info('Found {} sequences classified as H2A.X without H2A.X-motif'.format(seqs.count()))

        for s in seqs:
            old_score = s.all_model_scores.get(used_for_classification=True)
            old_score.used_for_classification = False
            old_score.save()
            s.variant_id="generic_H2A"
            s.save()
            add_score(s, s.variant)


    # Statistics
    def get_stats_hmm(self):
        get_stats(start_time=self.start_time, filename='classifyvariants_hmm')

    def get_stats_blast(self):
        get_stats(start_time=self.start_time, filename='classifyvariants_blast')
