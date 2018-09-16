import AvenServer from '@aven-cloud/web/Server';

import App from './App';

export async function startServer() {
  const server = await AvenServer(App);
  return server;
}
