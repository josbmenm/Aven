
#!/usr/bin/env bash

set -e

echo  "Initiate the test sequence!"
echo  "---------------------------"

docker_compose_up() {
  docker-compose -f docker-compose.yml up -d
}

docker_compose_down() {
  docker-compose -f docker-compose.yml down
}

run_jest() {
  NODE_EXECUTABLE="node"
  if [[ -n "$NODE_ARGS" ]]; then
    NODE_EXECUTABLE="$NODE_EXECUTABLE $NODE_ARGS"
  fi
  $NODE_EXECUTABLE ../node_modules/.bin/jest "$@" --runInBand --testPathIgnorePatterns=/dist
}

echo  "Initializing Docker containers.."

# Silently close existing docker containers
docker-compose down &>/dev/null

docker_compose_up

echo "Containers created. Waiting for DB to start up.."

sleep 2

echo  "Running database migration.."

../node_modules/knex/bin/cli.js migrate:latest --env testing

echo  "Migration complete."

sleep 2

echo "Running tests.."

if run_jest "$@"; then
  echo  "Tests pass!"
  docker_compose_down
else
  echo  "Tests failed."
  docker_compose_down
  exit 1
fi

exit 0
