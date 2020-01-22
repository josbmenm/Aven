import { ensureFileIs } from '../utils/Files';
import { exec } from '../utils/spawn';
import { serviceName } from '../config';
import { promises } from 'fs';
const { mkdir } = promises;

import {
  runtimeDir,
  socketFilename,
  deployFolder,
  workingDir,
  deployEntrypoint,
} from '../config';

export const serviceFileContents = `[Unit]
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

export async function setupMainServiceFiles() {
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
