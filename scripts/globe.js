#!/usr/bin/env node

const pathJoin = require('path').join;
const fs = require('fs-extra');
const spawn = require('@expo/spawn-async');

const localGlobeDir = pathJoin(__dirname, '..');

const currentDir = process.cwd();

const isRunningInThisGlobe = localGlobeDir === currentDir;

async function prepareGlobe() {
  let globeDir = process.env.GLOBE_DIR;
  if (!globeDir && !isRunningInThisGlobe) {
    globeDir = pathJoin(process.env.HOME, `.globe/g-${Date.now()}-globe`);
    tmpGlobeDir = globeDir;
    console.log(
      'No GLOBE_DIR found in the environment. Creating a new globe working directory: ' +
        globeDir,
    );
    await fs.mkdirp(globeDir);
    await spawn(
      'rsync',
      ['-a', '--exclude', 'node_modules', localGlobeDir + '/', globeDir],
      { stdio: 'inherit' },
    );
    await spawn('yarn', [], { stdio: 'inherit', cwd: globeDir });
  }
  return globeDir;
}

const syncSrcToGlobe = async (appName, globeDir) => {
  if (isRunningInThisGlobe) {
    return;
  }
  await spawn(
    'rsync',
    [
      '-a',
      pathJoin(currentDir, appName) + '/',
      pathJoin(globeDir, 'src', appName),
    ],
    { stdio: 'inherit' },
  );
};

const syncPublicToGlobe = async (appName, globeDir) => {
  if (isRunningInThisGlobe) {
    return;
  }
  await spawn(
    'rsync',
    [
      '-a',
      pathJoin(process.cwd(), appName) + '/public/',
      pathJoin(globeDir, 'public'),
    ],
    { stdio: 'inherit' },
  );
};

async function start(args) {
  const appName = args[0];
  if (!appName) {
    throw new Error(
      'App name must be provided! Start with `yarn start my-app`',
    );
  }
  console.log('Starting app ' + appName);

  const globeDir = await prepareGlobe();

  const syncLoop = async () => {
    await syncSrcToGlobe(appName, globeDir);
    await syncPublicToGlobe(appName, globeDir);
    setTimeout(syncLoop, 500);
  };

  syncLoop(); // no await here because it goes indefinitely, and we want to spawn start:

  await spawn('yarn', ['globe:start', appName], {
    stdio: 'inherit',
    cwd: globeDir,
    env: {
      ...process.env,
      GLOBE_APP: appName,
    },
  });
}

async function build(args) {
  const appName = args[0];
  if (!appName) {
    throw new Error(
      'App name must be provided! Build with `yarn build my-app`',
    );
  }
  console.log('Building app ' + appName);
  const globeDir = await prepareGlobe();
  console.log('A', appName, globeDir);
  await syncSrcToGlobe(appName, globeDir);
  console.log('B');
  await syncPublicToGlobe(appName, globeDir);
  console.log('C');

  await spawn('yarn', [], { stdio: 'inherit', cwd: globeDir });

  await spawn('yarn', ['globe:build', appName], {
    stdio: 'inherit',
    cwd: globeDir,
    env: {
      ...process.env,
      GLOBE_APP: appName,
    },
  });

  // await spawn(
  //   'rsync',
  //   ['-a', pathJoin(globeDir, 'build') + '/', pathJoin(process.cwd(), 'build')],
  //   { stdio: 'inherit' },
  // );

  if (!isRunningInThisGlobe && !process.env.GLOBE_DIR) {
    await fs.remove(tmpGlobeDir);
  }
}

const command = process.argv[2];
const args = process.argv.slice(3);
const commandFunctions = { start, build };
const mainFn = commandFunctions[command];

if (!mainFn) {
  throw new Error(`Cannot find command "${command}". Try start`);
}

mainFn(args)
  .then()
  .catch(e => {
    console.error(e);
    throw e;
  });
