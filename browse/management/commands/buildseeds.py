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
            "-f",
            "--force",
            default=False,
            action="store_true",
            help="Force the regeneration of HMM from seeds, HUMMER search in db_file, Test models and loading of results to database")

        parser.add_argument(
            "--acc",
            dest="accessions_file",
            default="accessions",
            help="Specify the accessions file, by default will use accessions")

        parser.add_argument(
            "--out_dir",
            dest="output_dir",
            default="accessions",
            help="Specify the accessions file, by default will use accessions")

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
        self.log.info('===               buildseeds START                  ===')
        self.log.info('=======================================================')
        self.accessions_file = options['accessions_file']
        if options['output_dir']: self.seed_dir = options['output_dir']
        else: self.seed_dir = SEED_DIRECTORY
        if not os.path.exists(seed_dir):
            os.makedirs(seed_dir)
        accessions_df = pd.read_csv(self.accessions_file).fillna('')
        for i, row in accessions_df.iteritems(): #for hist_var, hist_type, f in get_gis():
            print("##########Starting", hist_var, hist_type, f)
            if not os.path.exists(os.path.join("draft_seeds", hist_type)):
                os.makedirs(os.path.join("draft_seeds", hist_type))
            gis = read_gis(os.path.join("gis", hist_type, f))
            seqrecs = get_prot_seqrec_by_gis(gis)
            msa = muscle_aln(seqrecs)
            print(msa)
            msa_r = refactor_title(msa, hist_var)
            msa_r.sort()
            print(msa_r)
            AlignIO.write(msa_r, os.path.join("draft_seeds", hist_type, hist_var + ".fasta"), 'fasta')
        # combines MSA
        for hist_type in ['H2A', 'H2B', 'H3', 'H4', 'H1']:
            seqrecs = []
            for hist_var, hist_type, f in get_gis(hist_type):
                seqrecs += list(SeqIO.parse("draft_seeds/" + hist_type + "/" + hist_var + ".fasta", "fasta"))
            ungseqrecs = {}
            for s in seqrecs:
                ungseqrecs[s.id] = SeqRecord(id=s.id, description=s.description, seq=s.seq.ungap("-"))
            # print ungseqrecs
            msa = muscle_aln(ungseqrecs)
            msa_r = refactor_title_allmsa(msa)

            msa_r.sort()
            AlignIO.write(msa_r, os.path.join("draft_seeds", hist_type + ".fasta"), 'fasta')
        self.log.info('=======================================================')
        self.log.info('===        buildseeds SUCCESSFULLY finished         ===')
        self.log.info('=======================================================')

    def handle(self, *args, **options):
        if options['profile']:
            profiler = Profile()
            profiler.runcall(self._handle, *args, **options)
            profiler.print_stats()
        else:
            self._handle(*args, **options)