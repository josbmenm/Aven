import { ensureFileIs } from '../../utils/Files';
import { exec } from '../../utils/spawn';

const journalbeatConfig = `journalbeat.inputs:
- paths: []
  #backoff: 1s
  #max_backoff: 20s
  seek: cursor
  #cursor_seek_fallback: head
  #include_matches: []
  #fields:

#journalbeat:
  #registry_file: registry

setup.template.settings:
  index.number_of_shards: 1
  #index.codec: best_compression
  #_source.enabled: false

#name:
#tags: ["service-X", "web-tier"]
#fields:

#setup.dashboards.enabled: false
#setup.dashboards.url:

setup.kibana:
  host: "bender0.onofood.co:5601"

output.elasticsearch:
  hosts: ["167.71.113.119:9200"] # TODO: Why is this an IP?
  #protocol: "https"
  username: "elastic"
  password: "logging$ecret" # TODO: Make this actually secret

#output.logstash:
  #hosts: ["localhost:5044"]
  #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]
  #ssl.certificate: "/etc/pki/client/cert.pem"
  #ssl.key: "/etc/pki/client/cert.key"

processors:
  - add_host_metadata: ~
  - add_cloud_metadata: ~  
  - decode_json_fields:
    fields: ["message"]
    process_array: true
    max_depth: 8
    target: ""

#logging.level: debug
#logging.selectors: ["*"]

#monitoring.enabled: false
#monitoring.cluster_uuid:
#monitoring.elasticsearch:

#migration.6_to_7.enabled: true
`;

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

  const change = await ensureFileIs(
    '/etc/journalbeat/journalbeat.yml',
    journalbeatConfig,
  );

  await exec(`systemctl ${change ? 'restart' : 'start'} journalbeat`);

  // TODO: Finish setup
  // https://www.elastic.co/guide/en/beats/journalbeat/current/journalbeat-configuration.html
}
