import os, logging, configparser, json
import pandas as pd
from django.core.management.base import BaseCommand, CommandError

from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord

from browse.models import Variant, Sequence
from djangophylocore.models import Taxonomy

config = configparser.ConfigParser()
config.read('./histonedb.ini')


class Command(BaseCommand):
    help = 'Reset sequence features'

    # Logging info
    logging.basicConfig(filename=os.path.join(config['LOG']['database_log'], "loadcurated.log"),
                        format='%(asctime)s %(name)s %(levelname)-8s %(message)s',
                        level=logging.INFO,
                        datefmt='%Y-%m-%d %H:%M:%S')
    log = logging.getLogger(__name__)

    def add_arguments(self, parser):
        parser.add_argument(
            "--profile",
            default=False,
            action="store_true",
            help="Profile the command")

    def _handle(self, *args, **options):
        self.log.info('=======================================================')
        self.log.info('===               loadcurated START                 ===')
        self.log.info('=======================================================')

        Sequence.objects.all().delete()

        sequences = pd.read_csv(config['DATA']['histones'], sep=',', quotechar='"', engine='python').fillna('')
        sequences['taxonomy_id'] = sequences['taxonomy_id'].astype(str)
        sequences.index = list(sequences['accession'])

        for i, row in sequences.iterrows():
            self.log.info(f"Creating sequence {row['accession']}...")
            s = Sequence.objects.create(id=row['accession'],
                                        variant=Variant.objects.get(id=row['variant']),
                                        gene=int(row['ncbi_gene_id']) if row['ncbi_gene_id'] != '' else None,
                                        taxonomy_id=int(row['taxonomy_id']) if row['taxonomy_id'] != '' else None,
                                        header=f"CURATED SEQUENCE: {row['accession']} type: {row['type']}, variant: {row['variant']}, organism: {row['organism']}",
                                        sequence=row['sequence'],
                                        reviewed=True)
            self.log.info(f"Sequence {row['accession']} was created in database with id {s.id}.")

        self.log.info('=======================================================')
        self.log.info('===       loadcurated SUCCESSFULLY finished         ===')
        self.log.info('=======================================================')

    def handle(self, *args, **options):
        if options['profile']:
            from cProfile import Profile
            profiler = Profile()
            profiler.runcall(self._handle, *args, **options)
            profiler.print_stats()
        else:
            self._handle(*args, **options)

