export const timezone = 'America/Los_Angeles';

/**
 * Name of the systemd service for our production server
 */
export const serviceName = 'ono.runway';

/**
 * Directory relative to `/run` to put run files in (working directory)
 */
export const runtimeDir = 'onoProduction';

// Some path to serve static files from. Empty means don't.
export const rootPath = '';

// Domains that point to one daemon
export const setupDomains = ['skynet.onoblends.co'];

// This cannot contain a dot `.`
export const upstreamUniqueName = setupDomains[0].replace('.', '_');

// Name of the socket file used for communications with 
export const socketFilename = 'sock';

// Directory the daemon runs in
export const workingDir = `/run/${runtimeDir}`;

// Nginx backend location
export const upstreamHost = `unix:${workingDir}/${socketFilename}`;

// Folder production code is copied to. Must match github action yml config
export const deployFolder = '/opt/production';

// Path to pass to Node to run to start daemon
export const deployEntrypoint = 'build/server';

// Folder containing live certs from letsencrypt
export const letsencryptLive = '/etc/letsencrypt/live';

// Folder letsencrypt uses to update keys
export const certbotWebrootPath = '/var/lib/letsencrypt/webroot';

// Key that can be used to connect to server from GH
export const deployPublicKey =
  'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDMzvQvR8vVeKN72DkaXcpoZu51zSS8LmX79kQMVWvchuyQPTYL2suErtPcgTqZCoZJOCSywHKKAwJcR3dVlvBFLQZKc3Dbcu8S4xFMU+PAxOZB0AmucB+B1h55G6XnggfCneaGAo1pt3jBW1ehU61TEvUTzSZYNJPVf/BwYxO65C965wboyCfLli2+89j6hCNgArY36ZaVr1NSiadll+TkjsVr6kI+pAVcKMoR+G75upzzgw5LoN2a1vE8fJfJhWn+ENnAF1NxibyBWSfyo6qeApQNv8G2ndroqJmyidV4bq6BtR/b5jIBdoCl2reIlRkZ7djEDLVsRc+3y347rqzwmo2dzNHlb13pC6Pp23PK2RlAaoUg7nABZ/6kSFprh0H/OgZAgxwXkzg8qWBH+0dU3WDFL9RYQ+PyowqXRmWshwdPX6/x13pFeRw0r8hnobUY3XpgZn6JTf2DhqDNr4kmbFONj8fYZJ+ktCZfk8MO1fF5sdsraxAjE+vHdwVJsdayQ0xJnZdPCT42LThU3zZkuPfPqE/QzZ6+g9alJSYQf93i4kWCOLDQr+V7ZCSZiSLzCY9ULCtJxtycKdMiDCfZ6/7L35cMTWApXXGzB7oOUQy+XD9u5rSngPen94o8YqrvcjY/6sV/bIatETNwlgmBo6kKYmxqnxTgWW9I66C27w== GitHub Action 2020-01-14';
