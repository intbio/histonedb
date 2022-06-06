import os, logging, configparser, json
from django.core.management.base import BaseCommand, CommandError
from itertools import groupby

from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord

from browse.models import Feature
from djangophylocore.models import Taxonomy

config = configparser.ConfigParser()
config.read('./histonedb.ini')

class Command(BaseCommand):
    help = 'Reset sequence features'
    template_sequences = config['WEB_DATA']['template_sequences']

    # Logging info
    logging.basicConfig(filename=os.path.join(config['LOG']['database_log'], "buildfeatures.log"),
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
        self.log.info('===              buildfeatures START                ===')
        self.log.info('=======================================================')

        Feature.objects.all().delete()

        with open(config['DATA']['features'], encoding='utf-8') as feature_info_file:
            feature_info = json.load(feature_info_file)

        for type_name, variants in feature_info.items():
            self.log.info("Making features for {}".format(type_name))
            # hist_type = Histone.objects.get(id=type_name)
            for variant, info in variants.items():
                self.log.info("Making features for {}".format(variant))
                # if variant.startswith("General"):
                #     variant = "General{}".format(hist_type)

                sequence = str(info["sequence"])
                position_lines = [str(position) for key, position in info.items() if key.startswith("feature") and not key.endswith("info")]
                assert False not in [len(position)==len(sequence) for position in position_lines], "Sequence and feaures must have the same number of characters!\n{}\n{}".format(sequence, "\n".join(position_lines))

                try:
                    taxonomy = Taxonomy.objects.get(name=info.get("taxonomy", "root"))
                except Taxonomy.DoesNotExist:
                    taxonomy = Taxonomy.objects.get(name="root")

                # template, created = TemplateSequence.objects.get_or_create(taxonomy=taxonomy, variant=variant)
                # if not os.path.isfile(template.path()): #we need to rewrite it!!!
                SeqIO.write(
                        SeqRecord(Seq(sequence), id=f"{variant}_{taxonomy.name}"),
                        # template.path(),
                        os.path.join(self.template_sequences, f"{variant}_{taxonomy.name}.fasta"),
                        "fasta"
               )
                used_features = {}
                for positions in position_lines:
                    for feature_name, group in groupby(enumerate(positions), key=lambda x:x[1]):
                        group = list(group)
                        if not feature_name in [" ", "="]:
                            name = info["feature_info"][feature_name]["name"]
                            feature = Feature(
                                id          = "{}_{}{}".format(variant, name, " "+str(used_features.get(name, ""))),
                                # template    = template,
                                variant     = variant,
                                taxonomy    = taxonomy,
                                start       = int(group[0][0]),
                                end         = int(group[-1][0]),
                                name        = name,
                                description = info["feature_info"][feature_name]["description"],
                                color       = info["feature_info"][feature_name]["color"],
                           )
                            feature.save()
                            try:
                                used_features[name] += 1
                            except KeyError:
                                used_features[name] = 1

        self.log.info('=======================================================')
        self.log.info('===      buildfeatures SUCCESSFULLY finished        ===')
        self.log.info('=======================================================')

    def handle(self, *args, **options):
        if options['profile']:
            from cProfile import Profile
            profiler = Profile()
            profiler.runcall(self._handle, *args, **options)
            profiler.print_stats()
        else:
            self._handle(*args, **options)

