#!/usr/bin/env bash

set -e

export NODE=/usr/bin/node

if [ ! -x "${NODE}" ]; then
    curl -sL https://deb.nodesource.com/setup_12.x | bash -
    apt-get install -y nodejs

    # Install npm dependencies if we decide to start copying a package.json too
    [ -e package.json ] && npm install --production
else
    echo "Node already installed"
fi

echo "Running Node..."

# If this is the last command, bash will use its exit status
/usr/bin/node setup/index.js
