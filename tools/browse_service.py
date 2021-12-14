# -*- coding: utf-8 -*-
"""
Created on Mon Jun 28 18:05:50 2021

@author: preety
This script determines main paths used for browse app.

"""

from django.conf import settings
import pandas as pd

import os
import logging
import subprocess
from datetime import date, datetime

from browse.models import *

from tools.taxonomy_from_accessions import taxonomy_from_header

log = logging.getLogger(__name__)

# Working paths
LOG_DIRECTORY                       = os.path.join("log")
LOG_DB_STAT_DIRECTORY               = os.path.join("log", "db_stat")
SEED_DIRECTORY                      = os.path.join(settings.STATIC_ROOT_AUX, "browse", "seeds")
FOLD_SEED_DIRECTORY                 = os.path.join(settings.STATIC_ROOT_AUX, "browse", "seeds_fold")
HMM_DIRECTORY                       = os.path.join(settings.STATIC_ROOT_AUX, "browse", "hmms")
BLAST_DIRECTORY                     = os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast")
BLASTDBS_DIR                        = os.path.join(BLAST_DIRECTORY, 'blastdbs')

CURATED_ALL_FASTA                   = os.path.join(HMM_DIRECTORY, 'model_evaluation',"curated.fasta")
CURATED_GENERICLESS_FASTA           = os.path.join(HMM_DIRECTORY, 'model_evaluation', "curated_genericless.fasta")
CURATED_GENERIC_FASTA               = os.path.join(HMM_DIRECTORY, 'model_evaluation', "curated_generic.fasta")
# file for combined sequences by hi st_types
COMBINED_HMM_HISTTYPES_FILE         = os.path.join(HMM_DIRECTORY, "combined_hmm", "histone_types.hmm")
# file for combined sequences by va riants
COMBINED_HMM_VARIANTS_FILE          = os.path.join(HMM_DIRECTORY, "combined_hmm", "histone_variants.hmm")
DB_HISTTYPE_RESULTS_FILE            = os.path.join(HMM_DIRECTORY, "results", "histone_type", "search{}.out")
CURATED_HISTTYPE_RESULTS_FILE       = os.path.join(HMM_DIRECTORY, "results", "histone_type", "curated_search.out")
DB_HISTTYPE_PARSED_RESULTS_FILE     = os.path.join(HMM_DIRECTORY, "results", "histone_type", "search_parsed{}.csv")
IDS_FILE                            = os.path.join(HMM_DIRECTORY, "results", "histone_type", "extracted_sequences{}.ids")
FULL_LENGTH_SEQS_FILE               = os.path.join(HMM_DIRECTORY, "results", "histone_type", "HistoneDB_sequences{}.fasta")
DB_HISTVARIANTS_HMM_RESULTS_FILE    = os.path.join(HMM_DIRECTORY, "results", "histone_variants", "search{}.out")
CURATED_HISTVAR_RESULTS_FILE        = os.path.join(HMM_DIRECTORY, "results", "histone_variants", "curated_search.out")
CURATED_GEN_HISTVAR_RESULTS_FILE    = os.path.join(HMM_DIRECTORY, "results", "histone_variants", "curated_generic_search.out")
MODEL_EVALUATION                    = os.path.join(HMM_DIRECTORY, "model_evaluation")
TYPE_CLASSIFICATION_REPORT_FILE     = os.path.join(MODEL_EVALUATION, "type_classification_report.txt")
BLASTDB_FILE                        = os.path.join(BLASTDBS_DIR, "BLASTDB_sequences_{}.fa")
DB_HISTVARIANTS_BLAST_RESULTS_FILE  = os.path.join(BLAST_DIRECTORY, "results", "{}", "blast_search{}.out")
DB_HISTVARIANTS_PARSED_RESULTS_FILE = os.path.join(BLAST_DIRECTORY, "results", "{}", "blast_search_parsed{}.out")
DB_CURATED_BLAST_RESULTS_FILE       = os.path.join(BLAST_DIRECTORY, "model_evaluation", "blast_search_curated_{}.out")


# Parameters for parallel extraction variant sequences from file
# HMMER_PROCS=20 # recommended for large data files
# BLAST_PROCS=25 # recommended for large data
HMMER_PROCS = 4 # recommended for small data files (nearby 14GB)
BLAST_PROCS = 5 # recommended for small random data
SEEDS_FOR_HMM = 'seeds_fold'
CLASSIFICATION_TYPES = ['BLAST'] #['HMM', 'BLAST']
NR_VERSION_FILE = 'NR_VERSION'


