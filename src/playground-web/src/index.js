import { startServer } from './server';

let currentApp = null;

startServer()
  .then(app => {
    currentApp = app;
    console.log('🚀 Server Started');
  })
  .catch(e => {
    console.error(e);
    throw e;
  });

async function reload() {
  if (currentApp) {
    await currentApp.close();
  }
  const startNewServer = require('./server').startServer;
  currentApp = await startNewServer();
}

if (module.hot) {
  console.log('✅  Server-side Hot Reloading Enabled!');

  module.hot.accept('./server', () => {
    reload()
      .then(() => {
        '🔁  Hot Reload Complete 🚀';
      })
      .catch(e => {
        console.error('Error During Hot Reload');
        console.error(e);
      });
  });
}
