from flask import Flask, jsonify, request
import os, configparser
from datetime import datetime

import classify_sequences

app = Flask(__name__)

config = configparser.ConfigParser()
config.read('./histonedb.ini')

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
        data = classify_sequences.main(db=seq_filename)

#        os.remove(os.path.join(config['PREDICTION']['directory'], seq_filename)
    return jsonify(list(data))


if __name__ == "__main__":
    app.run()
