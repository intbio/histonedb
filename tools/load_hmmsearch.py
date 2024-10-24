import re
from collections import defaultdict
import sys
import logging

#BioPython
from Bio import SearchIO
from Bio import SeqIO
from Bio.Seq import Seq
from Bio import Entrez
#Django libraires
from browse.models import *
from djangophylocore.models import Taxonomy
from django.db.models import Max
from django.db.utils import IntegrityError
from django.db import close_old_connections
from django.conf import settings
from django.db import transaction

from tqdm import tqdm
#Custom librairies
from tools.taxonomy_from_accessions import taxonomy_from_header, easytaxonomy_from_header, taxonomy_from_accessions, update_taxonomy

log = logging.getLogger(__name__)

def get_or_create_unknown_histone():
  try:
    hist_unknown = Histone.objects.get(id="Unknown")
  except:
    hist_unknown = Histone("Unknown")
    hist_unknown.save()
  return hist_unknown

def get_or_create_unknown_variant(hist_type='Unknown'):
  # We need unknown Variant model - to assign to those that do not pass the threshold for analyzed models,
  # but are waiting if they will be pass threhold with other models.
  # at while searching

  try:
    unknown_model = Variant.objects.get(id="generic_{}".format(hist_type))
  except Variant.DoesNotExist:
    try:
      hist_model = Histone.objects.get(id=hist_type)
    except Histone.DoesNotExist:
      hist_model = get_or_create_unknown_histone()
    unknown_model = Variant(hist_type=hist_model, id="generic_{}".format(hist_type))
    unknown_model.save()
  return unknown_model

#@transaction.atomic # looks like we cannot do it here, since transactions are not atomic in this block
def load_hmm_results(hmmerFile, id_file):
  """Save domain hits from a hmmer hmmsearch file into the Panchenko Histone
  Variant DB format.
  
  Parameters:
  ___________
  hmmerFile : string
    Path to HMMer hmmsearch output file.
  id_file : str
    Path to id file, to extract full lenght GIs
  """

  #close_old_connections()
  
  hit_ids=set()
  for histone_query in tqdm(SearchIO.parse(hmmerFile, "hmmer3-text")):
    log.info("Loading histone: {}".format(histone_query.id))
    for hit in tqdm(histone_query):
      #Save original header to extract full sequence
      hit_ids.add(hit.id)

      #Below we are fetching a list of headers if there are multiple headers for identical sequences
      #Technically HUMMER might put the second and on gis in description column.
      #The format should be strictly the genbank format: gi|343434|fafsf gdgfdg gi|65656|534535 fdafaf
      # print("{}-----{}".format(hit.id, hit.description))
      headers = "{} {}".format(hit.id, hit.description).split('\x01')
      # best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
      load_hmmhit(headers, histone_query.id, hit)

  #Save original header to extract full sequence
  ids = open(id_file, "w")
  for idit in hit_ids:
    print(idit, file=ids)
  ids.close()

  log.info("From file %s we got %d sequences"%(hmmerFile,len(hit_ids)))
  log.info("Initiating taxonomy update for %d seqs where it is not identified"%(Sequence.objects.filter(taxonomy__name="unidentified").count()))

  #Now let's lookup taxid for those we could not pare from header using NCBI eutils.
  update_taxonomy(Sequence.objects.filter(taxonomy__name="unidentified").values_list("id", flat=True))

def load_hmmhit(headers, hist_type, hit):
  for header in headers:
    accession = header.split(" ")[0]

    seqs = Sequence.objects.filter(id=accession)
    if len(seqs) > 0:
      seq = seqs.first()
      if (seq.reviewed == True): continue
      try:
        best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
        best_score = seq.histone_model_scores.filter(used_for_classification=True).first()
        if best_hsp.score > best_score.score:
          seq.variant_hmm = get_or_create_unknown_variant(hist_type=hist_type)
          seq.save()
          best_score.used_for_classification = False
          add_histone_score(
            seq,
            Histone.objects.get(id=hist_type),
            best_hsp,
            best=True)
      except:
        pass
      continue

    taxonomy = taxonomy_from_header(header, accession)
    seq = add_sequence(
      accession,
      get_or_create_unknown_variant(hist_type=hist_type),
      taxonomy,
      header,
      '')
    try:
      best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
      add_histone_score(
        seq,
        Histone.objects.get(id=hist_type),
        best_hsp,
        best=True)
    except:
      pass

