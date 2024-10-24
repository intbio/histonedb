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
  for variant_query in tqdm(SearchIO.parse(hmmerFile, "hmmer3-text")):
    log.info("Loading variant: {}".format(variant_query.id))
    variant_model = Variant.objects.get(id=variant_query.id)
    for hit in tqdm(variant_query):
      #Save original header to extract full sequence
      hit_ids.add(hit.id)

      #Below we are fetching a list of headers if there are multiple headers for identical sequences
      #Technically HUMMER might put the second and on gis in description column.
      #The format should be strictly the genbank format: gi|343434|fafsf gdgfdg gi|65656|534535 fdafaf
      # print("{}-----{}".format(hit.id, hit.description))
      headers = "{} {}".format(hit.id, hit.description).split('\x01')
      load_hmmhsps(headers, hit.hsps, variant_model)

  #Save original header to extract full sequence
  ids = open(id_file, "w")
  for idit in hit_ids:
    print(idit, file=ids)
  ids.close()

  log.info("From file %s we got %d sequences"%(hmmerFile,len(hit_ids)))

  unknown_model = get_or_create_unknown_variant()
  log.info("Deleting %d seqs where HMMsearch found a hit but did not pass threshold"%(unknown_model.sequences.all().count()))

  #Delete 'unknown' records that were found by HMMsearch but did not pass threshold
  unknown_model.sequences.all().delete()
  unknown_model.delete()

  log.info("Initiating taxonomy update for %d seqs where it is not identified"%(Sequence.objects.filter(taxonomy__name="unidentified").count()))

  #Now let's lookup taxid for those we could not pare from header using NCBI eutils.
  update_taxonomy(Sequence.objects.filter(taxonomy__name="unidentified").values_list("id", flat=True))

def get_or_create_unknown_variant():
  # We need unknown Variant model - to assign to those that do not pass the threshold for analyzed models,
  # but are waiting if they will be pass threhold with other models.
  # at while searching

  try:
    unknown_model = Variant.objects.get(id="Unknown")
  except Variant.DoesNotExist:
    try:
      hist_unknown = Histone.objects.get(id="Unknown")
    except:
      hist_unknown = Histone("Unknown")
      hist_unknown.save()
    unknown_model = Variant(hist_type=hist_unknown, id="Unknown")
    unknown_model.save()
  return unknown_model

def load_hmmhsps(headers, hsps, variant_model):
  ###Iterate through high scoring fragments.
  for hsp in hsps:
    hmmthreshold_passed = hsp.bitscore >= variant_model.hmmthreshold
    ##Iterate through headers of identical sequences.
    for header in headers:
      # to distinct accession from description and if accession is like pir||S24178 get S24178
      accession = header.split(" ")[0]

      seqs = Sequence.objects.filter(id=accession)
      if len(seqs) > 0:
        # Sequence already exists. Compare bit scores, if loaded bit score is
        # greater than current, reassign variant and update scores. Else, append score
        seq = seqs.first()
        if (seq.reviewed == True):
          continue  # we do not want to alter a reviewed sequence!
        # print "Already in database", seq

        if not hmmthreshold_passed:
          add_score(seq, variant_model, hsp, best=hmmthreshold_passed)
          continue

        best_scores = seq.all_model_scores.filter(used_for_classification=True)
        if len(best_scores) > 0:
          ##Sequence have passed the threshold for one of previous models.
          best_score = best_scores.first() # Why we extract first?
          # Comment from Preety: if we have already passed best_scores,
          # that means hsp.bitscore bits variant_model.hmmthreshold
          # We do not need to check again
          if hsp.bitscore > best_score.score:
            # best scoring
            seq.variant = variant_model
            seq.sequence = str(hsp.hit.seq)
            best_score_2 = ScoreHmm.objects.get(id=best_score.id)
            best_score_2.used_for_classification = False
            best_score_2.save()
            seq.save()
            # print "UPDATED VARIANT"
            add_score(seq, variant_model, hsp, best=True)
          else:
            add_score(seq, variant_model, hsp, best=False)
        else:
          # No previous model passed the threshold, it is the first
          seq.variant = variant_model
          seq.sequence = str(hsp.hit.seq)
          seq.save()
          add_score(seq, variant_model, hsp, best=True)
      else:
        ##A new sequence is found that passed treshold.
        taxonomy = taxonomy_from_header(header, accession)
        sequence = Seq(str(hsp.hit.seq))
        try:
          seq = add_sequence(
            accession,
            variant_model if hmmthreshold_passed else get_or_create_unknown_variant(),
            taxonomy,
            header,
            sequence)
          add_score(seq, variant_model, hsp, best=hmmthreshold_passed)
        except IntegrityError as e:
          log.error("Error adding sequence {}".format(seq))
          global already_exists
          already_exists.append(accession)
          continue


def add_sequence(accession, variant_model, taxonomy, header, sequence):
  """Add sequence into the database, autfilling empty Parameters"""
  seq = Sequence(
    id       = accession,
    variant  = variant_model,
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



