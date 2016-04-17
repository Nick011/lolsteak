#!/usr/bin/env bash

# update packages
apt-get update
apt-get upgrade

# redis
apt-get install -y python-software-properties
add-apt-repository -y ppa:chris-lea/redis-server
apt-get update
apt-get install -y redis-server

# setup redis
sed -i 's/bind 127.0.0.1/bind 0.0.0.0/g' /etc/redis/redis.conf
/etc/init.d/redis-server restart

# rabbitmq
#apt-get install -y rabbitmq-server

# setup rabbit
#sed -i 's/bind 127.0.0.1/bind 0.0.0.0/g' /etc/rabbitmq/rabbitmq-env.conf
#/etc/init.d/rabbitmq-server restart

# mysql
apt-get install -y mysql-client
DEBIAN_FRONTEND=noninteractive apt-get install -y -q mysql-server

# setup mysql
sed -i 's/bind-address\t\t= 127.0.0.1/bind-address\t\t= 0.0.0.0/g' /etc/mysql/my.cnf
sed -i 's/\[mysqld\]/\[mysqld\]\ncharacter-set-server=utf8\ncollation-server=utf8_general_ci\n/g' /etc/mysql/my.cnf
/etc/init.d/mysql restart

# Main hvdb1 database.
mysql --user root --execute='CREATE DATABASE lolsteak;'
mysql --user root --execute='CREATE DATABASE lolsteak;'

# Create users.
mysql --user root --execute='CREATE USER "lolsteak"@"%";'
mysql --user root --execute='CREATE USER "test"@"%";'

# Grant permissions.
mysql --user root --execute='GRANT ALL ON *.* TO "lolsteak"@"%";'
mysql --user root --execute='GRANT ALL ON *.* TO "test"@"%";'
