import subprocess, logging, os, configparser

from histonedb_classifier import HistonedbVariantClassifier
from utils import CustomList
'''
This executable script will:
    + download nr or other db
    - classify sequences using classification_model
'''

config = configparser.ConfigParser()
config.read('./histonedb.ini')

# LOG_DIRECTORY = os.path.join("./prediction_app/log")
# logging.basicConfig(filename=os.path.join(LOG_DIRECTORY, "classification.log"),
logging.basicConfig(filename=os.path.join(config['LOG']['prediction_log'], "classification.log"),
                    format='%(asctime)s %(name)s %(levelname)-8s %(message)s',
                    level=logging.INFO,
                    datefmt='%Y-%m-%d %H:%M:%S')
log = logging.getLogger(__name__)

# parser = argparse.ArgumentParser(description='Process some classification parameters')
# parser.add_argument('--db', dest='db', default='nr',
#                     help='defines the database or href for download')
# parser.add_argument('--procs', dest='procs', default='20',
#                     help='defines the number of procs')
#
# args = parser.parse_args()

PREDICTION_DIRECTORY = config['PREDICTION']['directory']

def get_db(db):
    if db == "nr" and not os.path.isfile(f'{PREDICTION_DIRECTORY}/nr'): download_nr()
    if db == "swissprot" and not os.path.isfile(f'{PREDICTION_DIRECTORY}/swissprot'): download_swissprot()
    if ('http://' in db) or ('https://' in db) or ('ftp://' in db):
        log.info(f'Provided db file is a link {db} - Expecting a gzipped file. Attempting to download ...')
        subprocess.call(["wget", db, '-O', f'{PREDICTION_DIRECTORY}/db.gz'])
        subprocess.call(["gunzip", f"{PREDICTION_DIRECTORY}/db.gz"])
        db = 'db'
    return db

def download_nr():
    """Download nr if not present"""
    log.info("Downloading nr...")
    # print >> .stdout, "Downloading nr..."
    with open(f"{PREDICTION_DIRECTORY}/nr.gz", "w") as nrgz:
        subprocess.call(["curl", "-#", "ftp://ftp.ncbi.nlm.nih.gov/blast/db/FASTA/nr.gz"], stdout=nrgz)
    subprocess.call(["gunzip", f"{PREDICTION_DIRECTORY}/nr.gz"])

def download_swissprot():
    """Download nr if not present"""
    log.info("Downloading swissprot...")
    # print >> .stdout, "Downloading swissprot..."
    with open(f"{PREDICTION_DIRECTORY}/swissprot.gz", "w") as swissprotgz:
        subprocess.call(["curl", "-#", "ftp://ftp.ncbi.nlm.nih.gov/blast/db/FASTA/swissprot.gz"],
                        stdout=swissprotgz)
    subprocess.call(["gunzip", f"{PREDICTION_DIRECTORY}/swissprot.gz"])

def db_split(sequences, procs):
    log.info(f"Splitting database file into {procs} parts")
    # !!!!!!!!!!!!!!!
    os.system(f'rm -rf {PREDICTION_DIRECTORY}/db_split')
    os.system(f'mkdir {PREDICTION_DIRECTORY}/db_split')
    # This is tricky tricky to make it fast
    size = os.path.getsize(sequences)
    split_size = int(size / procs) + 1
    os.system(f'split --bytes={split_size} --numeric-suffixes=1 {sequences} {PREDICTION_DIRECTORY}/db_split/split')
    # We need to heal broken fasta records
    for i in range(1, procs + 1):
        for k in range(1, 10000):
            outsp = subprocess.check_output(['head', '-n', str(k), f'{PREDICTION_DIRECTORY}/db_split/split{i:02d}'])
            if (outsp.split(b'\n')[-2].decode("utf-8")[0] == '>'):
                print(k)
                break
        if (k > 1):
            os.system(f'head -n {k} {PREDICTION_DIRECTORY}/db_split/split{i:02d} >>{PREDICTION_DIRECTORY}/db_split/split{i-1:02d} ')
            os.system(f'tail -n +{k} {PREDICTION_DIRECTORY}/db_split/split{i:02d}> {PREDICTION_DIRECTORY}/db_split/temp')
            os.system(f'mv {PREDICTION_DIRECTORY}/db_split/temp {PREDICTION_DIRECTORY}/db_split/split{i:02d}')

def main(**kwargs):
    log.info('=======================================================')
    log.info('===               prediction START                  ===')
    log.info('=======================================================')

    log.info(f"Classification of {kwargs['db']}")

    db_file = get_db(kwargs['db']) if 'db' in kwargs else get_db('nr')
    log.info(db_file)
    classifier = HistonedbVariantClassifier()

    if 'procs' in kwargs.keys():
        db_split(db_file, kwargs['procs'])
        res = CustomList()
        for i in range(kwargs['procs']):
            res.extend(classifier.predict(sequences=os.path.join(PREDICTION_DIRECTORY, f'db_split/split{i:02d}')))
            classifier.dump_results(file_name=os.path.join(config['DUMPS']['prediction_dumps'], f'dump_{db_file}_{i}'))
    else:
        log.info('I am here')
        res = classifier.predict(sequences=os.path.join(PREDICTION_DIRECTORY, db_file))
        classifier.dump_results(file_name=os.path.join(config['DUMPS']['prediction_dumps'], f'dump_{db_file}'))

    log.info('=======================================================')
    log.info('===        prediction SUCCESSFULLY finished         ===')
    log.info('=======================================================')

    return res


if __name__ == "__main__":
    main()