#@transaction.atomic # looks like we cannot do it here, since transactions are not atomic in this block
def load_hmm_classification_results(hmmerFile):
  """Save domain hits from a hmmer hmmsearch file into the Panchenko Histone
  Variant DB format.

  Parameters:
  ___________
  hmmerFile : string
    Path to HMMer hmmsearch output file.
  id_file : str
    Path to id file, to extract full lenght GIs
  """
  #TODO: Test method and rewrite description

  for variant_query in tqdm(SearchIO.parse(hmmerFile, "hmmer3-text")):
    log.info("Loading variant: {}".format(variant_query.id))
    variant_model = Variant.objects.get(id=variant_query.id)
    for hit in tqdm(variant_query):
      #Below we are fetching a list of headers if there are multiple headers for identical sequences
      #Technically HUMMER might put the second and on gis in description column.
      #The format should be strictly the genbank format: gi|343434|fafsf gdgfdg gi|65656|534535 fdafaf
      # print("{}-----{}".format(hit.id, hit.description))
      headers = "{} {}".format(hit.id, hit.description).split('\x01')
      load_hmmhsps(headers, hit.hsps, variant_model)

  log.info('Classified {} dequences'.format(Sequence.objects.exclude(variant_hmm__id__startswith='generic').count()))
  # load_generic()
  # delete_unknown()

def load_hmmhsps(headers, hsps, variant_model):
  ###Iterate through high scoring fragments.
  if variant_model.id == 'H2A.Z':
      log.error('Variant H2A.Z has bitscores: {}'.format([hsp.bitscore for hsp in hsps]))
  for hsp in hsps:
    # Compare bit scores
    hmmthreshold_passed = hsp.bitscore >= variant_model.hmmthreshold
    ##Iterate through headers of identical sequences.
    for header in headers:
      # to distinct accession from description and if accession is like pir||S24178 get S24178
      accession = header.split(" ")[0]

      seqs = Sequence.objects.filter(id=accession)
      if len(seqs) <= 0:
        log.error("New sequence is found: {}. This is strange.".format(accession))
        continue

      # Now if loaded bit score is greater than current, reassign variant and update scores. Else, append score
      seq = seqs.first()
      if (seq.reviewed == True):
        continue  # we do not want to alter a reviewed sequence!

      if not hmmthreshold_passed:
        add_score(seq, variant_model, hsp, best=hmmthreshold_passed)
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
          add_score(seq, variant_model, hsp, best=True)
        else:
          add_score(seq, variant_model, hsp, best=False)
      else:
        # No previous model passed the threshold, it is the first
        seq.variant_hmm = variant_model
        seq.save()
        add_score(seq, variant_model, hsp, best=True)

def load_generic():
  for hist_type in ['H2A', 'H2B', 'H3', 'H4', 'H1']:
    unknown_model = get_or_create_unknown_variant(hist_type=hist_type)
    unknown_model_sequences = unknown_model.sequences.all()
    log.info("Found %d seqs where HMMsearch found a hit but did not pass threshold for %s" % (
      unknown_model_sequences.count(), hist_type))
    if unknown_model_sequences.count() <= 0: continue
    variant_model = Variant(hist_type=Histone.objects.get(id=hist_type), id="generic_{}".format(hist_type))
    variant_model.save()
    for unknown_model_seq in unknown_model_sequences:
      unknown_model_seq.variant_hmm = variant_model
      unknown_model_seq.save()
    log.info("Classified %d seqs as generic %s" % (unknown_model_sequences.count(), hist_type))

def load_generic_scores_1():
  for hist_type in ['H2A', 'H2B', 'H3', 'H4', 'H1']:
    generic_model = get_or_create_unknown_variant(hist_type=hist_type)
    generic_model_sequences = generic_model.sequences.all()
    log.info("Found %d seqs where HMMsearch found a hit but did not pass threshold for %s and classified as generic" % (
      generic_model_sequences.count(), hist_type))
    for generic_model_seq in generic_model_sequences:
      hist_score = generic_model_seq.histone_model_scores.first()
      score = ScoreHmm(
        sequence=generic_model_seq,
        variant_hmm=generic_model,
        score=hist_score.score,
        evalue=hist_score.evalue,
        above_threshold=False,
        hmmStart=hist_score.hmmStart,
        hmmEnd=hist_score.hmmEnd,
        seqStart=hist_score.seqStart,
        seqEnd=hist_score.seqEnd,
        used_for_classification=False, # Here
        regex=False,
      )
      score.save()
    # log.info("Classified %d seqs as generic %s" % (generic_model_sequences.count(), hist_type))

def load_generic_scores():
  for hist_type in ['H2A', 'H2B', 'H3', 'H4', 'H1']:
    generic_model = get_or_create_unknown_variant(hist_type=hist_type)
    generic_model_sequences = generic_model.sequences.all()
    log.info("Found %d seqs where HMMsearch found a hit but did not pass threshold for %s" % (
      generic_model_sequences.count(), hist_type))
    for generic_model_seq in generic_model_sequences:
      # log.info(generic_model_seq.histone_model_scores.count())
      if generic_model_seq.reviewed: continue
      # if generic_model_seq.all_model_hmm_scores.filter(variant_hmm=generic_model).count() > 0: continue
      try:
        add_generic_score(generic_model_seq, generic_model, generic_model_seq.histone_model_scores.first())
      except:
        pass
    log.info("Classified %d seqs as generic %s" % (generic_model_sequences.count(), hist_type))

