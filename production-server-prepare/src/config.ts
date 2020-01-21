
export const timezone = 'America/Los_Angeles';

export const user = 'prod';

export const serviceName = 'ono.runway';

export const runtimeDir = 'onoProduction';

// Some path to serve static files from. Empty means don't.
export const rootPath = '';

// Domains that point to one host
export const setupDomains = ['skynet.onoblends.co'];

// This cannot contain a dot `.`
export const upstreamUniqueName = 'skynet';

// Pick one
export const upstreamHost = `unix:/tmp/${runtimeDir}` || 'localhost:9001';

export const letsencryptLive = '/etc/letsencrypt/live';

export const certbotWebrootPath = '/var/lib/letsencrypt/webroot';
