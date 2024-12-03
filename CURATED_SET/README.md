# CURATED SET of histone sequences and their classification

The interactive web-page with data is at [http://intbio.org/histonedb/CURATED_SET/html/tree_d3.html](http://intbio.org/histonedb/CURATED_SET/html/tree_d3.html)

This directory includes:
1. list of all curated histone sequences in csv format [histones.csv](histones.csv) - this file is manully edited and curated.
2. [classification.json](classification.json) - this file includes all info about histone classification, types, variants, sub-variants, etc. [classification_schema.json](classification.schema.json) - defines JSON Schema.
3. [features.json](features.json) - this file includes info about sequence features of different histones and variants. [features.schema.json](features.schema.json) - defines JSON Schema.
4. a library to analyze and vizualize histone sequence information which produces web-pages rendered with GitHub pages (ex. [curated_service.ipynb](curated_service.ipynb)).
5. a library to prepare inputs for HistoneDB, namely [histones_processed.csv](histones_processed.csv), which contains actual sequences (and not only NCBI accessions).


## histones.csv

accession, type, variant_group, variant, doublet, gi, geneid, taxonomyid, organism, taxonomy_group, info, references, sequence (if no NCBI accession is present)

- accession - this is NCBI id of the sequence with version(!), also will be used as an id in HistoneDB. If the sequence in NCBI is not present, than a custom id is used (might be NONCBI_VARIANTNAME_NUMBER), and sequence is provided in Sequence column.
- type - according to classification, H3, H4, H2A, H2B or Archaeal.
- variant_group - this is the id of the top-level variant classification in our hierarchy attributable to the sequence. If sequence has to be attributed to two variant groups wirte them separated with a space, e.g. "H2A.X H2A.Z"
- variant - this is the id of the most specific level variant classification in our hierarchy attributable to the sequence, it is equal to Variant_group if no more specific classification is possible. If sequence has to be attributed to two variants wirte them separated with a space. Every sequence MUST has something in Variant column. If unknown use _unclassified variants. Examples, cH3_(Metazoa), H2A.Z.2.s2_(Homo_Sapiens)
- doublet - true if it is a doublet. if it is of both types - write them with a space in Type column. E.g. "H3 H4"
- gi - legacy field for GIs.
- ncbi_gene_id - optional, but if present will be added to sequence name.
- hgnc_gene_name - optional
- taxonomy_id - NCBI taxonomy id of the sequence.
- organism - NCBI human readable taxonomy name.
- phylum
- class
- taxonomy_group - this is usually taxonomy class if available or higher order rank if not. We adhere to NCBI current taxnomy name E.g. Mammalia, Magnoliopsida, etc.
- info - information about this particular sequence - including its function and references to literature as [PMID].
- references - PMIDs of papers where info about this sequence can be found.
- sequence - sequence as a string if no NCBI accession is available.

When sequences are rendered in MSA we need a unique and human readable names for them.
These names are constructured as follows variant (without taxanomic span) + Species + Gene Name if available + accession.

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
- Variants may specify in their name the taxonomic span of the particular variant (this is usually reserved only for highly taxa specific variants). Main information on the taxanomic span is given in the description of the variant.
- Sub-variants usually specify in their name the taxonomic span of this particular sub-variant.
- If a variant or a sub-variant has an id of the following form VARIANTNAME_(Taxanomic_span), this means that only sequences from the said taxanomic group are presented under this variant/subvariant name.
- Variant ids are case-insensitive in the database, but during representation case is important.
- Variants also have a full name. E.g.
- We can subdivide a variant into sub-variants from different taxonomic groups, only if they do not have known common functional subvariants (NOTE: this may change as our knowledge advances). I.e. we give priority to functional similarity above taxanomic similarity.
- Viral_H2A, Vrial_H2B ... for viral histones.
- Unclassified_H2A, 
- Fields to include in variant description: name, description, taxonomic_span, alternate_names, publications, members
- Description tries to include following sections: Genes, Evolution, Knock-out, Function, Sequence, Localization, Deposition, Structural effects, Interactions, Disease, Caveats. 

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