def delete_unknown():
  # Delete 'unknown' records that were found by HMMsearch but did not pass threshold
  unknown_model = get_or_create_unknown_variant(hist_type='Unknown')
  log.warning('Deleting %d seqs where HMMsearch found a hit but did not pass threshold and did not classified'%unknown_model.sequences.all().count())
  unknown_model.sequences.all().delete()
  unknown_model.delete()
  unknown_model_histone = get_or_create_unknown_histone()
  unknown_model_histone.delete()

def add_sequence(accession, variant_model, taxonomy, header, sequence):
  """Add sequence into the database, autfilling empty Parameters"""
  seq = Sequence(
    id       = accession,
    variant_hmm  = variant_model,
    gene     = None,
    splice   = None,
    taxonomy = taxonomy,
    header   = header[:250],
    sequence = str(sequence).replace("-", "").upper(),
    reviewed = False,
    )
  seq.save()
  return seq

def add_score(seq, variant_model, hsp, best=False):
  """Add score for a given sequence"""
  # score_num = ScoreHmm.objects.count()+1
  score = ScoreHmm(
    # id                      = score_num,
    sequence                = seq,
    variant                 = variant_model,
    score                   = hsp.bitscore,
    evalue                  = hsp.evalue,
    above_threshold         = hsp.bitscore >= variant_model.hmmthreshold,
    hmmStart                = hsp.query_start,
    hmmEnd                  = hsp.query_end,
    seqStart                = hsp.hit_start,
    seqEnd                  = hsp.hit_end,
    used_for_classification = best,
    regex                   = False,
    )
  score.save()
  return score

def add_histone_score(seq, histone_model, hsp, best=False):
  """Add score for a given sequence"""
  score = ScoreForHistoneType(
    sequence                = seq,
    histone                 = histone_model,
    score                   = hsp.bitscore,
    evalue                  = hsp.evalue,
    hmmStart                = hsp.query_start,
    hmmEnd                  = hsp.query_end,
    seqStart                = hsp.hit_start,
    seqEnd                  = hsp.hit_end,
    used_for_classification = best,
    regex                   = False,
    )
  score.save()
  return score

def add_generic_score(seq, generic_model, hist_score):
  score = ScoreHmm(
    sequence=seq,
    variant=generic_model,
    score=hist_score.score,
    evalue=hist_score.evalue,
    above_threshold=False,
    hmmStart=hist_score.hmmStart,
    hmmEnd=hist_score.hmmEnd,
    seqStart=hist_score.seqStart,
    seqEnd=hist_score.seqEnd,
    used_for_classification=True,
    regex=False,
  )
  score.save()
  return score


def get_many_prot_seqrec_by_accession(accession_list):
    """
    Download a dictionary of fasta SeqsRec from NCBI given a list of ACCESSIONs.
    """

    log.info("Downloading FASTA SeqRecords by ACCESSIONs from NCBI")
    num=len(accession_list)
    fasta_seqrec=dict()

    for i in range(int(num/1000)+1):
      log.info("Fetching %d th thousands from %d"%(i,num))

      for j in range(10):
        try:
            strn = ",".join(map(str,accession_list)[i*1000:(i+1)*1000])
            # request=Entrez.epost(db="protein",id=strn)
            # result=Entrez.read(request)
            # webEnv=result["WebEnv"]
            # queryKey=result["QueryKey"]
            # handle=Entrez.efetch(db="protein",rettype='gb',retmode='text',webenv=webEnv, query_key=queryKey)
            handle=Entrez.efetch(db="protein",id=strn,rettype='gb',retmode='text')
            for r in SeqIO.parse(handle,'gb'):
                # log.info('::DEBUG::load_hmmsearch:: r')
                # log.info('{}\n'.format(r))
                # fasta_seqrec[r.id.split('|')[1]]=r
                fasta_seqrec[r.id]=r
        except:
            log.warning("Unexpected error: {}. Retrying.".format(sys.exc_info()[0]))
            if(j==9):
              log.error("10 Retry attemps failed !!!! Proceeding, but some seqs are likely lost!!!")
            continue
        if((len(fasta_seqrec)==(i+1)*1000) or (len(fasta_seqrec)==num)):
          #Unfortunately as of March 2020 the eutil api is quite ustable with respect to PDBids with small letters
          #E.g. 6HKT_U , 6HKT_U are different ids. But eutils may retun 6HKT_UU, or return nothing and it depends on the orther of running the commands!!!
            break
        else:
            log.info("Mismatch: {} {}".format(num, len(fasta_seqrec)))
    log.info("FASTA Records downloaded: {}".format(len(fasta_seqrec)))
    return(fasta_seqrec)



