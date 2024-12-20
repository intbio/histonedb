#!/bin/bash

#echo "Errorlog /dev/stderr" >> /etc/apache2/apache2.conf
mysqldatadir=/var/lib/mysql/
histdb_reinit=false
mysql_db_reinit=false

while [ -n "$1" ]
do
case "$1" in
-histdb_reinit) histdb_reinit=true ;;
-mysql_db_reinit) mysql_db_reinit=true ;;
*) echo "$1 is not an option" ;;
esac
shift
done

if $mysql_db_reinit; then
killall -9 mysqld_safe
killall -9 mysqld
pkill -9 mysqld_safe
pkill -9 mysqld
sleep 5;
echo "Deleting database files and reinitialization"
rm -rf $mysqldatadir/*


# if [ "$(ls -A $mysqldatadir)" ]; then
     # echo "$mysqldatadir is not Empty, no need to initialize mysql"
# else
    # echo "$mysqldatadir is Empty, initializing mysql"
mysqld --initialize-insecure --datadir=$mysqldatadir --user=mysql


#/usr/bin/mysqld_safe
echo "Rerunning mysql in the background"
mysqld_safe --datadir=$mysqldatadir --port=13307 &
fi



if $mysql_db_reinit; then
cd /var/www/histonedb
echo 'Creating database ...'
echo 'Allow 5 secs for database initialization ...'
sleep 5;
mysql -u root --skip-password < system_setup/db_setup_query.sql 
echo "Database  created "
fi
# if ! $without_setup ; then

  # if ! mysql -u root --skip-password -e 'use histonedb' > /dev/null 2>&1 || $easy_setup ; then

  #   if mysql -u root --skip-password -e 'use histonedb' > /dev/null 2>&1 ; then
  #     echo "Dropping the existing database histonedb ..."
  #     mysql --skip-password --execute="DROP DATABASE histonedb;"
  #   fi
if $histdb_reinit; then
cd /var/www/histonedb


echo 'Start HistoneDB initialization ...'
#    sh reinit_histdb_local.sh > reinit.log 2>error.log
bash -e reinit_histdb_local.sh
echo 'Initialization complete. See loginfo in log/ directory.'
fi
# echo 'For reinitialization run file reinit_histdb_local.sh'

#   else

#     if mysql -u root --skip-password -e 'use histonedb' > /dev/null 2>&1 ; then
#       echo "Running the existing database histonedb localed at /var/lib/mysql/histonedb inside container."
#     fi

#   fi

# else

#   echo "Project started without initialization."

# fi


#a2enconf wsgi
#service apache2 restart