# Seeds
def get_seeds(seeds_name='seeds',combined_alignments=False, generic=False):
    """
    Goes through static/browse/seeds directories and returns histone type names and fasta file name of variant (without path).
    If combined_alignments returns histone types as seed and '' as hist_type, additionally to variants
    """
    seed_dir = SEED_DIRECTORY
    if seeds_name == 'seeds_fold':
        seed_dir = FOLD_SEED_DIRECTORY
    for i, (root, _, files) in enumerate(os.walk(seed_dir)):
        hist_type = os.path.basename(root)
        if hist_type == seeds_name and not combined_alignments:  # means we are in top dir, we skip,
            # combinded alignmnents for hist types are their, but we do not use them in database constuction,
            # only in visualization on website
            continue
        elif hist_type == seeds_name:
            hist_type = ""
        for seed in files:
            if not seed.endswith(".fasta") or (not generic and 'generic' in seed): continue
            yield hist_type, seed

# def get_fold_seeds(combined_alignments=False, generic=False):
#     """
#     Goes through static/browse/seeds_fold directories and returns histone type names and fasta file name of variant (without path).
#     If combined_alignments returns histone types as seed and '' as hist_type, additionally to variants
#     If there is no such directory creates new one with cut sequences from static/browse/seeds
#     """
#     if not os.path.exists(FOLD_SEED_DIRECTORY):
#         log.error('{} such directory does not exist'.format(FOLD_SEED_DIRECTORY))
#
#     for i, (root, _, files) in enumerate(os.walk(FOLD_SEED_DIRECTORY)):
#         hist_type = os.path.basename(root)
#         if hist_type == "seeds_fold" and not combined_alignments:  # means we are in top dir, we skip,
#             # combinded alignmnents for hist types are their, but we do not use them in database constuction,
#             # only in visualization on website
#             continue
#         elif hist_type == "seeds_fold":
#             hist_type = ""
#         for seed in files:
#             if not seed.endswith(".fasta") or (not generic and 'generic' in seed): continue
#             yield hist_type, seed


# Algorithm
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

def add_sequence(accession, histone_type_model, taxonomy, header, sequence):
  """Add sequence into the database, autfilling empty Parameters"""
  seq = Sequence(
    id            = accession,
    histone_type  = histone_type_model,
    gene          = None,
    splice        = None,
    taxonomy      = taxonomy,
    header        = header[:250],
    sequence      = str(sequence).replace("-", "").upper(),
    reviewed      = False,
    )
  seq.save()
  return seq

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

def add_hmm_score(seq, variant_model, hsp, best=False):
  """Add score for a given sequence"""
  # score_num = Score.objects.count()+1
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

def add_generic_score(seq, generic_model, hist_score):
  score = ScoreHmm(
    sequence                = seq,
    variant                 = generic_model,
    score                   = hist_score.score,
    evalue                  = hist_score.evalue,
    above_threshold         = False,
    hmmStart                = hist_score.hmmStart,
    hmmEnd                  = hist_score.hmmEnd,
    seqStart                = hist_score.seqStart,
    seqEnd                  = hist_score.seqEnd,
    used_for_classification = True,
    regex                   = False,
  )
  score.save()
  return score

def add_score(seq, variant_model, hsp=None, hit_accession=None, best=False):
    """Add score for a given sequence"""
    if hsp:
        score = Score(
            # id                      = score_num,
            sequence=seq,
            variant=variant_model,
            score=hsp.score,
            bitScore=hsp.bits,
            evalue=hsp.expect,
            identity=hsp.identities,
            positives=hsp.positives,
            blastStart=hsp.query_start,
            blastEnd=hsp.query_end,
            seqStart=hsp.sbjct_start,
            seqEnd=hsp.sbjct_end,
            align_length=hsp.align_length,
            match=hsp.match,
            hit_accession=hit_accession,
            used_for_classification=best,
        )
        score.save()
    else:
        score = Score(
            sequence=seq,
            variant=variant_model,
            score=.000001,
            bitScore=None,
            evalue=.011,
            blastStart=None,
            blastEnd=None,
            seqStart=None,
            seqEnd=None,
            align_length=None,
            used_for_classification=True,
        )
        score.save()


