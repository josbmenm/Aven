import createCloudClient from '../cloud-core/createCloudClient';
import createFSClient from '../cloud-server/createFSClient';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';

const source = createNodeNetworkSource({
  authority: 'onofood.co',
  useSSL: true,
});
const client = createCloudClient({
  source,
  domain: 'onofood.co',
});
const fsClient = createFSClient({ client });

console.log('hello world!12');
