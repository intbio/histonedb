import configparser, os

config = configparser.ConfigParser()

DATA_DIRECTORY = os.path.join("..", "data")
config['DATA'] = {'directory': DATA_DIRECTORY,
                  'histones': os.path.join(DATA_DIRECTORY, 'histones.csv'),
                  'variants': os.path.join(DATA_DIRECTORY, 'classification.json'),
                  'features': os.path.join(DATA_DIRECTORY, 'features.json'),
                  'publications': os.path.join(DATA_DIRECTORY, 'histoneDB.bib')}

PREDICTION_DIRECTORY = os.path.join("prediction")
config['PREDICTION'] = {'directory': PREDICTION_DIRECTORY,
                        'seeds': os.path.join(PREDICTION_DIRECTORY, "seeds"), # this is specific seeds generated for classification
                        'hmms': os.path.join(PREDICTION_DIRECTORY, "hmms"),
                        'blast': os.path.join(PREDICTION_DIRECTORY, "blast"),
                        'results': os.path.join(PREDICTION_DIRECTORY, "results")}

PREDICTION_DUMPS_DIRECTORY = os.path.join(config['PREDICTION']['results'], "dumps")
config['DUMPS'] = {'prediction_dumps': os.path.join(config['PREDICTION']['results'], "dumps"),
                   'database_dumps': os.path.join('dumps')}

config['LOG'] = {'prediction_log': os.path.join("log")}

with open('./prediction.ini', 'w') as configfile:
  config.write(configfile)