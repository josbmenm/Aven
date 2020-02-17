import App from './App';

import startWebClient from '../aven-web/WebClient';
import CloudContext from '../cloud-core/CloudContext';
import createCloudClient from '../cloud-core/createCloudClient';
import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';

const networkSource = createBrowserNetworkSource({
  authority: 'localhost:3000',
  useSSL: false,
});

const cloud = createCloudClient({
  source: networkSource,
  domain: 'runway.aven.cloud',
});

const context = new Map();

context.set(CloudContext, cloud);

export default function startClient() {
  startWebClient(App, context);
}
