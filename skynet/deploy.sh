#!/usr/bin/env bash

echo 'Hello world!'

pwd

ls -l

# Provide current path in the format that GitHub Actions likes
echo "::set-output name=path::$(pwd)"

echo # Fix bug with GH Actions hiding data
echo # Fix bug with GH Actions hiding data