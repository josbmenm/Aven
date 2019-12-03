import App from './App';

import { startWebClient } from '@aven-cloud/aven-web';
import { CloudContext, createClient } from '@aven-cloud/cloud-core';

import { createBrowserNetworkSource } from '@aven-cloud/cloud-browser';

const networkSource = createBrowserNetworkSource({
  authority: 'localhost:3000',
  useSSL: false,
});

const client = createClient({
  source: networkSource,
  domain: 'example.aven.cloud',
});

const context = new Map();

context.set(CloudContext, client);

export default function startClient() {
  startWebClient(App, context);
}
