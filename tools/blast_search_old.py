import os
import sys
import subprocess
import io
import logging

#BioPython
from Bio import SeqIO, SearchIO
from Bio.Blast.Applications import NcbiblastpCommandline
from Bio.Blast import NCBIXML
from Bio.Seq import Seq
from Bio import Entrez

#Django libraires
from django.db.models import Max
from django.db.utils import IntegrityError
from django.db import close_old_connections
from django.conf import settings
from django.db import transaction

#Custom librairies
from tools.taxonomy_from_accessions import taxonomy_from_header, easytaxonomy_from_header, taxonomy_from_accessions, update_taxonomy


from tqdm import tqdm
import pickle

from browse.models import *
from djangophylocore.models import Taxonomy

class InvalidFASTA(Exception):
    pass

log = logging.getLogger(__name__)

def make_blastp(sequences, save_to):

  if not isinstance(sequences, list):
    sequences = [sequences]

  blastp =  os.path.join(os.path.dirname(sys.executable), "blastp")
  # output = os.path.join("/", "tmp", "{}.xml".format(uuid.uuid4()))
  blastp_cline = NcbiblastpCommandline(
    cmd=blastp,
    db=os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "HistoneDB_sequences.fa"),
    evalue=0.004, outfmt=5)
  result, error = blastp_cline(stdin="\n".join([s.format("fasta") for s in sequences]))

  with open(save_to, 'w') as f:
    f.write(result)

  log.info('Blast results saved to {}'.format(save_to))

def load_blast_search_diagnosis(blastFile_name):
  # blastFile = io.StringIO()
  # blastFile.write(blastp_result)
  # blastFile.seek(0)
  blastFile = open(blastFile_name)
  # log.info('Loaded Blast results from {}'.format(blastFile_name))

  for i, blast_record in enumerate(NCBIXML.parse(blastFile)):
    query_split = blast_record.query.split('|')
    if len(query_split) == 3:
      accession = query_split[0]
    else:
      accession = '|'.join(query_split[:3])
      log.info('Non-standard accession {} got from {}'.format(accession, blast_record.query))
    # accession = blast_record.query.split('|')[0]
    # log.info('Loading {}: {}'.format(accession, blast_record.query))
    if len(blast_record.alignments) == 0:
      raise InvalidFASTA("No blast hits for {}.".format(blast_record.query))
    for alignment in blast_record.alignments:
      variant_model = Variant.objects.get(id=alignment.hit_def.split("|")[2])
      # log.info('Alignment of variant {}'.format(alignment.hit_def))
      load_blasthsps_diagnosis(accession, blast_record.query, alignment.hsps, variant_model, alignment.hit_def.split("|")[0])

    # if i%10000==0:
    #   log.info('Loaded {} BlastRecords'.format(i))

def add_sequence(accession, variant_model):
  """Add sequence into the database, autfilling empty Parameters"""
  seq = SequenceBlast(
    id       = accession,
    variant  = variant_model,
    )
  seq.save()
  return seq

def add_score(seq_blast, variant_model, hsp, hit_accession, best=False):
  """Add score for a given sequence"""
  score = ScoreBlast(
    # id                      = score_num,
    sequence                = seq_blast,
    variant                 = variant_model,
    score                   = hsp.score,
    bitScore                = hsp.bits,
    evalue                  = hsp.expect,
    blastStart              = hsp.query_start,
    blastEnd                = hsp.query_end,
    seqStart                = hsp.sbjct_start,
    seqEnd                  = hsp.sbjct_end,
    align_length            = hsp.align_length,
    match                   = hsp.match,
    hit_accession           = hit_accession,
    used_for_classification = best,
    )
  score.save()

def load_blasthsps_diagnosis(accession, header, hsps, variant_model, hit_accession):
  ###Iterate through high scoring fragments.
  for hsp in hsps:
    seqs_blast = SequenceBlast.objects.filter(id=accession)
    if len(seqs_blast) > 0:
      seq_blast = seqs_blast.first()
      best_scores = seq_blast.all_model_scores.filter(used_for_classification=True)
      if len(best_scores) > 0:
        ##Sequence have passed the threshold for one of previous models.
        best_score = best_scores.first()
        if hsp.score > best_score.score:
          # best scoring
          seq_blast.variant = variant_model
          best_score_2 = ScoreBlast.objects.get(id=best_score.id)
          best_score_2.used_for_classification = False
          best_score_2.save()
          seq_blast.save()
          # print "UPDATED VARIANT"
          add_score(seq_blast, variant_model, hsp, hit_accession, best=True)
        else:
          add_score(seq_blast, variant_model, hsp, hit_accession, best=False)
      else:
        # No previous model passed the threshold, it is the first
        seq_blast.variant = variant_model
        seq_blast.save()
        add_score(seq_blast, variant_model, hsp, hit_accession, best=True)
    else:
      # log.error("New Sequence found for {}".format(header))
      ##A new sequence is found that passed treshold.
      try:
        seq_blast = add_sequence(
          accession,
          variant_model)
        add_score(seq_blast, variant_model, hsp, hit_accession, best=True)
      except IntegrityError as e:
        log.error("Error adding sequence {}".format(seq_blast))

def load_blast_search(blastFile_name):
  blastFile = open(blastFile_name)
  # log.info('Loaded Blast results from {}'.format(blastFile_name))

  for i, blast_record in enumerate(NCBIXML.parse(blastFile)):
    if len(blast_record.alignments) == 0:
      # log.info("No blast hits for {} with e-value {}".format(blast_record.query, blast_record.descriptions[0]))
      log.info("No blast hits for {}".format(blast_record.query))
      # raise InvalidFASTA("No blast hits for {}.".format(blast_record.query))
      continue

    query_split = blast_record.query.split('|')
    if len(query_split) == 3:
      accession = query_split[0]
    else:
      accession = '|'.join(query_split[:3])
      log.info('Non-standard accession {} got from {}'.format(accession, blast_record.query))

    best_alignment = blast_record.alignments[0]
    best_hsp = get_best_hsp(best_alignment.hsps)
    for alignment in blast_record.alignments[1:]:
      best_alignment_hsp = get_best_hsp(alignment.hsps)
      if best_alignment_hsp.score > best_hsp.score:
        best_alignment = alignment
        best_hsp = best_alignment_hsp

    variant_model = Variant.objects.get(id=best_alignment.hit_def.split("|")[2])
    seq_blast = add_sequence(accession, variant_model)
    # log.info('Hit accession {}'.format(best_alignment.hit_def))
    add_score(seq_blast, variant_model, best_hsp, best_alignment.hit_def.split("|")[0], best=True)

def get_best_hsp(hsps):
  best_alignment_hsp = hsps[0]
  for hsp in hsps[1:]:
    if hsp.score > best_alignment_hsp.score:
      best_alignment_hsp = hsp
  return best_alignment_hsp