from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord

from utils import *

import pandas as pd
import os, logging, configparser
'''
This model will:
    + create HMMs from curated set
    + extract and classify sequences from db using HMMs
    + classify sequences using BLAST
    - test model
'''

log = logging.getLogger(__name__)

config = configparser.ConfigParser()
config.read('./histonedb.ini')

class HistonedbClassifier(object):
    def __init__(self, classification_tree=None):
        self.classification_tree = classification_tree

        self.predicted_results = None
        self.prediction_info = None

        if not self.classification_tree:
            with open(config['DATA']['variants'], encoding='utf-8') as f:
                variant_json = json.load(f)
                self.classification_tree = variant_json['tree']

    def save_prediction_info(self, file_name):
        pd.DataFrame(self.prediction_info).fillna('').drop(columns=['hsp']).to_csv(file_name, index=False)
        log.info(f"Predicted sequences saved to {file_name}")

    def dump_results(self, file_name):
        import pickle
        if not os.path.exists(config['DUMPS']['prediction_dumps']): os.makedirs(config['DUMPS']['prediction_dumps'])
        with open(file_name, 'wb') as f:
            pickle.dump(self.prediction_info, f)
        log.info(f"Predicted sequences saved to {file_name}")

HMM_DIRECTORY = config['PREDICTION']['hmms']
PREDICTION_RESULTS_DIRECTORY = config['PREDICTION']['results']

class HistonedbTypeClassifier(HistonedbClassifier):
    def __init__(self, classification_tree=None):
        super().__init__(classification_tree)
        self.combined_hmm_file = os.path.join(HMM_DIRECTORY, 'types_combined.hmm')
        self.hmmout = os.path.join(PREDICTION_RESULTS_DIRECTORY, "hmm_search.out")

    def create_hmms(self, seed_directory=None):
        log.info("Building HMMs...")
        seed_directory = seed_directory if seed_directory else config['PREDICTION']['seeds']
        if not os.path.exists(HMM_DIRECTORY): os.makedirs(HMM_DIRECTORY)
        with open(self.combined_hmm_file, "w") as combined_hmm:
            for hist_type in self.classification_tree:
                # Build HMMs
                hmm_file = os.path.join(HMM_DIRECTORY, f"{hist_type}.hmm")
                log.info(' '.join(["hmmbuild", "-n", hist_type, hmm_file, os.path.join(seed_directory, f'{hist_type}.fasta')]))
                subprocess.call(["hmmbuild", "-n", hist_type, hmm_file, os.path.join(seed_directory, f'{hist_type}.fasta')])
                with open(hmm_file) as hmm: print(hmm.read().rstrip(), file=combined_hmm)
        # Pressing HMMs
        log.info("Pressing HMMs for histone types...")
        subprocess.call(["hmmpress", "-f", self.combined_hmm_file])
        return self

    def predict(self, sequences, E=10, accession_retrieve=None):
        if self.predicted_results: return self.predicted_results
        if not os.path.exists(PREDICTION_RESULTS_DIRECTORY): os.makedirs(PREDICTION_RESULTS_DIRECTORY)
        self.prediction_info = predict_types(sequences=sequences, hmmout=self.hmmout, hmmdb=self.combined_hmm_file, E=E,
                                             accession_retrieve=accession_retrieve)
        self.predicted_results = self.prediction_info.filter(lambda d: d['best']).filter_keys('id', 'accession','type', 'description')
        return self.predicted_results

BLASTDBS_DIR = config['PREDICTION']['blast']

