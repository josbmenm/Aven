import AvenServer from '@aven-cloud/web/Server';

import App from './AppWeb';

export async function startServer() {
  const server = await AvenServer(App);
  return server;
}
