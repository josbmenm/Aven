#!/bin/bash


# can remove this when new images are created (hera_setup.sh)
mkdir /socket

node /SETUP_CONFIG_FILES/hera_deploy.js

nginx -s reload


