import { ensureFileIs } from '../utils/Files';
import { request } from '../utils/request';
import { fixKnownHosts, userHome } from '../utils/User';
import { join } from 'path';
import sources from '../constants/Dev.authorized_keys.Source.json';
import { deployPublicKey } from '../config';

import { promises } from 'fs';
const { mkdir } = promises;

/**
 * Configure root user settings
 */
export async function setupRoot() {
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
