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

python manage.py makemigrations djangophylocore
python manage.py migrate djangophylocore
python manage.py makemigrations browse
python manage.py migrate browse
python manage.py makemigrations human_hist
python manage.py migrate human_hist


python manage.py buildncbi_fast
python manage.py loadtaxonomy
python manage.py buildtaxonomytoc

#Let's get a version of nr, which is known to work and use it
# wget https://www.dropbox.com/s/ed6v0jokp5vchlt/nr_5march2020.gz
# gunzip nr_5march2020.gz
# python manage.py buildvariants_parallel -f --db nr_5march2020

python manage.py buildhistoneclasses #python manage.py buildvarianttypes
python manage.py buildfeatures #python manage.py buildvariantinfo -f
python manage.py loadcurated

python manage.py buildseedinfo -f
python manage.py buildtrees -f
python manage.py buildsunburst -f

python manage.py buildhmms

# python manage.py extractvariants -f #This will download new nr if not present in dir
# python manage.py extractvariants -f --db nr_small_per10_v4 #This will download new nr if not present in dir
#Line below is for express code testing
python manage.py extractvariants -f --db https://www.dropbox.com/s/6lh26otjq0w8337/nr_test_small_352mb.gz

python manage.py buildblastdb
python manage.py buildblastdbs
python manage.py classifyvariants -f

python manage.py buildtrees -f
python manage.py buildsunburst -f
#python manage.py buildblastdb -f
python manage.py buildseedinfo -f

python manage.py buildhuman_hist #2>log/temp_error.log

python manage.py shell < tools/export_data.py # exporting data to dumps
python manage.py shell < tools/export_statistics.py # exporting statistics to statistics including data


