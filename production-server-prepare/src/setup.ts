#!./setup.sh

import { ensureFileContains, ensureFileIs } from './utils/Files';
import { spawn, exec } from './utils/spawn';

import { request } from './utils/request';
import { configureUser, ensureKeys, fixKnownHosts } from './utils/User';

import sources from './constants/Dev.authorized_keys.Source.json';

const setupDomains = ['skynet.onoblends.co'];

const user = 'prod';

const serviceName = 'ono.runway';

const serviceFileContents = `[Unit]
Description=Ono Production Daemon Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /home/${user}/production
User=${user}

[Install]
WantedBy=default.target`;

const deps: string[] = [];

// Required
deps.push('nginx');

// Dev Tools
deps.push('screen', 'git', 'yarn');

// SSL Certs
deps.push('certbot', 'python-certbot-nginx');

async function setupUser() {
  await configureUser(user);

  for (const url of sources) {
    ensureKeys(user, await request(url));
  }
}

async function setupNginx() {
  await spawn(
    'certbot',
    // Use nginx plugin (python-certbot-nginx)
    '--nginx',

    // Prevent interactivity
    '--noninteractive',

    // Always agree
    '--agree-tos',

    // Registered e-mail
    '-m',
    'admin@onofood.co',

    // Add a "-d" before each domain
    ...setupDomains.reduce<string[]>(
      (res, current) => res.concat('-d', current),
      [],
    ),
  );

  // TODO: Update nginx config

  // TODO: reload nginx
}

async function setupSystemd() {
  await ensureFileIs(
    `/etc/systemd/system/${serviceName}.service`,
    serviceFileContents,
  );

  // TODO: Enable Service
}

const screenConfig =
  "\ncaption always '%{= dg} %H %{G}| %{B}%l %{G}|%=%?%{d}%-w%?%{r}(%{d}%n %t%? {%u} %?%{r})%{d}%?%+w%?%=%{G}| %{B}%M %d %c:%s '\n";

async function setupDevTools() {
  const parallelJobs: Promise<void>[] = [];

  // Handy screen config (multiple tabs)
  parallelJobs.push(ensureFileContains('/etc/screenrc', screenConfig));

  // Make it easy for root user to clone from github
  parallelJobs.push(fixKnownHosts(`/root`));

  // Create and configure production user
  parallelJobs.push(setupUser());

  return Promise.all(parallelJobs);
}

async function setup() {
  const release = await exec('cat /etc/lsb-release');

  // Hacky get OS version
  const osVersion = release.stdout
    .split('\n')[3]
    .split('=')[1]
    .split('"')[1];

  console.log('OS Version', osVersion);

  // exec is passed to shell. spawn is not.

  await exec(
    'curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -',
  );
  await exec(
    'echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list',
  );

  await spawn('apt-get', 'update');

  await spawn('apt-get', 'upgrade', '-y');

  await spawn('apt-get', 'install', '-y', ...deps);

  await spawn('apt-get', 'autoremove', '-y');

  const parallelJobs: Promise<unknown>[] = [];

  parallelJobs.push(setupDevTools());

  parallelJobs.push(setupNginx());

  parallelJobs.push(setupSystemd());

  await Promise.all(parallelJobs);

  console.log('Server configured!');
}

if (!module.parent) {
  setup().catch(e => {
    console.log('Error running!');
    console.log(e);
  });
}
