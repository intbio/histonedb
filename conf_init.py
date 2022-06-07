import configparser, os

config = configparser.ConfigParser()

DATA_DIRECTORY = os.path.join("data")
config['DATA'] = {'directory': DATA_DIRECTORY,
                  'histones': os.path.join(DATA_DIRECTORY, 'histones.csv'),
                  'variants': os.path.join(DATA_DIRECTORY, 'classification.json'),
                  'features': os.path.join(DATA_DIRECTORY, 'features.json'),
                  'publications': os.path.join(DATA_DIRECTORY, 'histoneDB.bib')}

PREDICTION_DIRECTORY = os.path.join("prediction_app", "prediction")
config['PREDICTION'] = {'directory': PREDICTION_DIRECTORY,
                        'seeds': os.path.join(PREDICTION_DIRECTORY, "seeds"), # this is specific seeds generated for classification
                        'hmms': os.path.join(PREDICTION_DIRECTORY, "hmms"),
                        'blast': os.path.join(PREDICTION_DIRECTORY, "blast"),
                        'results': os.path.join(PREDICTION_DIRECTORY, "results")}

PREDICTION_DUMPS_DIRECTORY = os.path.join(config['PREDICTION']['results'], "dumps")
config['DUMPS'] = {'prediction_dumps': os.path.join(config['PREDICTION']['results'], "dumps"),
                   'database_dumps': os.path.join('dumps')}

config['LOG'] = {'prediction_log': os.path.join("prediction_app", "log"),
                 'database_log': os.path.join('log')}

STATIC_DIRECTORY = os.path.join("static")
config['WEB_DATA'] = {'static_directory': STATIC_DIRECTORY,
                      'seeds': os.path.join(STATIC_DIRECTORY, "browse", 'seeds'),
                      'template_sequences': os.path.join(STATIC_DIRECTORY, "browse", 'template_sequences'),
                      'trees': os.path.join(STATIC_DIRECTORY, "browse", 'trees'),
                      'sunbursts': os.path.join(STATIC_DIRECTORY, "browse", 'sunbursts')}

with open('./histonedb.ini', 'w') as configfile:
  config.write(configfile)