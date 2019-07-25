#!/usr/bin/env bash

ssh ono@bender.onofood.co -t "cd ono-source && git pull"

ssh ono@bender.onofood.co -t "sudo pm2 startOrRestart ono-source/bender/ecosystem.js --env production"