class HistonedbVariantClassifier(HistonedbClassifier):
    def __init__(self, classification_tree=None):
        super().__init__(classification_tree)
        self.combined_hmm_file = os.path.join(HMM_DIRECTORY, 'types_combined.hmm')
        self.hmmout = os.path.join(PREDICTION_RESULTS_DIRECTORY, "hmm_search.out")
        self.blast_db_file = os.path.join(BLASTDBS_DIR, "{}.fa")
        self.blastout = os.path.join(PREDICTION_RESULTS_DIRECTORY, "blast_search_{}.out")

    def create_hmms(self, seed_directory=None):
        log.info("Building HMMs...")
        seed_directory = seed_directory if seed_directory else config['PREDICTION']['seeds']
        if not os.path.exists(HMM_DIRECTORY): os.makedirs(HMM_DIRECTORY)
        with open(self.combined_hmm_file, "w") as combined_hmm:
            for hist_type in self.classification_tree:
                # Build HMMs
                hmm_file = os.path.join(HMM_DIRECTORY, f"{hist_type}.hmm")
                log.info(' '.join(["hmmbuild", "-n", hist_type, hmm_file, os.path.join(seed_directory, f'{hist_type}.fasta')]))
                subprocess.call(["hmmbuild", "-n", hist_type, hmm_file, os.path.join(seed_directory, f'{hist_type}.fasta')])
                with open(hmm_file) as hmm: print(hmm.read().rstrip(), file=combined_hmm)
        # Pressing HMMs
        log.info("Pressing HMMs for histone types...")
        subprocess.call(["hmmpress", "-f", self.combined_hmm_file])
        return self

    def create_blastdbs(self, curated_sequences=None):
        log.info("Building BLASTDBs...")
        curated_sequences = curated_sequences if curated_sequences else config['DATA']['histones']
        curated_data = pd.read_csv(curated_sequences)
        if not os.path.exists(BLASTDBS_DIR): os.makedirs(BLASTDBS_DIR)
        for hist_type in self.classification_tree:
            with open(self.blast_db_file.format(hist_type), "w") as seqs:
                for i, row in curated_data[curated_data['type']==hist_type].iterrows():
                    SeqIO.write(SeqRecord(Seq(row['sequence']), id=row['accession'],
                                          description=f"type: {row['type']}, variant: {row['variant']}, organism: {row['organism']}"),
                                seqs, "fasta")
            log.info(" ".join(
                ["makeblastdb", "-in", self.blast_db_file.format(hist_type), "-dbtype", "prot", "-title", "HistoneDB"]))
            subprocess.call(
                ["makeblastdb", "-in", self.blast_db_file.format(hist_type), "-dbtype", "prot", "-title", "HistoneDB"])
        return self

    def predict(self, sequences, E_hmm=10, E_blast=.01, accession_retrieve=None):
        if self.predicted_results: return self.predicted_results
        if not os.path.exists(PREDICTION_RESULTS_DIRECTORY): os.makedirs(PREDICTION_RESULTS_DIRECTORY)
        types_prediction_info = predict_types(sequences=sequences, hmmout=self.hmmout, hmmdb=self.combined_hmm_file, E=E_hmm,
                                              accession_retrieve=accession_retrieve)
        predicted_types = types_prediction_info.filter(lambda d: d['best']).filter_keys('id', 'accession', 'type', 'description')

        self.prediction_info = CustomList()
        for hist_type in set(predicted_types.values('type')):
            tmpfile_ids = os.path.join(PREDICTION_RESULTS_DIRECTORY, f"extracted_sequences_{hist_type}.ids")
            full_length_seq_file = os.path.join(PREDICTION_RESULTS_DIRECTORY, f"extracted_sequences_{hist_type}.fasta")
            with open(tmpfile_ids, 'w') as ids_file:
                for p in predicted_types.filter(lambda d: d['type']==hist_type):
                    ids_file.write('{}\n'.format(p['id']))
            extract_full_sequences(tmpfile_ids, sequences, full_length_seq_file)
            seqrec_sequences = list(SeqIO.parse(full_length_seq_file, "fasta"))
            prediction_within_type = predict_variants(seqrec_sequences, blastout=self.blastout.format(hist_type),
                                                      blastdb=self.blast_db_file.format(hist_type), E=E_blast,
                                                      accession_retrieve=accession_retrieve)
            prediction_within_type.add_items(type=hist_type)
            self.prediction_info.extend(prediction_within_type)
            # os.remove(tmpfile_ids)
            # os.remove(full_length_seq_file)
        self.predicted_results = self.prediction_info.filter(lambda d: d['best']).filter_keys('accession', 'type', 'variant', 'description')
        return self.predicted_results
