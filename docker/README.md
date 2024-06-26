# HistoneDB via virtual machine

## TL;DR; for Docker in OSX
```
mkdir project_dir
cd project_dir
git clone https://github.com/intbio/histonedb.git
mkdir db
cd ..
docker stop histdb; docker rm histdb # optional if container exists and is running
docker run --name histdb -d -p 8080:10081 -v `pwd`/project_dir/histonedb:/var/www/histonedb -v `pwd`/project_dir/db:/var/lib/mysql intbio/histonedb:0.2.1
docker exec -it histdb bash -c "bash /var/www/db_gen.sh -mysql_db_reinit -histdb_reinit"
```
Check the website at http://localhost:8080

# Instructions
## Prepare directories and clone repo
Create project directory and directories where to mount project code and database

```
mkdir project_dir
cd project_dir
git clone https://github.com/intbio/histonedb.git
mkdir db
cd ..
```

Then you can run HistoneDB via two ways.

## Running via docker (allow at least 4Gb of RAM + 4 Gb of SWAP in Docker preferences)

- Run as a service in docker, this will run apache and attempt to start mysqld
```
docker stop histdb; docker rm histdb # optional if container exists and is running
docker run --name histdb -d -p 8080:10081 -v `pwd`/project_dir/histonedb:/var/www/histonedb -v `pwd`/project_dir/db:/var/lib/mysql intbio/histonedb:0.2.1
```

- Check the website is available at http://localhost:8080

- Get into container and start db regeneration

```docker exec -it histdb bash```

- Next in reinit_histdb_local.sh adjust the database you would want to build HistoneDB from (swissprot, nr, etc.)

```bash db_gen.sh -mysql_db_reinit -histdb_reinit```

- To stop the container run

```docker stop histdb```

## Run in singularity 

- Build singularity container

```singularity build --sandbox cont docker://intbio/histonedb:0.2.1```

- Run apache on prot 10081 and attempt to start mysqld

```singularity instance start --writable --bind project_dir/histonedb:/var/www/histonedb,project_dir/db:/var/lib/mysql cont histdb```

- Get into container

```singularity shell instance://histdb```

- Regenerate db

```
apachectl start
cd /var/www
```

- Next in ```reinit_histdb_local.sh``` adjust the database you would want to build HistoneDB from (swissprot, nr, etc.)

```bash db_gen.sh -mysql_db_reinit -histdb_reinit```
or
```bash db_gen.sh -mysql_db_reinit -histdb_reinit > histonedb/log/db_gen.log 2>histonedb/log/db_gen_error.log```

- To stop the container run

```singularity instance stop histdb```


**IMPORTANT NOTE:
Looks like singularity is not completele isolated from the host machine kernel security modules, e.g. apparmor.
So it means on the host
/etc/apparmor.d/usr.sbin.mysqld should have
```
# Allow data files dir access
  /var/lib/mysql-files/ r,
  /var/lib/mysql-files/** rwk,
```

### Run a second indtance in singularity
Use 
```singularity build --sandbox cont docker://intbio/histonedb:0.2.0p2```
And change port to port = 13307 in HistoneDB/database_info.txt
The running port of web server willbe 10081

### For development
- Profiling
```python -m cProfile -s cumtime manage.py buildvariants```

- Imaging
```
docker image build -t intbio/histonedb:0.2.0 .
docker push intbio/histonedb:0.2.0
```
