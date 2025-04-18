# Prediction model and application

This directory is for storing scripts and models of the histone sequence classification algorithm.

# Requeriments

- Python 3.7
- Required python packages are specified in [python_requirements.txt](python_requirements.txt) (use "pip install -r python_requirements.txt")
- Required python packages are specified in [system_requirements.txt](system_requirements.txt) (includes HMMER 3.1b2, BLAST+ v 2.2.26, EMBOSS v6.5.7, MUSCLE v3.8.31, ClustalW2 v2.1 All executables must be present in the bin dir of virual environment)

# Run app with Python

To classify sequences, place the sequence file (in fasta format) in the `prediction/` directory and run the following script from `prediction_app/` directory:

```python
import os, configparser
from datetime import datetime

from classify_sequences import HistonedbPredictor

config = configparser.ConfigParser()
config.read('./prediction.ini')

hp = HistonedbPredictor(config=config)
data = hp.predict(db=<sequences_filename>)
print(data)
```

Code example: [classification_test.py](classification_test.py).
