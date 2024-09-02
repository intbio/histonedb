#!/bin/bash

# System Setup
yes Y | sh system_setup/sys_requirements.txt
sudo sed -i '$a wait_timeout = 31536000' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo sed -i '$a interactive_timeout = 31536000' /etc/mysql/mysql.conf.d/mysqld.cnf
echo 'System setup complete.'

# Python Requirements Setup
cd ../
virtualenv -p python3.7 venv_histdb_py37
source venv_histdb_py37/bin/activate
echo 'Virtualenv created and set to venv_histdb_py37.'
#yes Y | sh system_setup/py_requirements_setup.txt
pip install --yes --no-cache-dir -r system_setup/py_requirements.txt
echo 'Python setup complete.'

sudo systemctl restart mysql
sudo service apache2 restart