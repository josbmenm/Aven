#!./setup.sh

import { ensureFileContains, ensureFileIs, ensureLinkIs } from './utils/Files';
import { spawn, exec } from './utils/spawn';

import { request } from './utils/request';
import { ensureKey, fixKnownHosts, userHome } from './utils/User';

import { join } from 'path';

import { promises } from 'fs';
const { mkdir } = promises;

import sources from './constants/Dev.authorized_keys.Source.json';
import { setupNginx } from './setupNginx';

import {
  timezone,
  serviceName,
  runtimeDir,
  socketFilename,
  deployFolder,
  workingDir,
  deployEntrypoint,
  deployPublicKey,
} from './config';

const serviceFileContents = `[Unit]
Description=Ono Production Daemon Server
After=network.target

[Service]
Type=simple
Environment=LISTEN_PATH="${socketFilename}"
RuntimeDirectory=${runtimeDir}
#RuntimeDirectoryMode=
WorkingDirectory=${workingDir}
ExecStart=/usr/bin/node ${deployFolder}/${deployEntrypoint}
User=www-data

[Install]
WantedBy=default.target
`;

const deps: string[] = [];

// Required
deps.push('nginx');

// Dev Tools
deps.push('screen', 'git', 'yarn');

// SSL Certs
deps.push('certbot');

// Monitor
deps.push('cockpit');

async function setupMainServiceFiles() {
  const dir = mkdir(`/etc/systemd/system/${serviceName}.service.d`, {
    recursive: true,
  });

  await ensureFileIs(
    `/etc/systemd/system/${serviceName}.service`,
    serviceFileContents,
  );

  await exec(`systemctl daemon-reload`);

  await exec(`systemctl enable ${serviceName}.service`);

  return dir;
}

async function setupJournalbeat() {
  await exec(
    'wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -',
  );

  // Replace list every time
  await ensureFileIs(
    '/etc/apt/sources.list.d/elastic-7.x.list',
    'deb https://artifacts.elastic.co/packages/7.x/apt stable main\n',
  );

  await exec('apt-get update');
  await exec('apt-get install -y journalbeat');

  await exec('systemctl enable journalbeat');

  // TODO: Finish setup
  // https://www.elastic.co/guide/en/beats/journalbeat/current/journalbeat-configuration.html
}

async function setupNetdata() {
  // Nightly is recommended by Netdata https://docs.netdata.cloud/packaging/installer/#nightly-vs-stable-releases

  // const installScript = 'https://my-netdata.io/kickstart.sh'; // Nightly
  const installScript = 'https://my-netdata.io/kickstart-static64.sh'; // Stable

  await exec(`bash <(curl -Ss "${installScript}") --dont-wait`);

  // TODO: configure to work with nginx?
}

async function setupCockpit() {
  // TODO: Setup user password
  // TODO: configure to work with nginx?
}

async function setupFailureNotificationService() {
  // TODO: Fill out
  // Ruby Service
  // https://github.com/joonty/systemd_mon
  // Manually with Systemd
  // https://serverfault.com/questions/694818/get-notification-when-systemd-monitored-service-enters-failed-state
}

async function setupPersistentJournal() {
  await mkdir('/var/log/journal', { recursive: true });
}

async function setupMonitoringTools() {
  const parallelJobs = [
    setupJournalbeat(),
    setupNetdata(),
    setupCockpit(),
    setupFailureNotificationService(),
    setupPersistentJournal(),
  ];

  return Promise.all(parallelJobs);
}

/**
 * Configure root user settings
 */
async function setupRoot() {
  const userDir = await userHome('root');

  const sshConfDir = join(userDir, '.ssh');

  await mkdir(sshConfDir, { recursive: true });

  return Promise.all([
    // Make it easy for root user to clone from github
    fixKnownHosts(userDir),

    // TODO: remove old keys
    Promise.all(sources.map(async url => await request(url)))
      .then(keys => [...keys, deployPublicKey, '']) // Empty string to ensure file ends in a newline
      .then(keys => keys.join('\n'))
      .then(allKeys =>
        ensureFileIs(join(sshConfDir, 'authorized_keys'), allKeys),
      ),
  ]);
}

const screenConfig =
  "\ncaption always '%{= dg} %H %{G}| %{B}%l %{G}|%=%?%{d}%-w%?%{r}(%{d}%n %t%? {%u} %?%{r})%{d}%?%+w%?%=%{G}| %{B}%M %d %c:%s '\n";

/**
 * Tools to help devs if they need to connect to server manually
 */
async function setupDevTools() {
  return Promise.all([
    // Handy screen config (multiple tabs)
    ensureFileContains('/etc/screenrc', screenConfig),

    setupRoot(),

    // ensureFileIs('/etc/sudoers.d/ono-prod', `${user} ALL=(ALL) NOPASSWD:ALL\n`),
  ]);
}

async function setupTimezone() {
  const path = '/etc/localtime';
  const next = `/etc/share/zoneinfo/${timezone}`;

  ensureLinkIs(next, path);
}

export async function setup() {
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
  await ensureFileIs(
    '/etc/apt/sources.list.d/yarn.list',
    'deb https://dl.yarnpkg.com/debian/ stable main',
  );

  await spawn('apt-get', 'update');

  await spawn('apt-get', 'upgrade', '-y');

  await spawn(
    'apt-get',
    // Avoid all interactive prompts https://serverfault.com/questions/227190
    { stdio: 'inherit', env: { DEBIAN_FRONTEND: 'noninteractive' } },
    'install',
    '-yq',
    ...deps,
  );

  await spawn('apt-get', 'autoremove', '-y');

  // TODO: hostname, /etc/hosts

  // TODO: disable sshd password?

  await Promise.all([
    setupTimezone(),

    setupMonitoringTools(),

    setupDevTools(),

    setupNginx(),

    setupMainServiceFiles(),
  ]);

  console.log('Server configured!');
}

if (!module.parent) {
  setup().catch(e => {
    console.log('Error running!');
    console.log(e);
    process.exitCode = 1;
  });
}
