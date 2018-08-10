import AvenServer from '../aven-web/Server';

import App from './Playground';

export async function startServer() {
  const server = await AvenServer(App);
  return server;
}
