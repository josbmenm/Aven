import { join } from 'path';
import { promises } from 'fs';

import { ensureFileContains } from './Files';
import { exec } from './spawn';

import GitHubKnownHosts from '../constants/GitHub.known_hosts.json';

const { mkdir } = promises;

const userGroups = ['sudo', 'adm', 'systemd-journal'];

const UsernameInUseUserAddExitValue = 9;

export async function userHome(name: string): Promise<string> {
  // TODO: Read from os
  return name == 'root' ? '/root' : `/home/${name}`;
}

/**
 *
 * @param name Username to make
 * @param authorizedKeys Keys to add to use
 */
export async function createAndConfigureUser(name: string) {
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

  const home = await userHome(name);

  await mkdir(`${home}/.ssh`, { recursive: true });
  await fixKnownHosts(home);
}

export async function ensureKey(user: string, key: string) {
  await ensureFileContains(`${await userHome(user)}/.ssh/authorized_keys`, key);
}

export async function fixKnownHosts(userDir: string) {
  return ensureFileContains(
    join(userDir, '.ssh', 'known_hosts'),
    GitHubKnownHosts.join('\n'),
  );
}
