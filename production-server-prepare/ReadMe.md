# Deploy Scripts

## Usage

### Windows

```PowerShell
npm run build; if ($?) { pscp -C dist/* root@167.172.131.166:; plink -batch root@167.172.131.166 sed -i s/\\r//g index.sh "&&" bash index.sh }
```

### Posix

```bash
npm run build && scp -C dist/* root@167.172.131.166: && ssh root@167.172.131.166 bash index.sh
```

## New Server Process

1. Generate key for root/deploy
1. Add `SKYNET_DEPLOY_KEY`
1. Setup droplet with key
1. Add DNS for droplet
1. Setup Known Host key for new droplet
   1. SSH into droplet
   1. Copy new known_host line to action `.yml`
1. Push