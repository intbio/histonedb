#!/bin/bash
#This script runs all the commands to initialize hisoneDB from scratch.
echo "Reinitializing HistDB from scratch"

python manage.py flush << EOF
yes
EOF

#python manage.py migrate
#python manage.py sqlclear browse | python manage.py dbshell
#python manage.py sqlclear djangophylocore | python manage.py dbshell
python manage.py migrate


python manage.py buildncbi_fast
python manage.py loadtaxonomy
python manage.py buildtaxonomytoc

#Let's get a version of nr, which is known to work and use it
# wget https://www.dropbox.com/s/ed6v0jokp5vchlt/nr_5march2020.gz
# gunzip nr_5march2020.gz
# python manage.py buildvariants_parallel -f --db nr_5march2020

# python manage.py buildvariants_parallel -f #This will download new nr if not present in dir
python manage.py buildvariants_parallel -f --db nr
#python manage.py buildvariants_parallel -f --db nr_small_50seq
# python manage.py buildvariants_parallel -f --db swissprot # this should work reasonably fast
python manage.py buildblastdb -f
python manage.py blastvariants -f

python manage.py buildtrees -f
python manage.py buildsunburst -f
#python manage.py buildblastdb -f
python manage.py buildvariantinfo -f
python manage.py buildseedinfo -f
python manage.py shell < tools/export_data.py # exporting data
python manage.py shell < tools/export_statistics.py # exporting statistics

