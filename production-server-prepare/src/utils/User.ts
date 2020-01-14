import { join } from 'path';
import { promises } from 'fs';

import { ensureFileContains } from './Files';
import { exec } from './spawn';

import GitHubKnownHosts from '../constants/GitHub.known_hosts.json';

const { mkdir } = promises;

const userGroups = ['sudo', 'adm', 'systemd-journal'];

const UsernameInUseUserAddExitValue = 9;

/**
 *
 * @param name Username to make
 * @param authorizedKeys Keys to add to use
 */
export async function configureUser(name: string) {
  const command = [];

  command.push('useradd');

  // Don't use a group with same name as user (use "users" instead)
  command.push('--no-user-group');
  command.push('--gid', 'users');

  command.push('--shell', '/bin/bash');

  // Create home directory for user
  command.push('--create-home');

  // Default list of groups
  command.push('--groups', userGroups.join(','));

  // Username we're making
  command.push(name);

  await exec(command.join(' ')).catch(e => {
    if (e.code !== UsernameInUseUserAddExitValue) throw e;

    console.log(`User ${name} exists`);

    // TODO: `usermod` to make sure user options are consistent (in case they change)
  });

  await mkdir(`/home/${name}/.ssh`).catch(() => {});
  await fixKnownHosts(`/home/${name}`);
}

export async function ensureKeys(user: string, keys: string) {
  await ensureFileContains(`/home/${user}/.ssh/authorized_keys`, keys);
}

export async function fixKnownHosts(userDir: string) {
  await mkdir(join(userDir, '.ssh')).catch(() => {});

  return ensureFileContains(
    join(userDir, '.ssh', 'known_hosts'),
    GitHubKnownHosts.join('\n'),
  );
}
