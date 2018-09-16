import AvenServer from '@aven-cloud/web/Server';

import App from './Cloud';

export async function startServer() {
  const server = await AvenServer(App);
  return server;
}
