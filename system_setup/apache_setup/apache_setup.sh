#!/bin/bash
# please, run this file from histonedb directory


parentdir="$(dirname "$PWD")"
# parentdir="$(dirname "$parentdir")"
sed -i 's#MY_PROJECT_DIRECTORY#'$parentdir'#g' system_setup/apache_setup/wsgi.conf

sudo cp -f system_setup/apache_setup/wsgi.conf /etc/apache2/mods-available

sudo a2enconf wsgi
sudo service apache2 restart