# Statistics
def get_stats(start_time, filename=''):
    log.info('Outputting statistics file ...')

    with open(NR_VERSION_FILE, 'r') as nrv:
        db_file = nrv.read()

    now = datetime.now()
    dt_string = now.strftime("%Y%m%d-%H%M%S")
    if not os.path.exists(LOG_DB_STAT_DIRECTORY):
        os.makedirs(LOG_DB_STAT_DIRECTORY)
    with open(os.path.join(LOG_DB_STAT_DIRECTORY, "_".join([filename, dt_string])), 'w') as f:
        f.write("Variant database regeneration stitics\n")
        f.write("DB regen start time: %s \n" % start_time)
        f.write("DB regen end time: %s\n" % now)
        f.write("Time taken for regeneration of variants: %f mins\n" % (
                float((now - start_time).total_seconds()) / 60.))
        f.write("Parallel threads used %d\n" % HMMER_PROCS)
        f.write("DB file used: %s\n" % db_file)
        f.write(subprocess.check_output(['ls', '-l', db_file]).decode("utf-8") + "\n")

        f.write('--------------------------\n')
        f.write('---Database statistics----\n')
        f.write('--------------------------\n')
        f.write('Total seqs = %d\n' % Sequence.objects.all().count())
        f.write('Reviewed seqs = %d\n' % Sequence.objects.filter(reviewed=True).count())
        f.write('Automatic seqs = %d\n' % Sequence.objects.filter(reviewed=False).count())

        f.write('\n------------------------------------------\n')
        f.write('---Histone type classification via hmm----\n')
        f.write('------------------------------------------\n')
        f.write('---Histone type statistics----\n')
        f.write('Type        | Total  |Reviewed|  Auto  \n')
        for h in Histone.objects.all():
            tot = Sequence.objects.filter(histone_type=h).count()
            rev = Sequence.objects.filter(histone_type=h, reviewed=True).count()
            auto = Sequence.objects.filter(histone_type=h, reviewed=False).count()
            f.write('%12s|%8d|%8d|%8d\n' % (h.id, tot, rev, auto))

        f.write('\n---------------------------------------------\n')
        f.write('---Histone variant classification via hmm----\n')
        f.write('---------------------------------------------\n')
        f.write('---Histone type statistics----\n')
        f.write('Type        | Total  |Reviewed|  Auto  \n')
        for h in Histone.objects.all():
            tot = Sequence.objects.filter(variant_hmm__hist_type=h).count()
            rev = Sequence.objects.filter(variant_hmm__hist_type=h, reviewed=True).count()
            auto = Sequence.objects.filter(variant_hmm__hist_type=h, reviewed=False).count()
            f.write('%12s|%8d|%8d|%8d\n' % (h.id, tot, rev, auto))

        f.write('\n---Histone variant statistics----\n')
        f.write('Variant     | Total  |Reviewed|  Auto  \n')
        for v in Variant.objects.all():
            tot = Sequence.objects.filter(variant_hmm=v).count()
            rev = Sequence.objects.filter(variant_hmm=v, reviewed=True).count()
            auto = Sequence.objects.filter(variant_hmm=v, reviewed=False).count()
            f.write('%12s|%8d|%8d|%8d\n' % (v.id, tot, rev, auto))

        f.write('\n-----------------------------------------------\n')
        f.write('---Histone variant classification via blast----\n')
        f.write('-----------------------------------------------\n')
        f.write('---Histone type statistics----\n')
        f.write('Type        | Total  |Reviewed|  Auto  \n')
        for h in Histone.objects.all():
            tot = Sequence.objects.filter(variant__hist_type=h).count()
            rev = Sequence.objects.filter(variant__hist_type=h, reviewed=True).count()
            auto = Sequence.objects.filter(variant__hist_type=h, reviewed=False).count()
            f.write('%12s|%8d|%8d|%8d\n' % (h.id, tot, rev, auto))

        f.write('\n---Histone variant statistics----\n')
        f.write('Variant     | Total  |Reviewed|  Auto  \n')
        for v in Variant.objects.all():
            tot = Sequence.objects.filter(variant=v).count()
            rev = Sequence.objects.filter(variant=v, reviewed=True).count()
            auto = Sequence.objects.filter(variant=v, reviewed=False).count()
            f.write('%12s|%8d|%8d|%8d\n' % (v.id, tot, rev, auto))
