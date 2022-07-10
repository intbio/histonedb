from django.core.validators import MaxValueValidator, MinValueValidator
from django.conf import settings
from django.db import models
from mptt.models import MPTTModel, TreeForeignKey

from djangophylocore.models import Taxonomy

from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord
from Bio import SeqIO

from collections import defaultdict
import os

class Publication(models.Model):
    # id = models.IntegerField(primary_key=True)  # PubmedID
    id = models.CharField(max_length=45, primary_key=True)  # BibTeX_ID
    title = models.CharField(max_length=200, blank=True, null=True)
    volume = models.IntegerField(blank=True, null=True)
    issn = models.CharField(max_length=50, blank=True, null=True)
    url = models.CharField(max_length=500, blank=True, null=True)
    doi = models.CharField(max_length=100, blank=True, null=True)
    pages = models.CharField(max_length=25, blank=True, null=True)
    number = models.IntegerField(blank=True, null=True)
    journaltitle = models.CharField(max_length=100, blank=True, null=True)
    author = models.CharField(max_length=1000, blank=True, null=True)
    date = models.CharField(max_length=25, blank=True, null=True)
    cited = models.BooleanField()

class HistoneDescription(models.Model):
    summary = models.CharField(max_length=5000)
    taxonomy = models.CharField(max_length=1000, blank=True, null=True)
    genes = models.CharField(max_length=1000, blank=True, null=True)
    evolution = models.CharField(max_length=1000, blank=True, null=True)
    expression = models.CharField(max_length=1000, blank=True, null=True)
    knock_out = models.CharField(max_length=1000, blank=True, null=True)
    function = models.CharField(max_length=1000, blank=True, null=True)
    sequence = models.CharField(max_length=1000, blank=True, null=True)
    localization = models.CharField(max_length=1000, blank=True, null=True)
    deposition = models.CharField(max_length=1000, blank=True, null=True)
    structure = models.CharField(max_length=1000, blank=True, null=True)
    interactions = models.CharField(max_length=1000, blank=True, null=True)
    disease = models.CharField(max_length=1000, blank=True, null=True)
    caveats = models.CharField(max_length=1000, blank=True, null=True)

class Histone(models.Model):
    id             = models.CharField(max_length=25, primary_key=True)
    taxonomic_span = models.CharField(max_length=100)
    description    = models.ForeignKey(HistoneDescription, on_delete=models.CASCADE)
    publications   = models.ManyToManyField(Publication)

    def __str__(self):
        return self.id

    def get_absolute_url(self):
        from django.core.urlresolvers import reverse
        return reverse('browse.views.browse_variants', args=[str(self.id)])

class Variant(MPTTModel):
    """Most variants map to
    H2A.X -> multiple species, same varaint
    H2A.10 -> one species, different varaint that are species speficific
    """
    id             = models.CharField(max_length=35, primary_key=True)
    hist_type      = models.ForeignKey(Histone, related_name="variants", on_delete=models.CASCADE)
    taxonomic_span = models.CharField(max_length=100)  # models.ForeignKey(Taxonomy)?
    doublet        = models.BooleanField(default=False)
    description    = models.ForeignKey(HistoneDescription, on_delete=models.CASCADE)
    publications   = models.ManyToManyField(Publication)
    parent         = TreeForeignKey('self', related_name='children', null=True, blank=True, on_delete=models.CASCADE)
    color          = models.CharField(max_length=25, default="#ffed6f")

    class MPTTMeta:
        order_insertion_by = ['id']

    def __str__(self):
        return self.id

    def get_absolute_url(self):
        from django.core.urlresolvers import reverse

class OldStyleVariant(models.Model):  # This is to handle other names for the same variants.like cenH3, CENPA, etc.
    updated_variant = models.ForeignKey(Variant, related_name="old_names", on_delete=models.CASCADE)
    name = models.CharField(max_length=255, primary_key=True)
    gene = models.IntegerField(null=True, validators=[MaxValueValidator(15), MinValueValidator(1)])
    splice = models.IntegerField(null=True, validators=[MaxValueValidator(15), MinValueValidator(1)])
    taxonomy = models.ForeignKey(Taxonomy, related_name="+", on_delete=models.CASCADE)

    def __str__(self):
        return "{} (now called {})".format(self.name, self.updated_variant.id)


