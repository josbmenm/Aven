import App from './App';

import startWebClient from '../aven-web/WebClient';
import CloudContext from '../cloud-core/CloudContext';
import createCloudClient from '../cloud-core/createCloudClient';
import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';

const networkSource = createBrowserNetworkSource({
  authority: null, // this means to inherit from the server
  useSSL: null,
});

const client = createCloudClient({
  source: networkSource,
  domain: 'todo.aven.io',
});

client.get('TaskReducer').markRemoteLambda(true);

const context = new Map();

context.set(CloudContext, client);

export default function startClient() {
  startWebClient(App, context);
}
