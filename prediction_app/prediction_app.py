from flask import Flask, jsonify, request
import os, configparser, logging
from datetime import datetime

from classify_sequences import HistonedbPredictor

app = Flask(__name__)

config = configparser.ConfigParser()
config.read('./prediction.ini')

# logging.basicConfig(filename=os.path.join(config['LOG']['prediction_log'], "classification.log"),
#                     format='%(asctime)s %(name)s %(levelname)-8s %(message)s',
#                     level=logging.INFO,
#                     datefmt='%Y-%m-%d %H:%M:%S')
logging.basicConfig(filename=os.path.join(os.path.join('log'), "classification.log"),
                    format='%(asctime)s %(name)s %(levelname)-8s %(message)s',
                    level=logging.INFO,
                    datefmt='%Y-%m-%d %H:%M:%S')
log = logging.getLogger(__name__)

# PREDICTION_DIRECTORY = os.path.join('prediction_app', 'prediction')

@app.route('/')
def index():
    return 'Index Page'

@app.route("/histonedb_classifier", methods=['POST'])
def histonedb_classifier_api():
    data = None
    if request.method == 'POST':
        request_data = request.data.decode("utf-8")
        seq_filename = f'sequences_{datetime.now().strftime("%Y%m%d-%H%M%S")}'
        # with open(os.path.join(PREDICTION_DIRECTORY, seq_filename), 'w+') as f:
        with open(os.path.join(config['PREDICTION']['directory'], seq_filename), 'w+') as f:
            # print(os.getcwd(), os.path, os.listdir())
            f.write(request_data)
        # data = [{'header': seq.split('\n', maxsplit=1)[0], 'seq': seq.split('\n', maxsplit=1)[1].replace('\n', '')} for seq in request_data.split('>')[1:]]
        hp = HistonedbPredictor(config=config)
        data = hp.predict(db=seq_filename)

#        os.remove(os.path.join(config['PREDICTION']['directory'], seq_filename)
    return jsonify(list(data))


if __name__ == "__main__":
    app.run()
