from Bio import Entrez, SeqIO, AlignIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord
from Bio.Align import MultipleSeqAlignment
from Bio.Align.AlignInfo import SummaryInfo

import pandas as pd
import numpy as np
import collections
import sys, os, re, subprocess, io, json
from datetime import datetime

HISTONES_FILE = 'histones.csv'
HISTONES_PROCESSED_FILE = 'histones_processed.csv'
CLASSIFICATION_FILE = 'classification.json'
FEATURES_FILE = 'features.json'
BACKUP_DIR = 'backups'

NONCBI_IDENTIFICATOR = 'HISTDB'

#Auxillary functions

from IPython.display import display

def show_msa_jl(msa):
    """
    This requires jupyterlab-fasta extenstion and works only in jupyterlab
    """
    data=format(msa, 'fasta')
    bundle = {}
    bundle['application/vnd.fasta.fasta'] = data
    bundle['text/plain'] = data
    display(bundle, raw=True)

def dict2tree(tree,d):
    """
    converts tree from classification.json to a ete3 object
    d is
    with open('classification.json') as json_file:
        data = json.load(json_file)
    d=data['tree']
    """
#     t=Tree()
    for k,v in d.items():
        CH=tree.add_child(name=k)
        if isinstance(v,dict):
            dict2tree(CH,v)
   # return t

