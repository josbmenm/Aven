console.log('Starting Neo ENV!!');
const runInThisContext = require('vm').runInThisContext;
const spawn = require('child_process').spawn;
const execFile = require('child_process').execFile;

const metroProcess = spawn('yarn', ['react-native', 'start', '--reset-cache']);

let server = null;
async function startNode() {
  return;
  const bundle = execFile(
    'curl',
    [
      '-q',
      'http://localhost:8081/packages/something-server/Server.js.bundle?platform=server&babel_env=server&env=server&BABEL_ENV=server',
    ],
    {},
  );
  let bundleOutput = '';
  bundle.stdout.on('data', data => {
    bundleOutput = bundleOutput + data;
  });

  bundle.stderr.on('data', data => {
    console.error(data);
  });

  bundle.on('close', code => {
    if (code === 0) {
      const execCode = `
((globalRequire) => {
  console.log('YES A')
  ${bundleOutput}
  console.log('YES B', !!global.__r)
  return __r(0);
})`;
      const serverStarter = runInThisContext(execCode, {})(require);
      if (server) {
        // clean up existing server
      }
      server = serverStarter();
    }
    console.log(
      `Curl process exited with code ${code}. ${bundleOutput.length}`,
    );
  });
}

// let hasStartedNode = false;

metroProcess.stdout.on('data', data => {
  if (data.indexOf('on port 8081') !== -1) {
    setTimeout(() => {
      startNode();
    }, 2000);
  }
  process.stdout.write(data);
});

metroProcess.stderr.on('data', data => {
  process.stderr.write(data);
});

metroProcess.on('close', code => {
  console.log(`Metro process exited with code ${code}`);
});

// http://localhost:8081/packages/something-browser/Server.js.bundle

// yarn react-native start
