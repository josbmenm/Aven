#!/bin/bash

export DEBIAN_FRONTEND="noninteractive";

echo "Aven Hera Image Setup"

# Copypasta from node_setup.sh
apt update

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt install -y nginx
apt install -y software-properties-common


# Copypasta from pg_setup.sh
apt install -y software-properties-common
apt install -y postgresql postgresql-contrib

# Copypasta from node_setup.sh
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt install -y nodejs

apt install -y yarn
apt install -y unzip
apt upgrade -y

mkdir /socket

systemctl daemon-reload
systemctl enable nginx


# Copypasta from pg_setup.sh

sudo -u postgres createuser cloud
sudo -u postgres createdb -O cloud cloud

echo "listen_addresses = '*'" | tee -a /etc/postgresql/9.6/main/postgresql.conf 

echo "hostssl	all		all		0.0.0.0/0		md5" | tee -a /etc/postgresql/9.6/main/pg_hba.conf