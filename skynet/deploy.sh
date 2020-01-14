#!/usr/bin/env bash

echo 'Hello world!'

pwd

ls -l

echo "::set-output name=path::$(pwd)"