def muscle_p2p_aln(msa1,msa2, options=[],debug = False):
    """
    align two alignments
    :return: MultipleSeqAlignment object
    """
    with open('tmp/one.afa','w') as f:
        f.write(msa1.format('fasta'))
    with open('tmp/two.afa','w') as f:
        f.write(msa2.format('fasta'))

    muscle = os.path.join(os.path.dirname(sys.executable), "muscle")
    process = subprocess.Popen([muscle]+options+['-profile','-in1','tmp/one.afa','-in2','tmp/two.afa'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    aln, error = process.communicate()
    if debug:
        print("Stderr:")
        print(error.decode('utf-8')) 
        print("Stdout:")
        print(aln.decode('utf-8')) 

    seqFile = io.StringIO()
    seqFile.write(aln.decode('utf-8'))
    seqFile.seek(0)
    sequences = list(SeqIO.parse(seqFile, "fasta"))  # Not in same order, but does it matter?
    msa = MultipleSeqAlignment(sequences)
    return msa

def get_classification_variants(obj):
    lst = []
    for key in obj:
        if isinstance(obj[key], dict):
            lst.extend(get_classification_variants(obj[key]))
        else:
            lst.append(key)
    return lst

# def show_msa_with_features(self, hist_type=None, variant=None, subvariant=None, taxonomy_id=None, organism=None, phylum=None, taxonomy_class=None,
#                              shading_modes=['charge_functional'], legend=False, title='', logo=False, hideseqs=False, splitN=20, setends=[],
#                              ruler=False, show_seq_names=True, funcgroups=None, show_seq_length=False, debug=False):
#         df = self.data
#         if hist_type: df = df.loc[self.data['type'] == hist_type]
#         if variant: df = df.loc[self.data['variant'] == variant]
#         if subvariant: df = df.loc[self.data['subvariant'] == subvariant]
#         if taxonomy_id: df = df.loc[self.data['taxonomy_id'] == taxonomy_id]
#         if organism: df = df.loc[self.data['organism'] == organism]
#         if phylum: df = df.loc[self.data['phylum'] == phylum]
#         if taxonomy_class: df = df.loc[self.data['class'] == taxonomy_class]
#         if df.shape[0] < 1: raise AssertionError(f'No such sequences')
#         return self.show_aln(list(df['accession']), shading_modes=shading_modes, legend=legend, title=title, logo=logo, hideseqs=hideseqs, splitN=splitN,
#                              setends=setends, ruler=ruler, show_seq_names=show_seq_names, funcgroups=funcgroups, show_seq_length=show_seq_length, debug=debug)

# def show_aln(self, accessions,
#                  shading_modes=['charge_functional'], legend=False, title='', logo=False, hideseqs=False, splitN=20, setends=[],
#                  ruler=False, show_seq_names=True, funcgroups=None, show_seq_length=False, debug=True):
#         msa = self.muscle_aln(accessions=accessions)
#         a = SummaryInfo(msa)
#         cons = a.dumb_consensus(threshold=0.1, ambiguous='X')
#         features = hist_shf4seq(cons)
#         return ipyshade.shadedmsa(msa,
#                                   shading_modes=shading_modes,
#                                   legend=legend,
#                                   features=features,
#                                   title=title,
#                                   logo=logo,
#                                   hideseqs=hideseqs,
#                                   splitN=splitN,
#                                   setends=setends,
#                                   ruler=ruler,
#                                   show_seq_names=show_seq_names,
#                                   funcgroups=funcgroups,
#                                   show_seq_length=show_seq_length,
#                                   debug=debug
#                                  )


#Main class    

class CuratedSet(object):
    def __init__(self, histones_file=None, classification_file=None):
        # self.histones_file = histones_file
        # self.classification_file = classification_file
        if not histones_file: histones_file = HISTONES_FILE
        if not classification_file: classification_file = CLASSIFICATION_FILE
        self.data = self.read_data(histones_file)
        with open(classification_file, encoding='utf-8') as f:
            self.variants_tree = json.load(f)['tree']
        self.sort_data()

        self.fasta_seqrec = {} # keys - accession, values SeqRec Object
        self.msa_variant = {} # keys - variant, values MultipleSeqAlignment Object
        self.msa_type = {} # keys - type, values MultipleSeqAlignment Object
#         self.create_fasta_seqrec()

    def read_data(self, histones_file):
        df = pd.read_csv(histones_file, sep=',',quotechar='"', engine='python', dtype={'taxonomy_id': str}).fillna('')
        df.index = list(df['accession'])
        return df
    
    def sort_data(self):
        def get_leaves(key, value):
            if value == 'null': return [key]
            res = [key]
            for k, v in value.items():
                res += get_leaves(k, v)
            return res
        df = self.data.copy()
        df['type'] = pd.Categorical(df['type'], self.variants_tree.keys())
#         df['variant_group'] = pd.Categorical(df['variant_group'], [vg for t in self.variants_tree.keys() for vg in self.variants_tree[t].keys()]+[''])
        variant_categories = [v for t, tv in self.variants_tree.items() for v in get_leaves(t, tv)]
#         df['variant'] = pd.Categorical(df['variant'], variant_categories)
        try:
            df['variant'] = pd.Categorical(df['variant'], variant_categories+[f'{iv.split("__???")[0]}__???' for iv in list(set(self.data['variant'])-set(variant_categories))])
        except ValueError:
            print(collections.Counter(variant_categories+[f'{iv.split("__???")[0]}__???' for iv in list(set(self.data['variant'])-set(variant_categories))]))
            raise
        df = df.sort_values(['type', "variant"])
        for i, row in df.iterrows():
            if pd.isna(row['variant']):
                try:
                    df.at[i, 'variant'] = self.data.loc[i]['variant'].split("__???")[0]+'__???'
                except ValueError:
                    print(','.join(df['variant']))
                    print(df.loc[i, 'variant'])
                    print(self.data.loc[i]['variant'].split("__???")[0]+'__???')
                    print(self.data.loc[i]['variant'].split("__???")[0]+'__???' in df['variant'])
                    raise
        self.data = df

    def has_duplicates(self):
        '''
        This method allows us to check that our curated set does not have identifiers that are assigned different variants.
        :return: None (if no such identifiers) or iterator of accessions (that are assigned different variants)
        '''
        acc_dict = {acc.split('.')[0]: acc for acc in self.get_accessions_list()}
        acc_list = [acc.split('.')[0] for acc in self.get_accessions_list()] #retrieving accessions without version
        if len(set(acc_list)) == self.get_count(): return
        c = collections.Counter()
        for acc in acc_list:
            c[acc] += 1
        for acc_count in c.most_common():
            if acc_count[1] == 1: continue
            else: yield acc_dict[acc_count[0]]
            
    def has_missed_variants(self):
        """
        :return: missed variants in data as list of str
        """
        # найти разность между множествами
        missed_variants = set(get_classification_variants(self.variants_tree)) - set(self.data["variant"])
        return missed_variants

    def create_fasta_seqrec(self):
        for i, row in self.data.iterrows():
            if row['sequence'] == '':
                continue
            if row['accession'] not in self.fasta_seqrec.keys():
                self.fasta_seqrec[row['accession']] = SeqRecord(Seq(row['sequence']),
                                                                id=(row['variant']+"_").split("(")[0][:-1]+'_'+row['organism'].replace(' ','_')+('_' if len(row['hgnc_gene_name'])>0 else '')+row['hgnc_gene_name'].replace(' ','_')+'_'+row['accession'],
                                                                description=f"{row['accession']} type: {row['type']}, variant: {row['variant']}, organism: {row['organism']}")
                
    def get_count(self): return self.data.shape[0]

    def get_accessions_list(self): return list(self.data['accession'])

    def get_gis_list(self): return list(self.data['gi'])

    def get_variant(self, accession): return self.data.loc[self.data['accession'] == accession]['variant'].iloc[0]

    def get_type(self, accession): return self.data.loc[self.data['accession'] == accession]['type'].iloc[0]

    def get_gi(self, accession): return self.data.loc[self.data['accession'] == accession]['gi'].iloc[0]

    def get_taxid_genus(self, accession):
        if not 'taxonomy_id' in self.data:
            print('No taxonomy_id loaded yet. Update update_taxids fisrt.')
            return
        return (self.data.loc[self.data['accession'] == accession]['taxonomy_id'].iloc[0],
                self.data.loc[self.data['accession'] == accession]['organism'].iloc[0])

    def get_ncbi_data(self): return self.data[self.data['accession'].str.startswith(NONCBI_IDENTIFICATOR, na=False) == False]

    def get_noncbi_data(self): return self.data[self.data['accession'].str.startswith(NONCBI_IDENTIFICATOR, na=False)]

    def get_blank_data(self, columns):
        data = self.get_ncbi_data()
        return data[(data[columns]=='').any(axis=1)]

    def save(self, filename=None, processed=False):
        # sorting data
        self.sort_data()

        # compare current data with data loaded from file
        data_old = self.read_data(HISTONES_FILE)
#         data_old['variant'] = pd.Categorical(data_old['variant'], variant_categories+[f'{iv}__???' for iv in list(set(self.data['variant'])-set(variant_categories))])
        index_order = set(self.data.index).intersection(set(data_old.index))
        data_old = data_old.loc[index_order]
        # print(data_old.head())
        for i, row in data_old.compare(self.data.loc[index_order]).iterrows():
            print(row)
        for newacc in set(self.data.index).difference(set(data_old.index)):
            print(f"Added sequence with accession {newacc}")
        # if(len(data_old)==len(self.data)):
        #     for i, row in data_old.compare(self.data).iterrows():
        #         print(row)
        # else:
        #     print("Dataframe comarison currently not possible due to different number of rows")
        
        # sorting data
        self.sort_data()

        # backup file first to history
        backup_file = os.path.join(BACKUP_DIR, f'{HISTONES_FILE}-{datetime.now().strftime("%b%d%y%H%M%S")}')
        # data_old.to_csv(backup_file, mode='w', index=False)
        print(f'cp {HISTONES_FILE} {backup_file}')
        os.system(f'cp {HISTONES_FILE} {backup_file}')
        print(f'Previous data backuped to {backup_file}')

        # saving
        if not filename: filename = HISTONES_FILE
        if processed: filename = HISTONES_PROCESSED_FILE
        self.data.to_csv(filename, mode='w', index=False)
        print(f'Results saved to {filename}')

    def update_accession_version(self):
        updating_data = self.get_ncbi_data()
        for i in range(10):
            try:
                handle = Entrez.efetch(db="protein", id=",".join([i.split('.')[0] for i in list(updating_data['accession'])]), rettype="gb", retmode="text")
                sequences = list(SeqIO.parse(handle, "gb"))
                if (len(updating_data['accession']) == len(sequences)):
                    new_accessions = [s.id for s in sequences]
                    for new_acc, acc in zip(new_accessions, updating_data['accession']):
                        if acc!=new_acc: print(f'{acc} changes to {new_acc}')
                    updating_data['accession'] = new_accessions
                    self.data = updating_data.append(self.get_noncbi_data())
                    break
                else:
                    print("Mismatch:", len(updating_data['accession']), " ", len(sequences))
            except:
                print("Unexpected error: {}, Retrying, attempt {}".format(sys.exc_info()[0], i))
                if i == 9:
                    print(
                        "FATAL ERROR could not get seqs from NCBI after 10 attempts for %s. Will return empty list!" % (
                            ",".join(list(updating_data))))
                else:
                    continue

    def update_taxids(self, blank_data=False, accessions=None, exclude=None):
        if blank_data and (accessions or exclude): raise AssertionError(f'blank_data cannot be true when accessions list is given. Please, use only one of the options.')
        updating_data = self.get_ncbi_data()
        if blank_data: updating_data = self.get_blank_data(['taxonomy_id', 'organism', 'phylum', 'class']) # add 'taxonomy_group'
        if accessions: updating_data = self.data.loc[accessions]
        if exclude: updating_data = updating_data.drop(exclude)

        sequences = []
        # if len(self.data['accession'].values) == 0:
        #     sequences = []
        # Bug in eutils
        # E.g. 6A5L_FF cannot be retrieved, 6A5L_f cannot
        # This is likely a bad fix!!! but nothing else  can be done at the moment
        # Here is an addhock fix.
        accessions = []
        p1 = re.compile("(\w{4})_([a-zA-Z]{2})")
        p2 = re.compile("(\w{4})_([a-z]{1})")

        for ac in updating_data['accession'].values:
            m1 = p1.match(ac)
            m2 = p2.match(ac)

            if m1: accessions.append(m1.group(1) + '_' + m1.group(2)[0].upper())
            elif m2: accessions.append(m2.group(1) + '_' + m2.group(2)[0].upper())
            else: accessions.append(ac)

        for i in range(10):
            try:
                handle = Entrez.efetch(db="protein", id=",".join(accessions), rettype="gb", retmode="text")
                sequences = list(SeqIO.parse(handle, "gb"))
                if (len(accessions) == len(sequences)): break
            except Exception as e:
                print("Unexpected error: {}, Retrying, attempt {}".format(sys.exc_info()[0], i))
                if i == 9:
                    print("FATAL ERROR could not get seqs from NCBI after 10 attempts for %s. Will return empty list!" % (",".join(accessions)))
                else: continue

        taxids, genus, phylum, taxonomy_class = [], [], [], []
        for s in sequences:
            genus.append(s.annotations["organism"])
            try:
                for a in s.features[0].qualifiers['db_xref']:
                    text = re.search('(\S+):(\S+)', a).group(1)
                    id = re.search('(\S+):(\S+)', a).group(2)
                    if (text == "taxon"):
                        print("Fetched taxid from NCBI {}".format(id))
                        taxids.append(id)
                    else: continue
            except:
                print("!!!!!!Unable to get TAXID for \n {} setting it to 1".format(s))
                taxids.append(1)  # unable to identify
            lineage = dict()
            for i in range(10):
                try:
                    handle = Entrez.efetch(id=taxids[-1], db="taxonomy", retmode="xml")
                    tax_data = Entrez.read(handle)
                    lineage = {d['Rank']: d['ScientificName'] for d in
                               tax_data[0]['LineageEx'] if d['Rank'] in ['class', 'phylum']}
                    break
                except:
                    print("Unexpected error: {}, Retrying, attempt {}".format(sys.exc_info()[0], i))
                    if i == 9:
                        print(f"FATAL ERROR could not get class and phylum from NCBI after 10 attempts for taxid:{taxids[-1]}. Will add None for class and phylum!")
                    else: continue
            phylum.append(lineage.get('phylum', 'None'))
            taxonomy_class.append(lineage.get('class', 'None'))

        for t_new, t, g_new, g, ph_new, ph, tc_new, tc in zip(taxids, updating_data['taxonomy_id'],
                                      genus, updating_data['organism'],
                                      phylum, updating_data['phylum'],
                                      taxonomy_class, updating_data['class']):
            if t != t_new: print(f'{t} changes to {t_new}')
            if g != g_new: print(f'{g} changes to {g_new}')
            if ph != ph_new: print(f'{ph} changes to {ph_new}')
            if tc != tc_new: print(f'{tc} changes to {tc_new}')
        updating_data['taxonomy_id'] = taxids
        updating_data['organism'] = genus
        updating_data['phylum'] = phylum
        updating_data['class'] = taxonomy_class
        self.data = updating_data.append(self.data.drop(list(updating_data['accession'])))

    def update_sequence(self, blank_data=False):
        """
        Download a dictionary of fasta SeqsRec from NCBI given a list of ACCESSIONs.
        :return: dict of fasta SeqRecords
        """

        print("Downloading FASTA SeqRecords by ACCESSIONs from NCBI")
        updating_data = self.get_ncbi_data()
        if blank_data: updating_data = self.get_blank_data(['sequence'])

        num = updating_data.shape[0]
        updated_num = 0
        for i in range(10):
            try:
                updated_num = 0
                print("Fetching %d seqs" % (num))
                strn = ",".join(list(updating_data['accession']))
                request = Entrez.epost(db="protein", id=strn)
                result = Entrez.read(request)
                webEnv = result["WebEnv"]
                queryKey = result["QueryKey"]
                handle = Entrez.efetch(db="protein", rettype='fasta', retmode='text', webenv=webEnv, query_key=queryKey)
                seq_records = list(SeqIO.parse(handle, 'fasta'))
                if (len(seq_records) == num):
                    for r in seq_records:
                        id = r.id
                        if '|' in r.id: id = r.id.split('|')[1]
                        if id not in updating_data['accession']:
                            raise AssertionError(f'{id} is not in accessions list')
                        if self.data.loc[id, 'sequence'] != str(r.seq):
                            print(f'Sequence for {id} changes from {self.data.loc[id, "sequence"]} to {str(r.seq)}')
                            self.data.at[id, 'sequence'] = str(r.seq)
                            updated_num += 1
                    break
                else: print("Mismatch:", num, " ", len(seq_records))
            except AssertionError: raise
            except Exception as e: continue
        if (len(seq_records) != num):
            print(f'FASTA Records could not be fetched: updated {updated_num} from {num}')
            return
        if updated_num == 0: print(f"Sequences is up-to-date")
        else: print(f"Sequences updated: {updated_num}")

    def muscle_aln(self, accessions, options=[],debug = False):
        """
        Align with muscle all sequences from defined accessions
        accessions: list of accessions
        :return: MultipleSeqAlignment object
        """
        self.create_fasta_seqrec()
        if not set(accessions).issubset(self.fasta_seqrec.keys()):
            self.update_sequence()
            self.create_fasta_seqrec()

        muscle = os.path.join(os.path.dirname(sys.executable), "muscle")
        process = subprocess.Popen([muscle]+options, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        sequences = "\n".join([self.fasta_seqrec[key].format("fasta") for key in accessions])
        aln, error = process.communicate(sequences.encode('utf-8'))
        if debug:
            print(sequences)
            print()
            print("Stderr:")
            print(error.decode('utf-8')) 
            print("Stdout:")
            print(aln.decode('utf-8')) 
        seqFile = io.StringIO()
        seqFile.write(aln.decode('utf-8'))
        seqFile.seek(0)
        sequences = list(SeqIO.parse(seqFile, "fasta"))  # Not in same order, but does it matter?
        msa = MultipleSeqAlignment(sequences)
        return msa



#     def muscle_aln_for_variant(self):
#         """
#         Align with muscle sequences grouped by histone variant
#         :return: dict MultipleSeqAlignment for variants object
#         """
#         self.msa_variant = {variant: self.muscle_aln(self.data[self.data['variant'] == variant]['accession']) for variant in set(self.data['variant'])}
#         return self.msa_variant

#     def muscle_aln_for_type(self):
#         """
#         Align with muscle sequences grouped by histone types
#         :return: dict MultipleSeqAlignment for types object
#         """
#         self.msa_type = {hist_type: self.muscle_aln(self.data[self.data['type'] == hist_type]['accession']) for hist_type in set(self.data['type'])}
#         return self.msa_type

#     def generate_draft_seeds(self, directory='draft_seeds'):
#         if not self.msa_variant: self.muscle_aln_for_variant()

#         if not os.path.exists(directory):
#             os.makedirs(directory)
#         for hist_type in ['H2A', 'H2B', 'H3', 'H4', 'H1']:
#             for hist_var in set(self.data[self.data['type'] == hist_type]['variant']):
#                 print("##########Starting", hist_var, hist_type, f'{hist_var}.fasta')
#                 if not os.path.exists(os.path.join(directory, hist_type)):
#                     os.makedirs(os.path.join(directory, hist_type))
#                 print(self.msa_variant[hist_var])
#                 # generate new msa with refactored title
#                 msa_r = MultipleSeqAlignment([])
#                 for i in self.msa_variant[hist_var]:
#                     # print(f'-------------------{i.id}')
#                     accession = i.id
#                     if '|' in accession: accession = accession.split('|')[1]
#                     try:
#                         genus = re.search(r"\[(\S+)\s+.+\S+\]", i.description).group(1)
#                     except:
#                         genus = self.get_taxid_genus(accession)[1]

#                     i.id = genus + "|" + accession + "|" + hist_var
#                     i.description = genus + "_" + hist_var + "_" + accession
#                     msa_r.append(i)
#                 msa_r.sort()
#                 print(msa_r)
#                 AlignIO.write(msa_r, os.path.join("draft_seeds", hist_type, f'{hist_var}.fasta'), 'fasta')

#             # combines MSA
#             if not self.msa_type: self.muscle_aln_for_type()
#             # generate new msa with refactored title
#             msa_r = MultipleSeqAlignment([])
#             for i in self.msa_type[hist_type]:
#                 print(i.description)
#                 accession = i.id
#                 if '|' in accession: accession = accession.split('|')[1]
#                 try:
#                     genus=re.search(r"\[(\S+)\s+.+\S+\]",i.description).group(1)
#                 except:
#                     genus = self.get_taxid_genus(accession)[1]
#                 # text = re.search(r"(\S+)\|(\d+)\|(\S+)", i.id)
#                 print(f'-------------------{i.id}')
#                 i.id = genus + "|" + accession + "|" + hist_type
#                 # i.description=genus+"_"+variant+"_"+gi
#                 msa_r.append(i)
#             msa_r.sort()
#             AlignIO.write(msa_r, os.path.join("draft_seeds", f'{hist_type}.fasta'), 'fasta')


### GFFOutput

from Bio import SeqIO

class _IdHandler:
    """Generate IDs for GFF3 Parent/Child relationships where they don't exist.
    """
    def __init__(self):
        self._prefix = "biopygen"
        self._counter = 1
        self._seen_ids = []

    def _generate_id(self, quals):
        """Generate a unique ID not present in our existing IDs.
        """
        gen_id = self._get_standard_id(quals)
        if gen_id is None:
            while 1:
                gen_id = "%s%s" % (self._prefix, self._counter)
                if gen_id not in self._seen_ids:
                    break
                self._counter += 1
        return gen_id

    def _get_standard_id(self, quals):
        """Retrieve standardized IDs from other sources like NCBI GenBank.

        This tries to find IDs from known key/values when stored differently
        than GFF3 specifications.
        """
        possible_keys = ["transcript_id", "protein_id"]
        for test_key in possible_keys:
            if test_key in quals:
                cur_id = quals[test_key]
                if isinstance(cur_id, tuple) or isinstance(cur_id, list):
                    return cur_id[0]
                else:
                    return cur_id
        return None

    def update_quals(self, quals, has_children):
        """Update a set of qualifiers, adding an ID if necessary.
        """
        cur_id = quals.get("ID", None)
        # if we have an ID, record it
        if cur_id:
            if not isinstance(cur_id, list) and not isinstance(cur_id, tuple):
                cur_id = [cur_id]
            for add_id in cur_id:
                self._seen_ids.append(add_id)
        # if we need one and don't have it, create a new one
        elif has_children:
            new_id = self._generate_id(quals)
            self._seen_ids.append(new_id)
            quals["ID"] = [new_id]
        return quals

class GFF3Writer:
    """Write GFF3 files starting with standard Biopython objects.
    """
    def __init__(self):
        pass

    def write(self, recs, out_handle, include_fasta=False,filterids=[]):
        """Write the provided records to the given handle in GFF3 format.
        """
        self.filterids=filterids
        id_handler = _IdHandler()
        self._write_header(out_handle)
        fasta_recs = []
        try:
            recs = iter(recs)
        except TypeError:
            recs = [recs]
        for rec in recs:
            self._write_rec(rec, out_handle)
            self._write_annotations(rec.annotations, rec.id, len(rec.seq), out_handle)
            for sf in rec.features:
                if sf.id in self.filterids:
                    continue
                sf = self._clean_feature(sf)
                id_handler = self._write_feature(sf, rec.id, out_handle,
                        id_handler)
            if include_fasta and len(rec.seq) > 0:
                fasta_recs.append(rec)
        if len(fasta_recs) > 0:
            self._write_fasta(fasta_recs, out_handle)

    def _clean_feature(self, feature):
        quals = {}
        for key, val in feature.qualifiers.items():  
            if not isinstance(val, (list, tuple)):
                val = [val]
            val = [str(x) for x in val]
            quals[key] = val
        feature.qualifiers = quals
        # Support for Biopython 1.68 and above, which removed sub_features
        if not hasattr(feature, "sub_features"):
            feature.sub_features = []
        clean_sub = [self._clean_feature(f) for f in feature.sub_features]
        feature.sub_features = clean_sub
        return feature

    def _write_rec(self, rec, out_handle):
        # if we have a SeqRecord, write out optional directive
        if len(rec.seq) > 0:
            out_handle.write("##sequence-region %s 1 %s\n" % (rec.id, len(rec.seq)))

    def _get_phase(self, feature):
        if "phase" in feature.qualifiers:
            phase = feature.qualifiers["phase"][0]
        elif feature.type == "CDS":
            phase = int(feature.qualifiers.get("codon_start", [1])[0]) - 1
        else:
            phase = "."
        return str(phase)

    def _write_feature(self, feature, rec_id, out_handle, id_handler,
            parent_id=None):
        """Write a feature with location information.
        """
        if feature.strand == 1:
            strand = '+'
        elif feature.strand == -1:
            strand = '-'
        else:
            strand = '.'
        # remove any standard features from the qualifiers
        quals = feature.qualifiers.copy()
        for std_qual in ["source", "score", "phase"]:
            if std_qual in quals and len(quals[std_qual]) == 1:
                del quals[std_qual]
        # add a link to a parent identifier if it exists
        if parent_id:
            if not "Parent" in quals:
                quals["Parent"] = []
            quals["Parent"].append(parent_id)
        quals = id_handler.update_quals(quals, len(feature.sub_features) > 0)
        if feature.type:
            ftype = feature.type
        else:
            ftype = "sequence_feature"
        parts = [str(rec_id),
                 feature.qualifiers.get("source", ["feature"])[0],
                 ftype,
                 str(feature.location.nofuzzy_start + 1), # 1-based indexing
                 str(feature.location.nofuzzy_end),
                 feature.qualifiers.get("score", ["."])[0],
                 strand,
                 self._get_phase(feature),
                 self._format_keyvals(quals)]
        out_handle.write("\t".join(parts) + "\n")
        for sub_feature in feature.sub_features:
            id_handler = self._write_feature(sub_feature, rec_id, out_handle,
                    id_handler, quals["ID"][0])
        return id_handler

    def _format_keyvals(self, keyvals):
        format_kvs = []
        for key in sorted(keyvals.keys()):
            values = keyvals[key]
            key = key.strip()
            format_vals = []
            if not isinstance(values, list) or isinstance(values, tuple):
                values = [values]
            for val in values:
               # val = urllib.parse.quote(str(val).strip(), safe=":/ ")
                if ((key and val) and val not in format_vals):
                    format_vals.append(val)
            format_kvs.append("%s=%s" % (key, ",".join(format_vals)))
        return ";".join(format_kvs)

    def _write_annotations(self, anns, rec_id, size, out_handle):
        """Add annotations which refer to an entire sequence.
        """
        format_anns = self._format_keyvals(anns)
        if format_anns:
            parts = [rec_id, "annotation", "remark", "1", str(size if size > 1 else 1),
                     ".", ".", ".", format_anns]
            out_handle.write("\t".join(parts) + "\n")

    def _write_header(self, out_handle):
        """Write out standard header directives.
        """
        out_handle.write("##gff-version 3\n")

    def _write_fasta(self, recs, out_handle):
        """Write sequence records using the ##FASTA directive.
        """
        out_handle.write("##FASTA\n")
        SeqIO.write(recs, out_handle, "fasta")

def GFFwrite(recs, out_handle, include_fasta=False,filterids=[]):
    """High level interface to write GFF3 files from SeqRecords and SeqFeatures.

    If include_fasta is True, the GFF3 file will include sequence information
    using the ##FASTA directive.
    """
    writer = GFF3Writer()
    return writer.write(recs, out_handle, include_fasta,filterids)

