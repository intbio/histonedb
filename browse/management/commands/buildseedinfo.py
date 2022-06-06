import os, configparser, logging, json, shutil

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

from tools.L_shade_hist_aln import write_alignments
from tools.hist_ss import get_features_in_aln

from Bio import SeqIO
from Bio.Align import MultipleSeqAlignment
from Bio.Align.AlignInfo import SummaryInfo

from browse.models import Sequence

config = configparser.ConfigParser()
config.read('./histonedb.ini')

class Command(BaseCommand):
    help = 'Reset sequence features'
    seed_directory = config['WEB_DATA']['seeds']
    # seed_directory = os.path.join(settings.STATIC_ROOT_AUX, "browse", "seeds_oldversion")

    # Logging info
    logging.basicConfig(filename=os.path.join(config['LOG']['database_log'], "buildseedinfo.log"),
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
            help="Force the creation of PDFs, GFFs even if the files exist")
        
    def handle(self, *args, **options):
        self.log.info('=======================================================')
        self.log.info('===               buildseedinfo START               ===')
        self.log.info('=======================================================')

        if options["force"]:
            if os.path.exists(self.seed_directory) and os.path.isdir(self.seed_directory):
                shutil.rmtree(self.seed_directory)
            # shutil.copytree(os.path.join(config['DATA']['directory'], 'seeds'), self.seed_directory)
            shutil.copytree(os.path.join(config['DATA']['directory'], 'draft_seeds'), self.seed_directory)

        save_dir = os.path.join("tmp", "HistoneDB")
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        for variant, seed_variant in self.get_variants():
            #PDF currently contaminates the dir with many files.
            #if not os.path.exists("{}.pdf".format(seed[:-6])) or options["force"]:
                #Write PDF
                #write_alignments([seed], seed[:-6], save_dir=os.path.dirname(seed))

            if variant=='cH3': variant='cH3_(Metazoa)' ## This is for training because there is no cH3 yet
            seed = os.path.join(self.seed_directory, seed_variant)
            if not os.path.exists(f"{seed}.gff") or options["force"]:
                #Write GFF
                self.log.info(f"writing gff for {variant} to {seed}.gff")
                with open(f"{seed}.gff", "w") as gff:
                    if not os.path.exists(f"{seed}.fasta"): continue  ## This is for training because there is no some sequences yet
                    seqs = list(SeqIO.parse(f'{seed}.fasta', "fasta"))
                    if len(seqs) < 1: continue  ## This is for training because there is no some sequences yet
                    msa = MultipleSeqAlignment(seqs)
                    self.log.info("Making features for variant: %s", variant)
                    print(get_features_in_aln(msa, variant, save_dir=self.seed_directory), file=gff)

            #Set reviewed to True
            not_found = {}
            for num_seq, s in enumerate(SeqIO.parse(f'{seed}.fasta', "fasta")):
                fields = s.description.split()
                id = fields[1]
                try:
                    s = Sequence.objects.get(id=str(id), variant__id=variant)
                    s.reviewed = True
                    s.save()
                except Sequence.DoesNotExist:
                    try:
                        not_found[variant].append(id)
                    except KeyError:
                        not_found[variant] = [id]
            self.log.warning(not_found)

        self.log.info('=======================================================')
        self.log.info('===       buildseedinfo SUCCESSFULLY finished       ===')
        self.log.info('=======================================================')

    def get_variants(self, dl=None, hist_type=True):
        if not dl:
            with open(config['DATA']['variants'], encoding='utf-8') as f:
                dl = json.load(f)['tree']
        if isinstance(dl, dict):
            if hist_type:
                variants = [(f'generic_{hist}', hist) if hist=='H1' else (f'c{hist}', hist) for hist in dl.keys()]
            else:
                variants = [(variant, variant) for variant in dl.keys()]
            for dv in dl.values():
                variants += self.get_variants(dl=dv, hist_type=False)
            return variants
        return []
