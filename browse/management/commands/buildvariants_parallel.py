from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from browse.models import Histone, Variant, Sequence, ScoreHmm, ScoreForHistoneType, Feature
from tools.load_hmmsearch import load_hmm_results, add_score, add_histone_score, add_generic_score, get_many_prot_seqrec_by_accession, load_hmm_classification_results, load_generic_scores
from tools.test_model import test_model
import subprocess
import os, sys
import re
import io
from tools.taxonomy_from_accessions import taxonomy_from_header, easytaxonomy_from_header, fetch_taxids, update_taxonomy
from tools.blast_search import make_blastp, load_blast_search
from tools.hist_ss import get_variant_features

from Bio import SearchIO
from Bio import SeqIO
from tqdm import tqdm

import logging
from datetime import date, datetime

from cProfile import Profile

# HMMER_PROCS=20
HMMER_PROCS=4 # for small random data

#This command is the main one in creating the histone database system from seed alignments
#and by using HMMs constructed based on these alignment to classify the bigger database.
#see handle() for the workflow description.
#INPUT NEEDED: static/browse/seeds
#db_file (nr) in the main directory - the database of raw sequences.

class Command(BaseCommand):
    help = 'Build HistoneDB by first loading the seed sequences and then parsing the database file'
    seed_directory = os.path.join(settings.STATIC_ROOT_AUX, "browse", "seeds")
    fold_seed_directory = os.path.join(settings.STATIC_ROOT_AUX, "browse", "seeds_fold")
    hmm_directory = os.path.join(settings.STATIC_ROOT_AUX, "browse", "hmms")
    # combined_hmm_file = os.path.join(hmm_directory, "combined_hmm.hmm") #removed by Preety
    combined_hmm_histtypes_file = os.path.join(hmm_directory, "combined_hmm_histtypes.hmm") #file for combined sequences by hist_types (by Preety)
    combined_hmm_variants_file = os.path.join(hmm_directory, "combined_hmm_variants.hmm") #file for combined sequences by variants (by Preety)
    pressed_combined_hmm_file = os.path.join(hmm_directory, "combined_hmm.h3f")
    db_search_results_file = os.path.join(hmm_directory, "db_search_results.out")
    db_classification_results_file = os.path.join(hmm_directory, "db_classification_results.out")
    curated_all_fasta=os.path.join(hmm_directory, "curated_all.fasta")
    curated_generic_fasta=os.path.join(hmm_directory, "curated_generic.fasta")
    curated_search_results_file = os.path.join(hmm_directory, "curated_all_search_results.out")
    curated_gen_search_results_file = os.path.join(hmm_directory, "curated_generic_search_results.out")
    model_evaluation = os.path.join(hmm_directory, "model_evaluation")
    ids_file = os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "HistoneDB_sequences.ids")
    full_length_seqs_file = os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "HistoneDB_sequences.fasta")

    # Logging info
    logging.basicConfig(filename='log/buildvariants.log',
                        format='%(asctime)s %(name)s %(levelname)-8s %(message)s',
                        level=logging.INFO,
                        datefmt='%Y-%m-%d %H:%M:%S')
    log = logging.getLogger(__name__)

    def add_arguments(self, parser):
        parser.add_argument(
            "-f", 
            "--force", 
            default=False,
            action="store_true", 
            help="Force the regeneration of HMM from seeds, HUMMER search in db_file, Test models and loading of results to database")

        parser.add_argument(
            "--db",
            dest="db_file",
            default="nr",
            help="Specify the database file, by default will use or download nr")

        parser.add_argument(
            "--adjust_thrshehold",
            default=False,
            action="store_true",
            help="Adjust threshold")

        parser.add_argument(
            "--adjust_hmmer_procs",
            default=20,
            help="Adjust hmmer_procs")

        parser.add_argument(
            "--HMMER_classification",
            default=True,
            action="store_true",
            help="Classify sequences based on HMMER search")

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
        self.log.info('===          buildvariants_parallel START           ===')
        self.log.info('=======================================================')
        self.start_time=datetime.now()
        ## If hmmer_procs in options change the value
        if 'adjust_hmmer_procs' in options:
            HMMER_PROCS=options["adjust_hmmer_procs"]
        self.log.info('HMMER_PROCS !!!! {}'.format(HMMER_PROCS))
        ##If no nr file is present in the main dir, will download nr from the NCBI ftp.
        self.db_file=options['db_file']
        if self.db_file == "nr":
            if options["force"] or not os.path.isfile('nr'):
                self.get_nr()
        if self.db_file == "swissprot":
            if options["force"] or not os.path.isfile('swissprot'):
                self.get_swissprot()
        if ('http://' in self.db_file) or ('https://' in self.db_file) or ('ftp://' in self.db_file):
            self.log.info('Provided db file is a link %s - Expecting a gzipped file. Attempting to download ...'%self.db_file)
            subprocess.call(["wget", self.db_file,'-O','db.gz'])
            subprocess.call(["gunzip", "db.gz"])
            self.db_file='db'


        if options["force"]:
            #Clean the DB, removing all sequence/scores/etc
            Sequence.objects.all().delete()
            ScoreHmm.objects.all().delete()
            ScoreForHistoneType.objects.all().delete()

        if options["force"] or not os.path.isfile(self.combined_hmm_histtypes_file):
            #Create HMMs from seeds and compress them to one HMM file tp faster search with hmmpress.
            self.build_hmms_from_seeds()
            self.press_hmms()

            #Determine HMMER thresholds params used to classify sequence based on HMMER
            self.estimate_thresholds()

            #Load our curated sets taken from seed alignments into the database an run classification algorithm
            self.load_curated()
            self.get_scores_for_curated_via_hmm()

        if options["force"] or not os.path.isfile(self.db_search_results_file+"0"):
            #Search sequences by hist_type models (by Preety). We need this just to get sequences suits to histone models.
            self.search_in_db_parallel()

        #Load the sequences
        self.load_from_db_parallel()
        # self.extract_full_sequences_from_ncbi()
        self.extract_full_sequences_parallel()
        #Classify loaded sequences based on variant HMMER thresholds that includes:
        #search loaded seuqences to database using our variantt models
        #load search results based on variant HMMER thresholds
        self.classify_by_hmm()

        # self.extract_full_sequences()
        self.canonical2H2AX()

        self.get_stats()

        seq_num = Sequence.objects.count()
        seqauto_num = Sequence.objects.filter(reviewed=False).count()

        self.log.info(' The database has %d sequences now !!!'%seq_num)
        self.log.info(' %d sequences came from automatic search !!!'%seqauto_num)
        self.log.info('=======================================================')
        self.log.info('===   buildvariants_parallel SUCCESSFULLY finished  ===')
        self.log.info('=======================================================')

    def handle(self, *args, **options):
        if options['profile']:
            profiler = Profile()
            profiler.runcall(self._handle, *args, **options)
            profiler.print_stats()
        else:
            self._handle(*args, **options)

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
            obj = ScoreHmm.objects.filter(variant__id="H2A.X",sequence=s)
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

    def get_nr(self):
        """Download nr if not present"""
        if not os.path.isfile(self.db_file):
            self.log.info("Downloading nr...")
            # print >> self.stdout, "Downloading nr..."
            with open("nr.gz", "w") as nrgz:
                subprocess.call(["curl", "-#", "ftp://ftp.ncbi.nlm.nih.gov/blast/db/FASTA/nr.gz"], stdout=nrgz)
            subprocess.call(["gunzip", "nr.gz"])

    def get_swissprot(self):
        """Download nr if not present"""
        if not os.path.isfile(self.db_file):
            self.log.info("Downloading swissprot...")
            # print >> self.stdout, "Downloading swissprot..."
            with open("swissprot.gz", "w") as swissprotgz:
                subprocess.call(["curl", "-#", "ftp://ftp.ncbi.nlm.nih.gov/blast/db/FASTA/swissprot.gz"], stdout=swissprotgz)
            subprocess.call(["gunzip", "swissprot.gz"])


    def build_hmms_from_seeds(self):
        """Build HMMs from seed histone sequences,
        and outputing them to
        static/browse/hmms/
        to individual dirs as well as combining to pne file combined_hmm_file
        """
        self.log.info("Building HMMs...")
        # print >> self.stdout, "Building HMMs..."
        
        with open(self.combined_hmm_histtypes_file, "w") as combined_hmm_histtypes, open(self.combined_hmm_variants_file, "w") as combined_hmm_variants:
            for hist_type, seed in self.get_fold_seeds(combined_alignments=True):
                #Build HMMs
                hmm_dir = os.path.join(self.hmm_directory, hist_type)
                if not os.path.exists(hmm_dir):
                    os.makedirs(hmm_dir)
                hmm_file = os.path.join(hmm_dir, "{}.hmm".format(seed[:-6]))
                self.build_hmm(seed[:-6], hmm_file, os.path.join(self.fold_seed_directory, hist_type, seed))
                if hist_type=='': #combine all combined by hist_types sequences in one file (by Preety)
                    with open(hmm_file) as hmm:
                        print(hmm.read().rstrip(), file=combined_hmm_histtypes)
                    continue
                with open(hmm_file) as hmm:
                    print(hmm.read().rstrip(), file=combined_hmm_variants)

    def build_hmm(self, name, db, seqs):
        self.log.info(' '.join(["hmmbuild", "-n", name, db, seqs]))
        subprocess.call(["hmmbuild", "-n", name, db, seqs])

    def press_hmms(self):
        self.press(self.combined_hmm_histtypes_file)
        self.press(self.combined_hmm_variants_file)

    def press(self, combined_hmm):
        """Press the HMMs into a single HMM file, overwriting if present"""
        self.log.info("Pressing HMMs...")
        # print >> self.stdout, "Pressing HMMs..."
        subprocess.call(["hmmpress", "-f", combined_hmm])

    def search(self, hmms_db, out, sequences=None, E=10):
        """Use HMMs to search the nr database"""
        self.log.info("Searching HMMs...")
        # print >> self.stdout, "Searching HMMs..."

        if sequences is None:
            sequences = self.db_file
        self.log.info(" ".join(["hmmsearch", "-o", out, "-E", str(E), "--notextw", hmms_db, sequences]))
        subprocess.call(["hmmsearch", "-o", out, "-E", str(E), "--notextw", hmms_db, sequences])

    def search_in_db_classification(self):
        for i in range(HMMER_PROCS):
            self.search(hmms_db=self.combined_hmm_variants_file, out=self.db_classification_results_file+"%d"%i, sequences=self.full_length_seqs_file+"%d"%i)

    def search_in_db_parallel(self):
        return self.search_parallel(hmms_db=self.combined_hmm_histtypes_file, out=self.db_search_results_file, sequences=self.db_file, E=10)

    def search_parallel_test_for_small(self, hmms_db, out, sequences=None, E=10):
        """Use HMMs to search the nr database"""
        self.log.info("Searching HMMs in parallel...")
        # print >> self.stdout, "Searching HMMs..."

        if sequences is None:
            sequences = self.db_file
        self.log.info("Splitting database file into %d parts"%HMMER_PROCS)
        #!!!!!!!!!!!!!!!
        os.system('mkdir db_split')
        #This is tricky tricky to make it fast
        size=os.path.getsize(sequences)
        split_size=int(size/HMMER_PROCS)+1
        os.system('split --bytes=%d --numeric-suffixes=1 %s db_split/split'%(split_size,sequences))
        #We need to heal broken fasta records
        for i in range(1,HMMER_PROCS+1):
            outsp = subprocess.check_output(['head', '-n', '1', 'db_split/split%02d' % i])
            if outsp.split(b'\n')[0].decode("utf-8")[0] != '>':
                if len(outsp.split(b'\n')) > 1:
                    for k in range(2,10000):
                        if(outsp.split(b'\n')[-2].decode("utf-8")[0]=='>'):
                            print(k)
                            break
                    os.system('head -n %d db_split/split%02d >>db_split/split%02d ' % (k - 1, i, i - 1))
                    os.system('tail -n +%d db_split/split%02d> db_split/temp' % (k, i))
                    os.system('mv db_split/temp db_split/split%02d' % i)

                else:
                    for kp in range(1, 10000):
                        outsp_prev = subprocess.check_output(['tail', '-n', '%d' % kp, 'db_split/split%02d' % i - 1])
                        if outsp_prev.split(b'\n')[-kp].decode("utf-8")[0] == '>':
                            break
                    os.system('tail -n %d db_split/split%02d> db_split/temp' % (kp, i - 1))
                    os.system('head -n %d db_split/split%02d >>db_split/temp' % (1, i))
                    os.system('mv db_split/temp db_split/split%02d' % i)
                    os.system('tail -n %d db_split/split%02d> db_split/temp' % (kp, i - 1))
        
        self.log.info("Launching %d processes"%HMMER_PROCS)
        #!!!!!!!!!!!!!!
        child_procs=[]
        for i in range(HMMER_PROCS):
            outp=out+"%d"%i
            self.log.info(" ".join(["nice","hmmsearch", "-o", outp,'--cpu','2', "-E", str(E), "--notextw", hmms_db, "db_split/split%02d"%(i+1)]))
            p=subprocess.Popen(["nice","hmmsearch", "-o", outp,'--cpu','2', "-E", str(E), "--notextw", hmms_db, "db_split/split%02d"%(i+1)])
            child_procs.append(p)
        for cp in child_procs:
            cp.wait()

    def search_parallel(self, hmms_db, out, sequences=None, E=10):
        """Use HMMs to search the nr database"""
        self.log.info("Searching HMMs in parallel...")
        # print >> self.stdout, "Searching HMMs..."

        if sequences is None:
            sequences = self.db_file
        self.db_split(sequences)

        self.log.info("Launching %d processes" % HMMER_PROCS)
        # !!!!!!!!!!!!!!
        child_procs = []
        for i in range(HMMER_PROCS):
            outp = out + "%d" % i
            self.log.info(" ".join(["nice", "hmmsearch", "-o", outp, '--cpu', '2', "-E", str(E), "--notextw", hmms_db,
                                    "db_split/split%02d" % (i + 1)]))
            p = subprocess.Popen(["nice", "hmmsearch", "-o", outp, '--cpu', '2', "-E", str(E), "--notextw", hmms_db,
                                  "db_split/split%02d" % (i + 1)])
            child_procs.append(p)
        for cp in child_procs:
            cp.wait()

    def db_split(self, sequences):
        self.log.info("Splitting database file into %d parts" % HMMER_PROCS)
        # !!!!!!!!!!!!!!!
        os.system('rm -rf db_split')
        os.system('mkdir db_split')
        # This is tricky tricky to make it fast
        size = os.path.getsize(sequences)
        split_size = int(size / HMMER_PROCS) + 1
        os.system('split --bytes=%d --numeric-suffixes=1 %s db_split/split' % (split_size, sequences))
        # We need to heal broken fasta records
        for i in range(1, HMMER_PROCS + 1):
            for k in range(1, 10000):
                outsp = subprocess.check_output(['head', '-n', '%d' % k, 'db_split/split%02d' % i])
                if (outsp.split(b'\n')[-2].decode("utf-8")[0] == '>'):
                    print(k)
                    break
            if (k > 1):
                os.system('head -n %d db_split/split%02d >>db_split/split%02d ' % (k - 1, i, i - 1))
                os.system('tail -n +%d db_split/split%02d> db_split/temp' % (k, i))
                os.system('mv db_split/temp db_split/split%02d' % i)

    def extract_full_sequences(self, sequences=None):
        """Create database to extract full length sequences"""

        if sequences is None:
            sequences = self.db_file

        #1) Create and index of sequence file
        self.log.info("Indexing sequence database {}...".format(sequences))
        subprocess.call(["esl-sfetch", "--index", sequences])

        #2) Extract all ids
        self.log.info("Extracting full length sequences...")
        subprocess.call(["esl-sfetch", "-o", self.full_length_seqs_file, "-f", sequences, self.ids_file])

        #3) Update sequences with full length NR sequences -- is there a faster way?
        self.log.info("Updating records with full length sequences...")
        for record in SeqIO.parse(self.full_length_seqs_file, "fasta"):
            headers = record.description.split('\x01')
            for header in headers:
                gi = header.split(" ")[0]
                try:
                    seq = Sequence.objects.get(id=gi)
                    self.log.info("Updating sequence: {}".format(seq.description))
                    seq.sequence = str(record.seq)
                    seq.save()
                except Sequence.DoesNotExist:
                    self.log.error("Sequence {} does not exist in DB".format(gi))
                    pass

    def extract_full_sequences_parallel(self, sequences=None):
        """Create database to extract full length sequences"""

        if sequences is None:
            sequences = self.db_file

        child_procs=[]
        for i in range(HMMER_PROCS):
            #1) Create and index of sequence file
            self.log.info("Indexing sequence database "+"db_split/split%02d"%(i+1))
            self.log.info(" ".join(["esl-sfetch", "--index", "db_split/split%02d"%(i+1)]))
            p=subprocess.Popen(["esl-sfetch", "--index", "db_split/split%02d"%(i+1)])
            child_procs.append(p)
        for cp in child_procs:
            cp.wait()


        child_procs=[]
        for i in range(HMMER_PROCS):

            #2) Extract all ids
            self.log.info("Extracting full length sequences...")
            self.log.info(" ".join(["esl-sfetch", "-o", self.full_length_seqs_file+"%d"%i, "-f", "db_split/split%02d"%(i+1), self.ids_file+"%d"%i]))
            p=subprocess.Popen(["esl-sfetch", "-o", self.full_length_seqs_file+"%d"%i, "-f", "db_split/split%02d"%(i+1), self.ids_file+"%d"%i])
            child_procs.append(p)
        for cp in child_procs:
            cp.wait()


        #3) Update sequences with full length NR sequences -- is there a faster way?
        self.log.info("Updating records with full length sequences...")
        counter=0
        counter_dne=0
        for i in range(HMMER_PROCS):
            self.log.info("Updating sequences from file {}".format(self.full_length_seqs_file+"%d"%i))

            for record in SeqIO.parse(self.full_length_seqs_file+"%d"%i, "fasta"):
                headers = record.description.split('\x01')
                for header in headers:
                    accession = header.split(" ")[0]
                    try:
                        seq = Sequence.objects.get(id=accession)
                        # self.log.info("Updating sequence: {}".format(seq.description))
                        seq.sequence = str(record.seq)
                        seq.save()
                        counter=counter+1
                    except Sequence.DoesNotExist:
                        counter_dne=counter_dne+1
                        #These seqs likely did not exceed the threshold.
                        # self.log.error("Strangely sequence %s does not exist in database - unable to update"%gi)
                        pass
        self.log.info("Updated %d sequences"%counter)
        self.log.info("%d sequences where attempded to update, but were not found in the database"%counter_dne)



    def get_scores_for_curated_via_hmm(self):
        """
        For every curated variant we want to generate a set of scores against HMMs.
        This is needed to supply the same type of information for curated as well as for automatic seqs.
        """
        #Construct the one big file from all cureated seqs.
        with open(self.curated_all_fasta, "w") as f, open(self.curated_generic_fasta, "w") as fg:
            for hist_type, seed in self.get_seeds(generic=True):
                seed_aln_file = os.path.join(self.seed_directory, hist_type, seed)
                for s in SeqIO.parse(seed_aln_file, "fasta"):
                    s.seq = s.seq.ungap("-")
                    if 'generic' in seed: SeqIO.write(s, fg, "fasta")
                    else: SeqIO.write(s, f, "fasta")
        #Search all curated except generic by our HMMs
        self.search(hmms_db=self.combined_hmm_variants_file, out=self.curated_search_results_file,sequences=self.curated_all_fasta, E=10)
        ##We need to parse this results file;
        ##we take here a snippet from load_hmmsearch.py, and tune it to work for our curated seq header format
        for variant_query in SearchIO.parse(self.curated_search_results_file, "hmmer3-text"):
            self.log.info("Loading hmmsearch for variant: {}".format(variant_query.id))
            variant_model=Variant.objects.get(id=variant_query.id)
            for hit in variant_query:
                accession = hit.id.split("|")[1]
                seq = Sequence.objects.get(id=accession)
                try: #sometimes we get this:    [No individual domains that satisfy reporting thresholds (although complete target did)]
                    best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
                    add_score(seq, variant_model, best_hsp, seq.variant_hmm==variant_model)
                except:
                    pass
        #Search generic by our HMMs for histone types
        self.search(hmms_db=self.combined_hmm_histtypes_file, out=self.curated_gen_search_results_file,sequences=self.curated_generic_fasta, E=10)
        ##We have no any scores by variants for generic, but we can add scores to histone types
        self.log.info("Loading hmmsearch for generic curated")
        for histtype_query in SearchIO.parse(self.curated_gen_search_results_file, "hmmer3-text"):
            histtype = histtype_query.id
            self.log.info("Loading hmmsearch for histone type: {}".format(histtype))
            for hit in histtype_query:
                accession = hit.id.split("|")[1]
                seq = Sequence.objects.get(id=accession)
                # best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
                # hist_score = add_histone_score(seq, Histone.objects.get(id=histtype), best_hsp)
                # add_generic_score(seq, Variant.objects.get(id='generic_{}'.format(histtype)), hist_score)
                try: #sometimes we get this:    [No individual domains that satisfy reporting thresholds (although complete target did)]
                    best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
                    hist_score = add_histone_score(seq, Histone.objects.get(id=histtype), best_hsp)
                    add_generic_score(seq, Variant.objects.get(id='generic_{}'.format(histtype)), hist_score)
                except:
                    pass


    def load_from_db_parallel(self,reset=True):
        """Load data into the histone database"""
        self.log.info("Loading data into HistoneDB...")
        self.log.info("Processing %d files ..."%HMMER_PROCS)
        # print >> self.stdout, "Loading data into HistoneDB..."
        for i in range(HMMER_PROCS):
            self.log.info("Processing file %s ..."%(self.db_search_results_file+"%d"%i))
            load_hmm_results(self.db_search_results_file+"%d"%i, self.ids_file+"%d"%i)

    def classify_by_hmm(self,reset=True):
        """Classify loaded data in the histone database according to hmmer results"""
        #TODO: Test method
        self.log.info("Classification of the data of HistoneDB...")
        # accessions = Sequence.objects.filter(reviewed=False).values_list('id', flat=True)
        self.search_in_db_classification()
        for i in range(HMMER_PROCS):
            if not os.path.isfile(self.db_classification_results_file+"%d"%i): continue
            self.log.info("Processing file %s ..." % (self.db_classification_results_file + "%d" % i))
            load_hmm_classification_results(self.db_classification_results_file+"%d"%i)
        load_generic_scores()


    def load_from_db(self,reset=True):
        """Load data into the histone database"""
        self.log.info("Loading data into HistoneDB...")

        load_hmm_results(self.db_search_results_file, self.ids_file)

    def load_curated(self):
        """
        Extracts sequences from seed alignments in static/browse/seeds
        Loads them into the database with flag reviewed=True (which means curated)
        An important fact:
        the seqs in seeds, should have a special header currently:
        >Ixodes|241122402|macroH2A Ixodes_macroH2A
        we accept only this patterns to extract GIs
        """
        accessions=[]
        for hist_type, seed in self.get_seeds(generic=True):
            variant_name = seed[:-6]
            self.log.info(' '.join([variant_name,"==========="]))
            seed_aln_file = os.path.join(self.seed_directory, hist_type, seed)
            for s in SeqIO.parse(seed_aln_file, "fasta"):
                s.seq = s.seq.ungap("-")
                accession = s.id.split("|")[1] # WE NEED TO START GI TO ACCESSION TRANSITION HERE
                if accession.startswith("NOGI"):
                    self.log.info("NO GI detected {}".format(s.id))
                    taxid= easytaxonomy_from_header(s.id).id
                else:
                    #trick to make taxid retrieval faster
                    # taxonomy = taxonomy_from_header("", gi=gi)
                    taxid=1
                    accessions.append(accession)
                self.log.info("Loading {}".format(s.id))

                variant_model = Variant.objects.get(id=variant_name)
                seq = Sequence(
                    id=accession,
                    variant_hmm=variant_model,
                    gene=None,
                    splice=None,
                    taxonomy_id=taxid,
                    header="CURATED SEQUENCE: {}".format(s.description),
                    sequence=s.seq,
                    reviewed=True,
                )
                seq.save()

        # Now let's lookup taxid for those having ACCESSIONs via NCBI.
        update_taxonomy(accessions)

    def get_seeds(self, combined_alignments=False, generic=False):
        """
        Goes through static/browse/seeds directories and returns histone type names and fasta file name of variant (without path).
        If combined_alignments returns histone types as seed and '' as hist_type, additionally to variants
        """
        for i, (root, _, files) in enumerate(os.walk(self.seed_directory)):
            hist_type = os.path.basename(root)
            if hist_type=="seeds" and not combined_alignments: #means we are in top dir, we skip,
            # combinded alignmnents for hist types are their, but we do not use them in database constuction,
            #only in visualization on website
                continue
            elif hist_type=="seeds":
                hist_type = ""
            for seed in files: 
                if not seed.endswith(".fasta") or (not generic and 'generic' in seed): continue
                yield hist_type, seed

    def create_fold_seeds(self):
        """
        Goes through static/browse/seeds directories and creates similar structure in static/browse/seeds_fold with clipped sequences.
        Directory static/browse/seeds_fold contains similar seed sequences clipped to contain only histone folds.
        """
        from Bio.Align import MultipleSeqAlignment
        from Bio.Align.AlignInfo import SummaryInfo
        from Bio.SeqRecord import SeqRecord
        from Bio.Seq import Seq
        from Bio.Alphabet import IUPAC

        self.log.info('Creating seeds_fold directory with same sequences clipped to contain only histone folds...')
        if not os.path.exists(self.fold_seed_directory):
            os.makedirs(self.fold_seed_directory)
        for i, (root, _, files) in enumerate(os.walk(self.seed_directory)):
            for seed in files:
                if not seed.endswith(".fasta"): continue
                hist_type = os.path.basename(root) if os.path.basename(root)!='seeds' else seed[:-6]
                create_file = os.path.join(self.fold_seed_directory, hist_type, seed) if os.path.basename(root)!='seeds' else os.path.join(self.fold_seed_directory, seed)
                variant = Variant.objects.get(id='canonical_{}'.format(hist_type)) if hist_type!='H1' else Variant.objects.get(id='generic_H1')
                seqFile = os.path.join(root, seed)
                sequences = list(SeqIO.parse(seqFile, "fasta"))
                try:
                    msa = MultipleSeqAlignment(sequences)
                    a = SummaryInfo(msa)
                    cons = Sequence(id="Consensus", variant_id=variant.id, taxonomy_id=1,
                                    sequence=str(a.dumb_consensus(threshold=0.1, ambiguous='X')))
                    features = get_variant_features(cons, variants=[variant], save_gff=False, only_general=True)
                    cutting_params = [next(filter(lambda x: x.id.split('_', 2)[-1].strip() == 'General{}_root_alpha1'.format(hist_type), features)).start,
                                      next(filter(lambda x: x.id.split('_', 2)[-1].strip() == 'General{}_root_alpha3'.format(hist_type), features)).end]
                    # cutting_params = list(filter(None, [feature.start if feature.id=='General{}_root_alpha1'.format(seed[:-6]) else feature.end if feature.id=='General{}_root_alpha3'.format(seed[:-6]) else None for feature in features]))
                    try:
                        fd = open(create_file, 'w')
                    except FileNotFoundError:
                        os.makedirs(os.path.join(self.fold_seed_directory, hist_type))
                        fd = open(create_file, 'w')
                    for s in SeqIO.parse(seqFile, "fasta"):
                        s.seq = Seq(str(s.seq)[cutting_params[0]:cutting_params[1]+1], IUPAC.protein)
                        SeqIO.write(s, fd, "fasta")
                    fd.close()
                except StopIteration:
                    self.log.warning('StopIteration: hist_type {}, seed {}'.format(hist_type, seed))
                    try:
                        fd = open(create_file, 'w')
                    except FileNotFoundError:
                        os.makedirs(os.path.join(self.fold_seed_directory, hist_type))
                        fd = open(create_file, 'w')
                    for s in SeqIO.parse(seqFile, "fasta"):
                        SeqIO.write(s, fd, "fasta")
                    fd.close()
        self.log.info('Sequences clipped. See static/browse/seeds_fold directory.')

    def get_fold_seeds(self, combined_alignments=False, generic=False):
        """
        Goes through static/browse/seeds_fold directories and returns histone type names and fasta file name of variant (without path).
        If combined_alignments returns histone types as seed and '' as hist_type, additionally to variants
        If there is no such directory creates new one with cut sequences from static/browse/seeds
        """
        if not os.path.exists(self.fold_seed_directory):
            self.create_fold_seeds()

        for i, (root, _, files) in enumerate(os.walk(self.fold_seed_directory)):
            hist_type = os.path.basename(root)
            if hist_type=="seeds" and not combined_alignments: #means we are in top dir, we skip,
            # combinded alignmnents for hist types are their, but we do not use them in database constuction,
            #only in visualization on website
                continue
            elif hist_type=="seeds_fold":
                hist_type = ""
            for seed in files:
                if not seed.endswith(".fasta") or (not generic and 'generic' in seed): continue
                yield hist_type, seed

    def estimate_thresholds(self, specificity=0.95):

        """
        Estimate HMM threshold that we will use for variant classification.
        Construct two sets for every variant:
            negative: The seed alignmnents from every other variant
            positive: the current seed alignment for the variant
        And estimate params from ROC-curves.
        """
        for hist_type_pos, seed_pos in self.get_seeds():
            variant_name = seed_pos[:-6]

            #Getting all paths right
            positive_seed_aln_file = os.path.join(self.seed_directory, hist_type_pos, seed_pos)
            hmm_file = os.path.join(self.hmm_directory, hist_type_pos, "{}.hmm".format(variant_name))

            output_dir = os.path.join(self.model_evaluation, hist_type_pos)

            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            positive_examples_file = os.path.join(output_dir, "{}_postive_examples.fasta".format(variant_name))
            positive_examples_out = os.path.join(output_dir, "{}_postive_examples.out".format(variant_name))
            negative_examples_file = os.path.join(output_dir, "{}_negative_examples.fasta".format(variant_name))
            negative_examples_out = os.path.join(output_dir, "{}_negative_examples.out".format(variant_name))

            #Unagapping all sequence from seed aln - this will be the positive example
            with open(positive_examples_file, "w") as pf:
                for s in SeqIO.parse(positive_seed_aln_file, "fasta"):
                    s.seq = s.seq.ungap("-")
                    SeqIO.write(s, pf, "fasta")

            #Searching the positive examples set
            self.search(hmms_db=hmm_file, out=positive_examples_out, sequences=positive_examples_file, E=500)
            
            #Build negative examples from all other varaints
            with open(negative_examples_file, "w") as nf:
                for hist_type_neg, seed_neg in self.get_seeds():
                    if((hist_type_pos == hist_type_neg) and (seed_neg == seed_pos)):
                        continue
                    else:
                        sequences = os.path.join(self.seed_directory, hist_type_neg, seed_neg)
                    
                    for s in SeqIO.parse(sequences, "fasta"):
                        s.seq = s.seq.ungap("-")
                        SeqIO.write(s, nf, "fasta")

            #Searching through negative example set
            self.search(hmms_db=hmm_file, out=negative_examples_out, sequences=negative_examples_file, E=500)

            #Here we are doing ROC curve analysis and returning parameters
            specificity = 0.8 if ("canonical" in variant_name) else 0.9 #Hack to make canoical have a lower threshold and ther variants higher threshold
            # specificity = 0.05 if ("generic" in variant_name)  else specificity #Hack to make canoical have a lower threshold and ther variants higher threshold

            parameters = test_model(variant_name, output_dir, positive_examples_out, negative_examples_out, measure_threshold=specificity)

            #Let's put the parameter data to the database,
            #We can set hist_type directly by ID, which is hist_type_pos in this case - because it is the primary key in Histone class.
            variant_model = Variant.objects.get(id=variant_name)
            self.log.info("Updating thresholds for {}".format(variant_model.id))
            self.log.info("Threshold = {}, roc_auc = {}".format(parameters["threshold"], parameters["roc_auc"]))
            variant_model.hmmthreshold = parameters["threshold"]
            variant_model.aucroc = parameters["roc_auc"]
            variant_model.save()

    def extract_full_sequences_from_ncbi(self):
        """Exract full seq by direct call to NCBI servers"""
        self.log.info("Getting full sequences of automatically annotated proteins from NCBI====")
        accessions=Sequence.objects.filter(reviewed=False).values_list('id', flat=True)
        fasta_dict=get_many_prot_seqrec_by_accession(accessions)

        #3) Update sequences with full length NR sequences -- is there a faster way?
        for accession,record in tqdm(fasta_dict.items()):
            # self.log.info('::DEBUG::buildvariants:: record:\n{}\n'.format(record))
            # headers = record.description.split(" >")
            # for header in headers:
            #     accession = header.split(" ", 1)[0]
            #     # self.log.info('::DEBUG::buildvariants:: accession: {}'.format(accession))
            #     try:
            #         seq = Sequence.objects.get(id=accession)
            #         seq.sequence = str(record.seq)
            #         seq.save()
            #     except Sequence.DoesNotExist:
            #         self.log.error('Sequence with accession {} does not exist in DB.'.format(accession))
            #         pass
            try:
                seq = Sequence.objects.get(id=accession)
                seq.sequence = str(record.seq)
                seq.save()
            except Sequence.DoesNotExist:
                self.log.error('Sequence with accession {} does not exist in DB.'.format(accession))
                pass

    def get_stats(self, filename_suff = ''):
        self.log.info('Outputting statistics file ...')

        with open('NR_VERSION', 'w') as nrv:
            nrv.write(self.db_file)

        now = datetime.now()
        dt_string = now.strftime("%Y%m%d-%H%M%S")
        with open('log/db_stat_'+dt_string+filename_suff,'w') as f:
            f.write("Variant database regeneration stitics\n")
            f.write("DB regen start time: %s \n"%self.start_time)
            f.write("DB regen end time: %s\n"%now)
            f.write("Time taken for regeneration of variants: %f hours\n"%(float((now-self.start_time).total_seconds())/3600.))
            f.write("Parallel threads used %d\n"%HMMER_PROCS)
            f.write("DB file used: %s\n"%self.db_file)
            f.write(subprocess.check_output(['ls','-l',self.db_file]).decode("utf-8")+"\n")
            f.write('---Database statistics----\n')
            f.write('Total seqs = %d\n'%Sequence.objects.all().count())
            f.write('Reviewed seqs = %d\n'%Sequence.objects.filter(reviewed=True).count())
            f.write('Automatic seqs = %d\n'%Sequence.objects.filter(reviewed=False).count())

            f.write('\n---Histone type statistics----\n')
            f.write('Type        | Total  |Reviewed|  Auto  \n')
            for h in Histone.objects.all():
                tot=Sequence.objects.filter(variant_hmm__hist_type=h).count()
                rev=Sequence.objects.filter(variant_hmm__hist_type=h,reviewed=True).count()
                auto=Sequence.objects.filter(variant_hmm__hist_type=h,reviewed=False).count()

                f.write('%12s|%8d|%8d|%8d\n'%(h.id,tot,rev,auto))

            f.write('\n---Histone variant statistics----\n')
            f.write('Variant     | Total  |Reviewed|  Auto  \n')
            for v in Variant.objects.all():
                tot=Sequence.objects.filter(variant_hmm=v).count()
                rev=Sequence.objects.filter(variant_hmm=v,reviewed=True).count()
                auto=Sequence.objects.filter(variant_hmm=v,reviewed=False).count()

                f.write('%12s|%8d|%8d|%8d\n'%(v.id,tot,rev,auto))


