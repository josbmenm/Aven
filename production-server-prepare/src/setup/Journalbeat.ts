import { ensureFileIs } from '../utils/Files';
import { exec } from '../utils/spawn';

export async function setupJournalbeat() {
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
