![](https://github.com/intbio/histonedb/workflows/Testing/badge.svg) [![](https://img.shields.io/badge/Demo-LastCommitonAnyBranch-ff69b4)](http://newton.bioeng.ru:10090)

View CURATED SET at [http://intbio.org/histonedb/CURATED_SET](http://intbio.org/histonedb/CURATED_SET/html/tree_d3.html)

# HistoneDB 3.0
A database for all histone proteins in NR organized by their known non-allelic protein isoforms, called variants. This resource can be used to understand how changes in histone variants affect structure, complex formation, and nucleosome function. For more information, please read our [paper](manuscript/paper.md) (citation below).

The database can be accessed at https://histonedb.bioeng.ru

To test HistoneDB you can use [instructions how to run via virtual machine ](docker/README.md) or follow the instructions below.

## Requirements ##

- Python 3.6.9
- Required python packages are specified in requirements.txt (use "pip install -r requirements.txt"). They include:
--biopython==1.74
--colour==0.1.5
--Django==1.8.19, django-extensions, django-filter
--gunicorn>=19.5.0
--mysqlclient
--networkx==1.10
--PyMySQL
--pyparsing==2.4.6
--numpy, pandas, scikit-learn, scipy, sklearn
--matplotlib==1.4.3, seaborn==0.6.0

- [HMMER 3.1b2](http://hmmer.janelia.org)
- [BLAST+](http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastDocs&DOC_TYPE=Download) v 2.2.26
- [EMBOSS](http://emboss.sourceforge.net) v6.5.7
- [MUSCLE](http://www.drive5.com/muscle/) v3.8.31
- [ClustalW2](http://www.clustal.org/clustal2/) v2.1
All executables must be present in the bin dir of virual environment.

## System setup ##

If you want to test the server on your own machine, you must make sure you have all of the dependencies listed above, or if you have Ubuntu 18.04 you can follow the instructions below:

1) Change file ```system_setup/db_setup_query.sql``` by replacing ```db_name```, ```db_user``` and ```pwd```
```
CREATE DATABASE IF NOT EXISTS db_name;
CREATE USER 'db_user'@'localhost' IDENTIFIED BY 'db_password';
GRANT ALL PRIVILEGES ON db . * TO 'db_user'@'localhost';
ALTER DATABASE db CHARACTER SET utf8 COLLATE utf8_general_ci;
```

2) Store the login information in the file  ```HistoneDB/databse_info.txt```, which is formatted in the following way (key = value):
```
name = DB_NAME
user = DB_USER
password = DB_PASS
host = DB_HOST
port = DB_PORT
SECRET_KEY = DJANGO_SECRET_KEY

#Reference another file with same paramters, useful if it needs be hidden
file = /path/to/other/file.txt

#Root of site when accessed from a browser
STATIC_URL = /static/ 
```

3) If running on the mweb, these values will already be set.
Finally, make sure the database has the correct charset:
```
ALTER DATABASE DB_NAME CHARACTER SET utf8 COLLATE utf8_general_ci
```

4) To start project run ```sh run.sh```

5) For reinitialization of DB you can run ```sh reinit_histdb_local.sh```

For more information about server setup and database intitializaition including how to update, rebuild and add new variants you can read [HistoneDB setup instructions](system_setup/SERVER_SETUP.md).

## Cite ##
 
Coming soon.

## Acknowledgements ##

* Eli Draizen
* Alexey K. Shaytan
* Anna Panchenko
* Leonardo Marino-Ramirez
* David Landsman
* Paul Talbert
