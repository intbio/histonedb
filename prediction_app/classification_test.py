import os, configparser
from datetime import datetime

from classify_sequences import HistonedbPredictor

config = configparser.ConfigParser()
config.read('./prediction.ini')

def main(**kwargs):
    hp = HistonedbPredictor(config=config)
    data = hp.predict(db='h2a_viral_test.fasta')
    print(data)

if __name__ == "__main__":
    main()
