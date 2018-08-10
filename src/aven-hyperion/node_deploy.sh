#!/bin/bash

# can remove this when new images are created (node_setup.sh)
mkdir /socket

node /SETUP_CONFIG_FILES/node_deploy.js

nginx -s reload