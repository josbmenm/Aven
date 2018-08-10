#!/bin/bash


# can remove this when new images are created (hera_setup.sh)
mkdir /socket


# Actual setup:
sudo -u postgres psql -c "alter user cloud with encrypted password '`cat /SETUP_PG_PASS.txt`'"

node /SETUP_CONFIG_FILES/hera_deploy.js

nginx -s reload


