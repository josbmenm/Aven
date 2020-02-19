import App from './App';

import { startWebClient } from '@aven/web-browser';
import { CloudContext } from '@aven/cloud-core';
import { createCloudClient } from '@aven/cloud-core';
import { createBrowserNetworkSource } from '@aven/cloud-browser';

const networkSource = createBrowserNetworkSource({
  authority: 'localhost:3000',
  useSSL: false,
});

const client = createCloudClient({
  source: networkSource,
  domain: 'example.aven.cloud',
});

const context = new Map();

context.set(CloudContext, client);

export default function startClient() {
  startWebClient(App, context);
}
