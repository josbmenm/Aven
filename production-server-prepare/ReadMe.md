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
