import json, os, configparser
from histonedb_classifier import HistonedbVariantClassifier
'''
This executable script will:
    + create hmms for histone types
    + create blastdbs for histone variants
'''

config = configparser.ConfigParser()
config.read('./histonedb.ini')

def main(**kwargs):

    with open(config['DATA']['variants'], encoding='utf-8') as f:
        variant_json = json.load(f)
        classification_tree = variant_json['tree']
    # classifier = HistonedbVariantClassifier()
    # classifier.create_hmms()
    # classifier.create_blastdbs()
    classification_tree.pop('Archaeal')
    classification_tree.pop('Viral')
    classifier = HistonedbVariantClassifier(classification_tree=classification_tree)
    classifier.create_hmms(seed_directory=os.path.join(config['DATA']['directory'], "draft_seeds"))
    classifier.create_blastdbs()

if __name__ == "__main__":
    main()