class TemplateSequence(models.Model):
    variant = models.CharField(
        max_length=255)  # Not a foreign key; Maybe it is "General". It is just used to specify path
    taxonomy = models.ForeignKey(Taxonomy, on_delete=models.CASCADE)

    def __str__(self):
        return "{}_{}".format(self.variant, self.taxonomy.name)

    def path(self):
        return os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "{}.fasta".format(str(self)))

    def get_sequence(self):
        return next(SeqIO.parse(self.path(), "fasta"))


class Sequence(models.Model):
    id = models.CharField(max_length=255, primary_key=True)  # GI, superseeded by ACCESSION
    # id           = models.CharField(max_length=255, primary_key=True,db_index=True) #GI, superseeded by ACCESSION
    variant = models.ForeignKey(Variant, related_name="sequences", blank=True, null=True, on_delete=models.CASCADE)
    # taxonomy_correted_variant = models.ForeignKey(HistoneClass, related_name="sequences2", null=True, blank=True, on_delete=models.CASCADE)
    gene = models.IntegerField(null=True, validators=[MaxValueValidator(15), MinValueValidator(1)])
    splice = models.IntegerField(null=True, validators=[MaxValueValidator(15), MinValueValidator(1)])
    taxonomy = models.ForeignKey(Taxonomy, on_delete=models.CASCADE)
    header = models.CharField(max_length=255)
    sequence = models.TextField()
    reviewed = models.BooleanField()

    # class Meta:
    #     ordering=['taxonomy__name']

    # def save(self, *args, **kwargs):
    #     assert (self.variant.rank != 'type')
    #     super(Sequence, self).save(*args, **kwargs)

    def __eq__(self, other):
        if isinstance(other, Sequence):
            return (self.id == other.id)
        else:
            return False

    def __hash__(self):
        return super().__hash__()

    def __str__(self):
        return self.format()  # "{} [Varaint={}; Organism={}]".format(self.id, self.full_variant_name, self.taxonomy.name)

    @property
    def accession(self): # old_name gi
        return self.id

    @property
    def full_variant_name(self):
        try:
            name = self.variant.id
        except:
            name = ""
        if self.gene:
            name += ".{}".format(self.gene)
        if self.splice:
            name += ".s{}".format(self.splice)
        return name

    @property
    def description(self):
        desc = self.id
        try:
            desc += "|{}".format(self.taxonomy.name.split(" ")[0])
        except:
            pass

        if self.full_variant_name:
            desc += "|{}".format(self.full_variant_name)

        return desc

    @property
    def short_description(self):
        return self.long_to_short_description(self.description)

    @staticmethod
    def long_to_short_description(desc):
        try:
            gi, tax, var = desc.replace("canonical", "ca").split('|')
            return "{0}..{1}|{2:<.10}..|{3}".format(gi[0:2], gi[-2:], tax, var)
        except:
            return desc

    def to_dict(self, id=False, ref=False):
        return {"name": self.description if not id else self.id, "seq": self.sequence, "ref": ref}

    def to_biopython(self, ungap=False):
        seq = Seq(self.sequence)
        try:
            score_desc = self.all_model_scores.fiter(used_for_classification=True).first().description()
        except:
            score_desc = ""
        if ungap:
            seq = seq.ungap("-")
        return SeqRecord(
            seq,
            id=self.description,
            description=score_desc,
        )

    def format(self, format="fasta", ungap=False):
        return self.to_biopython(ungap=ungap).format(format)

class HmmScore(models.Model):
    """
    The histone type score class, assigns a bunch of score entries to the sequence. For each histone a score.
    """
    sequence = models.ForeignKey(Sequence, related_name="histone_model_scores", on_delete=models.CASCADE)
    histone = models.ForeignKey(Histone, related_name="histone_+", on_delete=models.CASCADE)
    score = models.FloatField()
    evalue = models.FloatField()
    hmmStart = models.IntegerField()
    hmmEnd = models.IntegerField()
    seqStart = models.IntegerField()
    seqEnd = models.IntegerField()
    used_for_classification = models.BooleanField()
    regex = models.BooleanField()

    def __str__(self):
        return "<{} histone={}; score={} >".format(self.sequence.id, self.histone.id, self.score)

    def description(self):
        return "[Score: {}; Evalue:{}]"


