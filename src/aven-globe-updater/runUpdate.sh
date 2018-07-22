#!/bin/bash

git pull

rm -rf node_modules/ && yarn && node scripts/vendorDist.js && yarn format --fix

yarn web-build