#!/usr/bin/env node

const minimist = require('minimist');
const {
  runClean,
  runStart,
  runBuild,
  runDeploy,
  runPublish,
  createLib,
  createApp,
} = require('./src/avenTools');

const logRespectfully = (argv, logStr) => {
  if (!argv.q) {
    console.log(logStr);
  }
};
const logResult = (argv, result, successMessage) => {
  if (argv.q) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (result) {
    successMessage && console.log(successMessage);
  } else {
    throw 'Positive result was not recieved!';
  }
};

function logHelp() {
  console.log('🌐 Aven CLI 🌐');
  console.log('Usage:');
  console.log(
    'aven start [appName] - 🎈 launch the dev environment for this app',
  );
  console.log('aven build [appName] - 🗜  run a build for this app');
  console.log(
    'aven create-app [appName] --env [envName] - 🎆 create a new app',
  );
  console.log('aven create-lib [packageName] - 💡 create a new library');
  console.log('aven clear - 🔥 wipe out all derived app data');
  console.log(
    '🚨Danger Zone: aven publish [packageName] - 📦 publish a module to npm',
  );
  console.log(
    '🚨Danger Zone: aven deploy [appName] - 🚀 deploys to configured target',
  );
}

const runCLI = async argv => {
  const command = argv._[0];
  switch (command) {
    case 'clean': {
      logRespectfully(argv, '🌐 Aven Clean 🔥');
      logRespectfully(
        argv,
        'Cleaning all Aven apps and state. This will not touch your working directory, except for the local .aven-env-state.json file, which should be ignored by git.',
      );
      return runClean(argv);
    }
    case 'start': {
      logRespectfully(argv, '🌐 Aven Start 🎈 ');
      const result = await runStart(argv);
      logResult(argv, result);
      return;
    }
    case 'build': {
      logRespectfully(argv, '🌐 Aven Build 🗜');
      const result = await runBuild(argv);
      logResult(
        argv,
        result,
        `🌐 Aven Build Complete 🗜\n${result.buildLocation}`,
      );
      return;
    }
    case 'deploy': {
      logRespectfully(argv, '🌐 Aven Deploy 🚀');
      const result = await runDeploy(argv);
      logResult(argv, result, '');
      return;
    }
    case 'publish': {
      logRespectfully(argv, '🌐 Aven Publish 📦');
      const result = await runPublish(argv);
      logResult(argv, result, '');
      return;
    }
    case 'test': {
      logRespectfully(argv, '🌐 Aven Test 🚦 (coming soon');
      return;
    }
    case 'create-lib': {
      logRespectfully(argv, '🌐 Aven Create Lib 💡');
      const pkgName = argv._[1];
      await createLib(pkgName);
      return;
    }
    case 'create-app': {
      logRespectfully(argv, '🌐 Aven Create App 🎆');
      const app = argv._[1];
      const env = argv.env;
      await createApp(app, env || 'web');
      return;
    }
    case 'help':
    default: {
      logHelp();
      return;
    }
  }
};

const cliArgv = minimist(process.argv.slice(2));

runCLI(cliArgv)
  .then(() => {
    logRespectfully(cliArgv, '🌐 ✅');
  })
  .catch(console.error);
