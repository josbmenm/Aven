#!/usr/bin/env bash

set -e

curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs

[ -e package.json ] && npm install --production

echo "Running Node"

/usr/bin/node << 'EOF'
