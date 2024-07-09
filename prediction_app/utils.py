import os, sys, subprocess, json, re, logging, configparser
from tqdm import tqdm

from Bio import SearchIO, Entrez, SeqIO
from Bio.Blast.Applications import NcbiblastpCommandline
from Bio.Blast import NCBIXML

class CustomList(list):
    def __init__(self, iterable=[]):
        not_dict = [i for i, v in enumerate(iterable) if type(v) != dict]
        for v in iterable:
            if set(v.keys())!=set(iterable[0].keys()):
                raise ValueError('dict objects must have the same keys')
        if len(not_dict) == 0:
            super().__init__(iterable)
        else:
            raise TypeError(f'can only append dict (not {", ".join([f"{i}: {type(iterable[i])}" for i in not_dict])})')

    def append(self, p_object):
        """ L.append(object) -> None -- append object to end """
        if self.__len__() > 0 and set(p_object.keys()) != set(self[0].keys()):
            raise ValueError('dict objects must have the same keys')
        if type(p_object) == dict:
            super().append(p_object)
        else:
            raise TypeError(f'can only append dict (not {type(p_object)})')

    def extend(self, iterable):
        """ L.extend(iterable) -> None -- extend list by appending elements from the iterable """
        not_dict = [i for i, v in enumerate(iterable) if type(v) != dict]
        for v in iterable:
            if self.__len__() > 0 and set(v.keys())!=set(self[0].keys()):
                raise ValueError('dict objects must have the same keys')
        if len(not_dict) == 0:
            super().extend(iterable)
        else:
            raise TypeError(f'can only append dict (not {", ".join([f"{i}: {type(iterable[i])}" for i in not_dict])})')

    def insert(self, index, p_object): # real signature unknown; restored from __doc__
        """ L.insert(index, object) -- insert object before index """
        if self.__len__() > 0 and set(p_object.keys()) != set(self[0].keys()):
            raise ValueError('dict objects must have the same keys')
        if type(p_object) == dict:
            super().insert(index, p_object)
        else:
            raise TypeError(f'can only append dict (not {type(p_object)})')

    def get_keys(self):
        return self[0].keys()

    def filter(self, func):
        return CustomList(list(filter(func, self)))

    def filter_keys(self, *keys):
        return CustomList([{k: v for k, v in d.items() if k in keys} for d in self])

    def drop_keys(self, *keys):
        return CustomList([{k: v for k, v in d.items() if k not in keys} for d in self])

    def values(self, key, func=None):
        return list(d[key] for d in self if func(d)) if func else list(d[key] for d in self)

    def add_items(self, **mydict_items):
        self.__init__(list(map(lambda x: dict(x, **{k: v for k, v in mydict_items.items()}), self)))

    def set_value(self, index, key, value):
        self[index][key] = value

    def get_items(self, func):
        return CustomList([d for d in enumerate(self) if func(d)])

    def set_values(self, key, value, func=None):
        for i, d in enumerate(self):
            if func and func(d): self[i][key] = value

log = logging.getLogger(__name__)

# config = configparser.ConfigParser()
# config.read('./histonedb.ini')

def predict_types(sequences, hmmout, hmmdb, E=10, accession_retrieve=None):
    """
    This method do a search among given sequences and extracts just histone variants classified by histone types.
    All the results saves to the result_file, e.g.:
    accession, histone_type, score, best, description
    NP_563627.1, H3, 2.14, True, Histone superfamily protein [Arabidopsis thaliana]
    DAA13058.1, H2B, 3.11, False, [Bos taurus]
    ___________
    Parameters:
    ___________
    sequences: fasta file
    hmmout: hmmout file
    hmmdb: hmmdb file
    result_file: file to save results
    """

    # Use HMMs to search the nr database
    log.info("Searching HMMs...")
    log.info(" ".join(["nice", "hmmsearch", "-o", hmmout, "-E", str(E), "--notextw", hmmdb, sequences]))
    subprocess.call(["hmmsearch", "-o", hmmout, "-E", str(E), "--notextw", hmmdb, sequences])

    log.info("Parsing search results...")
    return parse_hmm_search_out(hmmout=hmmout, accession_retrieve=accession_retrieve)

