# CURATED SET of histone sequences and their classification

This directory includes:
1. list of all curated histone sequences in csv format [histones.csv](histones.csv) - this file is manully edited and curated.
2. [classification.json](classification.json) - this file includes all info about histone classification, types, variants, sub-variants, etc. [classification_schema.json](classification.schema.json) - defines JSON Schema.
3. [features.json](features.json) - this file includes info about sequence features of different histones and variants. [features.schema.json](features.schema.json) - defines JSON Schema.
4. a library to analyze and vizualize histone sequence information which produces web-pages rendered with GitHub pages (ex. [curated_service.ipynb](curated_service.ipynb)).
5. a library to prepare inputs for HistoneDB, namely [histones_processed.csv](histones_processed.csv), which contains actual sequences (and not only NCBI accessions).


## histones.csv

accession, type, variant_group, variant, doublet, gi, geneid, taxonomyid, organism, taxonomy_group, info, references, sequence (if no NCBI accession is present)

- accession - this is NCBI id of the sequence with version(!), also will be used as an id in HistoneDB. If the sequence in NCBI is not present, than a custom id is used (might be NONCBI_VARIANTNAME_NUMBER), and sequence is provided in Sequence column.
- Type - according to classification, H3, H4, H2A, H2B or Archaeal.
- variant_group - this is the id of the top-level variant classification in our hierarchy attributable to the sequence. If sequence has to be attributed to two variant groups wirte them separated with a space, e.g. "H2A.X H2A.Z"
- Variant - this is the id of the most specific level variant classification in our hierarchy attributable to the sequence, it is equal to Variant_group if no more specific classification is possible. If sequence has to be attributed to two variants wirte them separated with a space.
- Doublet - true if it is a doublet. if it is of both types - write them with a space in Type column. E.g. "H3 H4"
- GI - legacy field for GIs.
- NCBI gene id
- TaxonomyID - NCBI taxonomy id of the sequence.
- Organism - NCBI human readable taxonomy name.
- Taxonomy_group - this is usually taxonomy class if available or higher order rank if not. We adhere to NCBI current taxnomy name E.g. Mammalia, Magnoliopsida, etc.
- Info - information about this particular sequence - including its function and references to literature as [PMID].
- references - PMIDs of papers where info about this sequence can be found.
- Sequence - sequence as a string if no NCBI accession is available.

### Special cases
- If histone is a doublet - we include it once - see above.

## classification.json

This is a very important file detailing all classification of hisone variants currently used, and all info about them.
The classification is hierarchichal.
[classification.schema.json](classification.schema.json) - defines and describes json schema.

### Here are key points about our classification:
- Classification is hierarchical.
- Top level is type: H3, H4, H2A, H2B or Archaeal
- Next level is top-level variants, e.g. canonical H2A in Metazoa
- Variants always specify in their name the taxonomic span of this particular variant.
- Every variant has an id of the following form VARIANTNAME_(Taxanomic_span)
- Variant ids are case-insensitive in the database, but during representation case is important.
- Variants also have a full name. E.g.
- We can subdivide a variant into sub-variants from different taxonomic groups, only if they do not have common functional subvariants. I.e. we give priority to functional similarity above taxanomic similarity.
- Viral_H2A, Vrial_H2B ... for viral histones.
- Unclassified_H2A, 
- Fields to include in variant description: name, description, taxonomic_span, alternate_names, publications, members

## Documetation of a library to analyze and vizualize histone sequence information
### Conda environment setup
```
conda create --name histdb_curation
conda activate histdb_curation
conda install -c conda-forge -c etetoolkit -c intbio notebook pytexshade pandas numpy matplotlib jupyter_contrib_nbextensions jupyterlab jupyterlab-fasta pip mdanalysis biopython"<=1.77" nglview requests tectonic ete3
conda install -c bioconda muscle fasttree gblocks
pip install git+https://github.com/intbio/pynucl.git@master
pip install git+https://github.com/intbio/DNAtools.git@master
jupyter notebook
```

To start with just import the library and create CuratedSet object:

```
from curated_set_services import CuratedSet 
curated_set = CuratedSet()
```

Parameters:
- data: Contains data from histones.csv (DataFrame object)
- fasta_seqrec: keys - accession, values SeqRec Object (dict object)
- msa_variant = {} # keys - variant, values MultipleSeqAlignment Object
- msa_type = {} # keys - type, values MultipleSeqAlignment Object
- features_variant = {} # keys - variant, values Feature Object
- features_type = {} # keys - type, values Feature Object
- create_fasta_seqrec(self.data[self.data['sequence']!=''])