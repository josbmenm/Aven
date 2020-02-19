import App from './App';

import { startWebClient } from '@aven/web-browser';
import { CloudContext } from '@aven/cloud-core';
import { createCloudClient } from '@aven/cloud-core';
import { createBrowserNetworkSource } from '@aven/cloud-browser';

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