def predict_variants(sequences, blastout, blastdb, features_file, E=.01, accession_retrieve=None):
    """
    This method do a search among given sequences and classify by histone variants.
    All the results saves to the result_file, e.g.: needs correction
    accession, histone_type, score, best, description
    NP_563627.1, H3, 2.14, True, Histone superfamily protein [Arabidopsis thaliana]
    DAA13058.1, H2B, 3.11, False, [Bos taurus]
    ___________
    Parameters:
    ___________
    sequences: list of SeqRec sequences
    blastout: hmmout file
    blastdb: hmmdb file
    result_file: file to save results
    """

    # log.info("Predicting variants via BLAST")
    log.info("Running BLASTP for {} sequences...".format(len(sequences)))
    make_blastp(sequences, blastdb, blastout=blastout, E=E)
    res = parse_blast_search_out(blast_file=blastout, features_file=features_file, accession_retrieve=accession_retrieve)
    h2ax_accessions_less_motif = [s.id for s in sequences if s.id in res.values('accession', lambda d: 'H2A.X' in d['variant'] and d['best']) and not check_features_H2AX(s.id, str(s.seq))]
    res.set_values('variant', 'H2A.X|generic', lambda d: d['accession'] in h2ax_accessions_less_motif and d['best'])
    h2az_accessions_with_motif = [s.id for s in sequences if s.id in res.values('accession', lambda d: 'H2A.Z' in d['variant'] and d['best']) and check_features_H2AX(s.id, str(s.seq))]
    res.set_values('variant', 'H2A.Z|H2A.X', lambda d: d['accession'] in h2az_accessions_with_motif and d['best'])
    return res

#HMM
def parse_hmm_search_out(hmmout, accession_retrieve=None):
    """Parse hmmout file and return results as dict.
      Parameters:
      ___________
      hmmout: hmmout file
      return e.g.: [{'accession': NP_563627.1, 'type': H3, 'score': 2.14, 'best': True,
                'description': Histone superfamily protein [Arabidopsis thaliana], 'hsp': best HSPObject},
                {'accession': DAA13058.1, 'type': H2B, 'score': 3.11, 'best': False,
                'description': [Bos taurus], 'hsp': best HSPObject},]
    """
    result = CustomList()
    for histone_query in tqdm(SearchIO.parse(hmmout, "hmmer3-text")):
        log.info("Loading histone: {}".format(histone_query.id))  # histone_query.id is histone type
        for hit in tqdm(histone_query):
            best_hsp = max(hit, key=lambda hsp: hsp.bitscore)
            best_f = True
            existing_best_result = list(filter(lambda d: d['id'] == hit.id and d['best'], result))
            if len(existing_best_result) > 0 and best_hsp.bitscore > existing_best_result[0]['score']:
                result.remove(existing_best_result[0])
                existing_best_result[0]['best'] = False
                result.append(existing_best_result[0])
            else: best_f = False if len(existing_best_result) > 0 else True
            accession = accession_retrieve("{} {}".format(hit.id, hit.description)) if accession_retrieve else hit.id  # hit.id is a first accession
            result.append({'id': hit.id,  # hit.id is a first accession
                           'accession': accession,
                           'type': histone_query.id,
                           'score': best_hsp.bitscore,
                           'best': best_f,
                           'description': hit.description,
                           'hsp': best_hsp,
                           # 'taxonomy': taxonomy_from_header("{} {}".format(hit.id, hit.description.split('\x01')[0]), accession),
                           })
    return result

# BLAST
def make_blastp(sequences, blastdb, blastout, E=.01):
    # log.error('Error:: sequences {}'.format(len(sequences)))
    # log.error('Error:: hasattr {}'.format(hasattr(sequences, '__iter__')))
    if not hasattr(sequences, '__iter__'):
        sequences = [sequences]

    blastp = os.path.join(os.path.dirname(sys.executable), "blastp")
    # output = os.path.join("/", "tmp", "{}.xml".format(uuid.uuid4()))
    blastp_cline = NcbiblastpCommandline(
        cmd=blastp,
        # db=os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "HistoneDB_sequences.fa"),
        db=blastdb,
        evalue=E, outfmt=5)
    # evalue=0.004, outfmt=5)
    result, error = blastp_cline(stdin="\n".join([s.format("fasta") for s in sequences]))

    with open(blastout, 'w') as f:
        f.write(result)

    log.info('Blast results saved to {}'.format(blastout))

def get_best_hsp(hsps, align_longer=0):
    best_alignment_hsp = hsps[0]
    for hsp in hsps[1:]:
        if hsp.score > best_alignment_hsp.score and hsp.align_length > align_longer:
            best_alignment_hsp = hsp
    return best_alignment_hsp