class BlastScore(models.Model):
    """
    The score class for Blast, assigns a bunch of score entries to the sequence. For each variant a score.
    """
    # id                      = models.IntegerField(primary_key=True)
    # id = models.AutoField(primary_key=True)
    # sequence                = models.ForeignKey(SequenceBlast, related_name="all_model_scores")
    sequence = models.ForeignKey(Sequence, related_name="all_model_scores", on_delete=models.CASCADE)
    variant = models.ForeignKey(Variant, related_name="b+", on_delete=models.CASCADE)
    score = models.FloatField()
    bitScore = models.FloatField(blank=True, null=True)
    evalue = models.FloatField()
    identity = models.IntegerField(blank=True, null=True)
    positives = models.IntegerField(blank=True, null=True)
    blastStart = models.IntegerField(blank=True, null=True)
    blastEnd = models.IntegerField(blank=True, null=True)
    seqStart = models.IntegerField(blank=True, null=True)
    seqEnd = models.IntegerField(blank=True, null=True)
    align_length = models.IntegerField(blank=True, null=True)
    match = models.TextField(default='')
    hit_accession = models.CharField(max_length=255, default='')
    # hit_sequence = models.ForeignKey(Sequence, related_name="aligned_scores", on_delete=models.CASCADE)
    used_for_classification = models.BooleanField(default=False)
    classification_type = models.CharField(max_length=25, default='max_evalue') # max_evalue, taxonomy_corrected, H2A.X_motif

    def __str__(self):
        return "<{} variant={}; score={}; identity={}; used_for_classification={} >".format(self.sequence.id,
                                                                                            self.variant.id, self.score,
                                                                                            self.identity,
                                                                                            self.used_for_classification)

    def description(self):
        return "[Score: {}; Evalue:{}]"

# class Prediction(models.Model):
#     sequence        = models.ForeignKey(Sequence, related_name="all_predictions", on_delete=models.CASCADE)
#     # variant         = models.ForeignKey(HistoneClass, related_name="all_predictions", on_delete=models.CASCADE)
#     prediction_type = models.CharField(max_length=25) # max_evalue, taxonomy_corrected, H2A.X_motif
#     score_id        = models.ForeignKey(BlastScore, on_delete=models.CASCADE)


class FeatureManager(models.Manager):
    def from_dict(self, template, features, save=False):
        """Create model from secondary structure dictionary

        Parameters:
        -----------
        sequence: Sequence
        ss_dict: dict
            Created from tools.hist_ss
        """
        objs = [Feature(
            template=template,
            start=start,
            end=end,
            name=name,
            description="",
            color="") for name, (start, end) in features]

        if save:
            [o.save() for o in objs]

        return objs

    def gff(self, sequence_label="Consensus", features=None):
        """#Old colors:
domain\t990099
chain\t225,105,0
residue\t105,225,35
helix\tff0000
strand\t00ff00
loop\tcccccc
extension\tffff66
"""
        # assert isinstance(sequence_label, str) or , "Sequence label must be a string, not {}".format(str(type(sequence_label)))
        colors = {}
        gff_features = ""
        if features is None:
            features = self.all()
        for feature in features:
            try:
                colorName = colors[feature.color[1:]]
            except KeyError:
                colorName = "color{}".format(len(colors))
                colors[feature.color[1:]] = colorName
            gff_features += feature.gff(str(sequence_label), colorName)
        gff_colors = "\n".join(["{}\t{}".format(name, color) for color, name in colors.items()])

        return "{}\n{}".format(gff_colors, gff_features)

    def to_dict(self, features=None):
        if features is None:
            features = self.all()

        return {feature.name: (feature.start, feature.end) for feature in features}


class Feature(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    # template = models.ForeignKey(TemplateSequence, null=True, on_delete=models.CASCADE)
    variant = models.CharField(max_length=255)  # Not a foreign key; Maybe it is "General". It is just used to specify path
    taxonomy = models.ForeignKey(Taxonomy, on_delete=models.CASCADE)
    start = models.IntegerField()
    end = models.IntegerField()
    name = models.CharField(max_length=600)
    description = models.CharField(max_length=600)
    color = models.CharField(max_length=25)
    objects = FeatureManager()

    class Meta:
        ordering = ["start"]

    def __str__(self):
        """Returns Jalview GFF format"""
        return self.gff(str(self.template))

    def template_name(self):
        return "{}_{}".format(self.variant, self.taxonomy.name)

    def gff(self, sequence_label=None, featureType="{}"):
        tmp = ""
        if sequence_label is None:
            tmp += "color1\t{}\n".format(self.color)
            sequence_label = str(self.template)
            featureType = "color1"

        tmp += "\t".join((self.name, sequence_label, "-1", str(self.start), str(self.end), featureType))
        tmp += "\n"
        return tmp


