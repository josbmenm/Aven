import { ensureFileIs } from '../utils/Files';
import { spawn, exec } from '../utils/spawn';

export const deps: string[] = [];

export function addAptDependencies(...deps: string[]) {
  deps.push(...deps);
}

export async function setupAptDependencies() {
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
}
