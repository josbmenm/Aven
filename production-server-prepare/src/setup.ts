#!./setup.sh

import { ensureFileContains, ensureFileIs } from './utils/Files';
import { spawn, exec } from './utils/spawn';

import { request } from './utils/request';
import { configureUser, ensureKeys, fixKnownHosts } from './utils/User';

import { promises } from 'fs';
const { mkdir } = promises;

import sources from './constants/Dev.authorized_keys.Source.json';
import { setupNginx } from './setupNginx';

const user = 'prod';

const serviceName = 'ono.runway';

const serviceFileContents = `[Unit]
Description=Ono Production Daemon Server
After=network.target

[Service]
Type=simple
Environment=PORT="8840"
Environment=LISTEN_HOST="0.0.0.0"
WorkingDirectory=/home/${user}/production
ExecStart=/usr/bin/node /home/${user}/production/build/server
User=${user}

[Install]
WantedBy=default.target`;

const deps: string[] = [];

// Required
deps.push('nginx');

// Dev Tools
deps.push('screen', 'git', 'yarn');

// SSL Certs
deps.push('certbot');

// Monitor
deps.push('cockpit');

async function setupUser() {
  await configureUser(user);

  // TODO: remove old keys
  for (const url of sources) {
    ensureKeys(user, await request(url));
  }
}

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

const journalbeatDeb =
  'https://artifacts.elastic.co/downloads/beats/journalbeat/journalbeat-7.5.1-amd64.deb';

async function setupJournalbeat() {
  await spawn('dpkg', '-i', journalbeatDeb);

  // TODO: Finish setup
  // https://www.elastic.co/guide/en/beats/journalbeat/current/journalbeat-configuration.html
}

async function setupNetdata() {
  // Nightly is recommended by Netdata https://docs.netdata.cloud/packaging/installer/#nightly-vs-stable-releases
  // await spawn('bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait', true),

  // Stable
  await spawn(
    'bash <(curl -Ss https://my-netdata.io/kickstart-static64.sh) --dont-wait',
    true,
  );

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

const screenConfig =
  "\ncaption always '%{= dg} %H %{G}| %{B}%l %{G}|%=%?%{d}%-w%?%{r}(%{d}%n %t%? {%u} %?%{r})%{d}%?%+w%?%=%{G}| %{B}%M %d %c:%s '\n";

async function setupDevTools() {
  const parallelJobs: Promise<void>[] = [
    // Handy screen config (multiple tabs)
    ensureFileContains('/etc/screenrc', screenConfig),

    // Make it easy for root user to clone from github
    fixKnownHosts(`/root`),

    // Create and configure production user
    setupUser(),

    ensureFileIs('/etc/sudoers.d/ono-prod', `${user} ALL=(ALL) NOPASSWD:ALL\n`),
  ];

  return Promise.all(parallelJobs);
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
  await exec(
    'echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list',
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

  // TODO: timezone, hostname, /etc/hosts

  // TODO: disable sshd password?

  const parallelJobs: Promise<unknown>[] = [];

  parallelJobs.push(setupMonitoringTools());

  parallelJobs.push(setupDevTools());

  parallelJobs.push(setupNginx());

  parallelJobs.push(setupMainServiceFiles());

  await Promise.all(parallelJobs);

  console.log('Server configured!');
}

if (!module.parent) {
  setup().catch(e => {
    console.log('Error running!');
    console.log(e);
  });
}
