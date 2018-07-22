# Server Lifecycle


## Create the Base Image:

- Start new droplet on DO with Debian 9 x64 and local ssh key

SETUP_IP=206.189.209.180
scp -o StrictHostKeyChecking=no src/aven-hyperion/base_setup.sh "root@$SETUP_IP:/base_setup.sh"
ssh "root@$SETUP_IP" -t "chmod u+x /base_setup.sh && /base_setup.sh" -o StrictHostKeyChecking=no
ssh "root@$SETUP_IP" -t "shutdown now"

On DO, name this image "proto-base"

## Setup a `artemis-node` Image:

- Fork a base image

SETUP_IP=138.68.21.168
rsync -e "ssh -o StrictHostKeyChecking=no" --exclude=node_modules -r . "root@$SETUP_IP:/globe"
ssh "root@$SETUP_IP" -t "chmod u+x /globe/src/aven-hyperion/node_setup.sh && /globe/src/aven-hyperion/node_setup.sh" -o StrictHostKeyChecking=no
ssh "root@$SETUP_IP" -t "shutdown now"

On DO, name this image "proto-artemis-node"


## Setup a `artemis-pg` Image:

- Fork a base image

SETUP_IP=167.99.101.118
scp -o StrictHostKeyChecking=no src/aven-hyperion/pg_setup.sh "root@$SETUP_IP:/pg_setup.sh"
ssh "root@$SETUP_IP" -t "chmod u+x /pg_setup.sh && /pg_setup.sh" -o StrictHostKeyChecking=no
ssh "root@$SETUP_IP" -t "shutdown now"

On DO, name this image "proto-artemis-pg"


## Setup a `hera` image

- Fork a base image

SETUP_IP=178.128.69.241
rsync -e "ssh -o StrictHostKeyChecking=no" --exclude=node_modules -r . "root@$SETUP_IP:/globe"
ssh "root@$SETUP_IP" -t "chmod u+x /globe/src/aven-hyperion/hera_setup.sh && /globe/src/aven-hyperion/hera_setup.sh" -o StrictHostKeyChecking=no
ssh "root@$SETUP_IP" -t "shutdown now"

On DO, name this image "proto-hera"

