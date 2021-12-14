from django.core.management.base import BaseCommand, CommandError
from browse.models import *
from django.conf import settings

from Bio import SeqIO

import os
import sys
import subprocess
import logging
from cProfile import Profile

class Command(BaseCommand):
    help = 'Build the blast database used to analyze custom sequences.'

    def add_arguments(self, parser):
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
        """Create new BLAST databse with seuqences in the HistoneDB."""

        seqs_file = os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "HistoneDB_sequences.fa")
        with open(seqs_file, "w") as seqs:
            for s in Sequence.objects.filter(reviewed=True): #here we restrict the blast DB to reviewed seqs
                # Do we need generics?
                if 'generic' in s.variant.id: continue
                SeqIO.write(s.to_biopython(ungap=True), seqs, "fasta")

        makeblastdb = os.path.join(os.path.dirname(sys.executable), "makeblastdb")
        subprocess.call(["makeblastdb", "-in", seqs_file, "-dbtype", "prot","-title", "HistoneDB"])

    # def _handle(self, *args, **options):
    #     """Create new BLAST databse with seuqences in the HistoneDB."""
    #
    #     for hist_type in ['H1', 'H2A', 'H2B', 'H3', 'H4']:
    #         seqs_file = os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "HistoneDB_sequences_{}.fa".format(hist_type))
    #         with open(seqs_file, "w") as seqs:
    #             for s in Sequence.objects.filter(reviewed=True, variant__hist_type=hist_type): #here we restrict the blast DB to reviewed seqs
    #                 # Do we need generics?
    #                 if 'generic' in s.variant.id: continue
    #                 SeqIO.write(s.to_biopython(ungap=True), seqs, "fasta")
    #
    #         makeblastdb = os.path.join(os.path.dirname(sys.executable), "makeblastdb")
    #         subprocess.call(["makeblastdb", "-in", seqs_file, "-dbtype", "prot","-title", "HistoneDB"])

    def handle(self, *args, **options):
        if options['profile']:
            profiler = Profile()
            profiler.runcall(self._handle, *args, **options)
            profiler.print_stats()
        else:
            self._handle(*args, **options)