def check_features_macroH2A(query_accession, hsp_hit_start, hsp_hit_end, features_file):
    with open(features_file, encoding='utf-8') as feature_info_file:
        feature_info = json.load(feature_info_file)
    group = list(filter(lambda x: x[1]=='M', enumerate(feature_info['H2A']['macroH2A']['feature1'])))
    feature_start, feature_end = group[0][0], group[-1][0]
    ratio = (min(hsp_hit_end, feature_end) - max(hsp_hit_start, feature_start)) / (feature_end - feature_start)
    log.info('{} expected as macroH2A with ratio={} of macro domain contained in hsp'.format(query_accession, ratio))
    if ratio < .8:
        log.info('{} expected as macroH2A cannot pass 0.8 ratio_treshhold'.format(query_accession))
        return False
    return True

def check_features_H2AX(query_accession, query):
    log.info(f'Checking {query_accession} for H2A.X-motif')
    return re.search(r'SQ[ED][YFLIA]$', query)

def parse_blast_search_out(blast_file, features_file, accession_retrieve=None):
    """Parse blastFile file and return results as dict.
        Parameters:
        ___________
        blastFile: blastFile
        return e.g.: [{'accession': NP_563627.1, 'histone_variant': cenH3, 'score': 2.14, 'best': True,
                        'description': Histone superfamily protein [Arabidopsis thaliana], 'hsp': best HSPObject, 'hit_accession': DAA13058.1},
                        {'accession': DAA13058.1, 'histone_variant': H2B.W, 'score': 3.11, 'best': False,
                        'description': [Bos taurus], 'hsp': best HSPObject, 'hit_accession': DAA13058.1},]
    """
    blast_file_handle = open(blast_file)
    result = CustomList()
    for i, blast_record in enumerate(NCBIXML.parse(blast_file_handle)): # <Iteration>
        query_split = blast_record.query.split(maxsplit=1)
        id, description = query_split[0], query_split[1]

        if len(blast_record.alignments) == 0: # <Hit> count = 0
            log.warning("No blast hits for {}".format(blast_record.query))
            # raise InvalidFASTA("No blast hits for {}.".format(blast_record.query))
            result.append({'id': id,
                           'accession': accession_retrieve("{} {}".format(id, description)) if accession_retrieve else id,
                           'variant': 'generic',
                           'score': .000001,
                           'best': True,
                           'description': description,
                           'hsp': None,
                           'hit_accession': None,
                           'taxonomy': taxonomy_from_header("{} {}".format(id, description.split('\x01')[0]), id)
                           })
            continue

        best_alignments = []
        for alignment in blast_record.alignments: # <Hit>
            best_algn_hsp = get_best_hsp(alignment.hsps, align_longer=.25 * blast_record.query_letters)
            best_alignments.append({'hit_accession': alignment.hit_def.split(maxsplit=1)[0],
                                    'hit_variant': alignment.hit_def.split(maxsplit=1)[1].split(',')[1].split(': ')[1],
                                    'hit_organism': alignment.hit_def.split(maxsplit=1)[1].split(',')[2].split(': ')[1],
                                    'best_hsp': best_algn_hsp,
                                    'score': best_algn_hsp.score})
        best_alignments = sorted(best_alignments, key=lambda algn: algn['score'], reverse=True)

        # best_alignment = best_alignments[0]
        histone_variant = best_alignments[0]['hit_variant']
        # If hsp contains macro domain?
        if 'macroH2A' in histone_variant and not check_features_macroH2A(query_accession=id,
                                                                         hsp_hit_start=best_alignments[0]['best_hsp'].sbjct_start, # get start and end of hit HSP
                                                                         hsp_hit_end=best_alignments[0]['best_hsp'].sbjct_end,
                                                                         features_file=features_file):
            histone_variant = f'{histone_variant}|generic'

        accession = accession_retrieve("{} {}".format(id, description)) if accession_retrieve else id
        # taxonomy = taxonomy_from_header("{} {}".format(id, description.split('\x01')[0]), accession)
        try: taxonomy = next(fetch_taxids([accession]))
        except StopIteration: taxonomy = "unidentified"
        # if taxonomy != re.search("(\()(\w+)(\))", histone_variant).group(2).lower().replace('_', ' '):
        # if taxonomy != best_alignments[0]['hit_organism'].lower():
        #     histone_variant = f'{histone_variant}|{}'
        result.append({'id': id,
                       'accession': accession,
                       'variant': histone_variant,
                       'score': best_alignments[0]['score'],
                       'best': True,
                       'description': description,
                       'hsp': best_alignments[0]['best_hsp'],
                       'hit_accession': best_alignments[0]['hit_accession'],
                       'taxonomy': taxonomy
                       })

        for best_algn in best_alignments[1:]:
            result.append({'id': id,
                           'accession': accession,
                           'variant': best_algn['hit_variant'],
                           'score': best_algn['score'],
                           'best': False, 'description': description,
                           'hsp': best_algn['best_hsp'],
                           'hit_accession': best_algn['hit_accession'],
                           'taxonomy': taxonomy
                           })

    blast_file_handle.close()
    return result

