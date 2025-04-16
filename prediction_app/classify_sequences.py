import subprocess, logging, os, configparser

from histonedb_classifier import HistonedbVariantClassifier
from utils import CustomList
'''
This executable script will:
    + download nr or other db
    - classify sequences using classification_model
'''

# config = configparser.ConfigParser()
# config.read('./histonedb.ini')

# LOG_DIRECTORY = os.path.join("./prediction_app/log")
# logging.basicConfig(filename=os.path.join(LOG_DIRECTORY, "classification.log"),
# logging.basicConfig(filename=os.path.join(config['LOG']['prediction_log'], "classification.log"),
#                     format='%(asctime)s %(name)s %(levelname)-8s %(message)s',
#                     level=logging.INFO,
#                     datefmt='%Y-%m-%d %H:%M:%S')
# log = logging.getLogger(__name__)
log = logging.getLogger(__name__)

class HistonedbPredictor():
    def __init__(self, config):
        self.config = config

    # PREDICTION_DIRECTORY = config['PREDICTION']['directory']

    def get_db(self, db):
        if db == "nr" and not os.path.isfile(f"{self.config['PREDICTION']['directory']}/nr"): self.download_nr()
        if db == "swissprot" and not os.path.isfile(f"{self.config['PREDICTION']['directory']}/swissprot"): self.download_swissprot()
        if ('http://' in db) or ('https://' in db) or ('ftp://' in db):
            log.info(f'Provided db file is a link {db} - Expecting a gzipped file. Attempting to download ...')
            subprocess.call(["wget", db, '-O', f"{self.config['PREDICTION']['directory']}/db.gz"])
            subprocess.call(["gunzip", f"{self.config['PREDICTION']['directory']}/db.gz"])
            db = 'db'
        return db

    def download_nr(self):
        """Download nr if not present"""
        log.info("Downloading nr...")
        # print >> .stdout, "Downloading nr..."
        with open(f"{self.config['PREDICTION']['directory']}/nr.gz", "w") as nrgz:
            subprocess.call(["curl", "-#", "ftp://ftp.ncbi.nlm.nih.gov/blast/db/FASTA/nr.gz"], stdout=nrgz)
        subprocess.call(["gunzip", f"{self.config['PREDICTION']['directory']}/nr.gz"])

    def download_swissprot(self):
        """Download nr if not present"""
        log.info("Downloading swissprot...")
        # print >> .stdout, "Downloading swissprot..."
        with open(f"{self.config['PREDICTION']['directory']}/swissprot.gz", "w") as swissprotgz:
            subprocess.call(["curl", "-#", "ftp://ftp.ncbi.nlm.nih.gov/blast/db/FASTA/swissprot.gz"],
                            stdout=swissprotgz)
        subprocess.call(["gunzip", f"{self.config['PREDICTION']['directory']}/swissprot.gz"])

    def db_split(self, sequences, procs):
        log.info(f"Splitting database file into {procs} parts")
        # !!!!!!!!!!!!!!!
        os.system(f"rm -rf {self.config['PREDICTION']['directory']}/db_split")
        os.system(f"mkdir {self.config['PREDICTION']['directory']}/db_split")
        # This is tricky tricky to make it fast
        size = os.path.getsize(sequences)
        split_size = int(size / procs) + 1
        os.system(f"split --bytes={split_size} --numeric-suffixes=1 {sequences} {self.config['PREDICTION']['directory']}/db_split/split")
        # We need to heal broken fasta records
        for i in range(1, procs + 1):
            for k in range(1, 10000):
                outsp = subprocess.check_output(['head', '-n', str(k), f"{self.config['PREDICTION']['directory']}/db_split/split{i:02d}"])
                if (outsp.split(b'\n')[-2].decode("utf-8")[0] == '>'):
                    print(k)
                    break
            if (k > 1):
                os.system(f"head -n {k} {self.config['PREDICTION']['directory']}/db_split/split{i:02d} >>{self.config['PREDICTION']['directory']}/db_split/split{i-1:02d}")
                os.system(f"tail -n +{k} {self.config['PREDICTION']['directory']}/db_split/split{i:02d}> {self.config['PREDICTION']['directory']}/db_split/temp")
                os.system(f"mv {self.config['PREDICTION']['directory']}/db_split/temp {self.config['PREDICTION']['directory']}/db_split/split{i:02d}")

    def predict(self, db='nr', procs=1):
        log.info('=======================================================')
        log.info('===               prediction START                  ===')
        log.info('=======================================================')

        log.info(f"Classification of {db}")
        db_file = self.get_db(db)
        log.info(db_file)
        classifier = HistonedbVariantClassifier(config=self.config)

        if procs > 1:
            self.db_split(db_file, procs)
            res = CustomList()
            for i in range(procs):
                res.extend(classifier.predict(sequences=os.path.join(self.config['PREDICTION']['directory'], f'db_split/split{i:02d}')))
                classifier.dump_results(file_name=os.path.join(self.config['DUMPS']['prediction_dumps'], f'dump_{db_file}_{i}'))
        else:
            log.info('I am here')
            print(os.path.join(self.config['PREDICTION']['directory'], db_file))
            res = classifier.predict(sequences=os.path.join(self.config['PREDICTION']['directory'], db_file))
            classifier.dump_results(file_name=os.path.join(self.config['DUMPS']['prediction_dumps'], f'dump_{db_file}'))

        log.info('=======================================================')
        log.info('===        prediction SUCCESSFULLY finished         ===')
        log.info('=======================================================')

        return res

#
# if __name__ == "__main__":
#     main()
