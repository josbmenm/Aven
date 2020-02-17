let httpServer = null;
let serverInstance = null;

async function startInstance(appModule) {
  serverInstance && (await serverInstance.close());
  serverInstance = null;
  const startServer = appModule.default;
  if (httpServer) {
    serverInstance = await startServer(httpServer);
  } else {
    serverInstance = await startServer();
    httpServer = serverInstance.httpServer;
  }
}

function applyInstance(appModule) {
  startInstance(appModule)
    .then(() => {
      console.log('✅  Server Running');
    })
    .catch(e => {
      console.error(e);
      process.exit(47);
    });
}

applyInstance(require('./server'));

// if (module.hot) {
//   console.log('✅  Server-side HMR Enabled!');

//   module.hot.accept('./server', () => {
//     console.log('🔁  HMR Reloading...');

//     try {
//       applyInstance(require('./server'));
//     } catch (error) {
//       console.error(error);
//       process.exit(47);
//     }
//   });
// }
