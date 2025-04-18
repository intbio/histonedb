# Apache and modwsgi configuration with Django

**Note**: apache2 2.4.29 and libapache2-mod-wsgi with dependencies are installed by ```system_setup/full_setup.sh```

For deployment we recomend to use modwsgi.

To configure Apache and modwsgi with Django go to the modwsgi.conf
```
sudo nano /etc/apache2/mods-available/wsgi.conf
```

And add the script given below to the file
```
    WSGIScriptAlias / /path/to/project/histonedb/HistoneDB/wsgi.py 

    WSGIDaemonProcess website.com python-home=/path/to/virtualenv/histdb_py27 python-path=/path/to/project/histonedb
    WSGIProcessGroup website.com

    Alias /static/ /path/to/project/histonedb/static/

    <Directory /path/to/project/histonedb/HistoneDB>
    <Files wsgi.py>
    Require all granted
    </Files>
    </Directory>

    <Directory /path/to/project/histonedb/static>
    Require all granted
    </Directory>
```

Then, run the script to restart apache2:
```
sudo a2enmod wsgi
sudo systemctl restart apache2
```
