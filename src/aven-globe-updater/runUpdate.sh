#!/bin/bash

git pull

echo "Removing node modules"
rm -rf node_modules

echo "Yarn"
yarn --production false

echo "Yarn pre:build"
yarn pre:build

echo "Yarn build-web"
yarn web-build