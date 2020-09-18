from django.db import models
from browse.models import *

# Create your models here.
class Histone_Human_genes(models.Model):
    #id             = models.CharField(max_length=25, primary_key=True)
    hgnc_symbol    = models.CharField(max_length=25)
    prev_hgnc_symb = models.CharField(max_length=25)
    variant        = models.ForeignKey(Variant, related_name="human_genes")
    ncbi_gene_id   = models.IntegerField()
    ensg           = models.CharField(max_length=100)
    expr_timing    = models.CharField(max_length=25)
    expr_pattern   = models.CharField(max_length=25)
    biotype        = models.CharField(max_length=25)
    bona_fidecanonical = models.CharField(max_length=25)
    pmids          = models.CommaSeparatedIntegerField(max_length=250)


    def __unicode__(self):
        return self.id

class Histone_Human_proteins(models.Model):
   # id             = models.CharField(max_length=25, primary_key=True)
    gene           = models.ManyToManyField(Histone_Human_genes, related_name="human_proteins") #through="human_proteins"
    enst           = models.CharField(max_length=100)
    refseq_transcript_id  = models.CharField(max_length=100)
    refseq_protein_id = models.CharField(max_length=100)
    prot_lenght    = models.IntegerField()
    isoform        = models.CharField(max_length=40)

    def __unicode__(self):
        return self.id

class Histone_Human_mutations(models.Model):
    gene           = models.ManyToManyField(Histone_Human_genes, related_name="human_mutations")
    aa_change      = models.CharField(max_length=100)
    mutation_type  = models.CharField(max_length=100)
    ref_allele     = models.CharField(max_length=100)
    var_allele     = models.CharField(max_length=100)
    var_allele_freq= models.FloatField()
    case        =  models.ManyToManyField(Histone_Human_cancer, related_name="human_mutations") # try it related_name="human_mutations_1"



    def __unicode__(self):
        return self.id

class Histone_Human_cancer(models.Model):
    case_id          =  models.CharField(max_length=100)
    sequencing_center=  models.CharField(max_length=100)
    cancer           =  models.CharField(max_length=100)

    def __unicode__(self):
        return self.id