def extract_full_sequences(accessions, sequences, output):
    log.info(f"Indexing sequence database {sequences}")
    log.info(" ".join(["esl-sfetch", "--index", sequences]))
    subprocess.run(["esl-sfetch", "--index", sequences])
    log.info("Extracting full length sequences...")
    log.info(" ".join(["esl-sfetch", "-o", output, "-f", sequences, accessions]))
    subprocess.run(["esl-sfetch", "-o", output, "-f", sequences, accessions])

# taxonomy

def fetch_taxids(accessions):
    """
    """
    for s in fetch_seq(accessions):
        try:
            for a in s.features[0].qualifiers['db_xref']:
                text = re.search('(\S+):(\S+)', a).group(1)
                id = re.search('(\S+):(\S+)', a).group(2)
                if (text == "taxon"):
                    log.info("Fetched taxid from NCBI {}".format(id))
                    yield id
        except:
            log.warning("!!!!!!Unable to get TAXID for \n {} setting it to 1".format(s))
            yield 1  # unable to identify

def taxonomy_from_header(header_init, accession=None):
    # log.info("taxonomy_from_header triggered ...")
    match = re.compile(r'\[(.*?)\]').findall(header_init.replace("_", " "))
    if match: organism = match[-1]
    elif accession:
        log.warning("No taxonomy match for {}: {}, get it from NCBI".format(accession, header_init))
        try:
            organism = next(taxonomy_from_accessions([accession]))
        except StopIteration:
            return "unidentified"
    else:
        return "unidentified"
    organism = organism.replace(":", " ")
    organism = re.sub(r'([a-zA-Z0-9]+)[\./#_:]([a-zA-Z0-9]+)', r'\1 \2', organism)
    organism = re.sub(r'([a-zA-Z0-9]+)\. ', r'\1 ', organism)
    organism = re.sub(r"['\(\)\.]", r'', organism)
    return organism.lower()

def taxonomy_from_accessions(accessions):
    """
    """
    for s in fetch_seq(accessions):
        log.info(s.annotations["organism"])
        yield s.annotations["organism"]

def fetch_seq(accessions):
    # data = []
    # if len(accessions) == 0:
    #     data = []
    #Bug in eutils
    # E.g. 6A5L_FF cannot be retrieved, 6A5L_f cannot
    #This is likely a bad fix!!! but nothing else  can be done at the moment
    #Here is an addhock fix.
    # acc=accessions
    # accessions=[]
    # p1=re.compile("(\w{4})_([a-zA-Z]{2})")
    # p2=re.compile("(\w{4})_([a-z]{1})")
    #
    # for ac in acc:
    #     m1=p1.match(ac)
    #     m2=p2.match(ac)
    #
    #     if m1: accessions.append(m1.group(1)+'_'+m1.group(2)[0].upper())
    #     elif m2: accessions.append(m2.group(1)+'_'+m2.group(2)[0].upper())
    #     else: accessions.append(ac)
    #
    # # m1 = list(map(lambda x: re.compile("(\w{4})_([a-zA-Z]{2})").match(x), accessions))
    # # m2 = list(map(lambda x: re.compile("(\w{4})_([a-z]{1})").match(x), accessions))

    for i in range(10):
        try:
            # post_results = Entrez.read(Entrez.epost("protein", id=",".join(accessions)))
            # webenv = post_results["WebEnv"]
            # query_key = post_results["QueryKey"]
            # handle = Entrez.efetch(db="protein", rettype="gb", retmode="text", webenv=webenv, query_key=query_key)
            handle= Entrez.efetch(db="protein", id=",".join(accessions), rettype="gb", retmode="text")
            data = list(SeqIO.parse(handle, "gb"))
            if (len(accessions) == len(data)):
                return data
                # break
        except:
            log.warning("Unexpected error: {}, Retrying, attempt {}".format(sys.exc_info()[0],i))
            if i == 9: log.warning("FATAL ERROR could not get seqs from NCBI after 10 attempts for %s. Will return empty list!"%(",".join(accessions)))
    # for s in data:
    #     yield s
    return []

