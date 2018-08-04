#!/usr/bin/env node

const pathJoin = require('path').join;
const fs = require('fs-extra');
const spawn = require('@expo/spawn-async');

const localGlobeDir = pathJoin(__dirname, '..');

async function start(args) {
  const appName = args[0];
  console.log('Starting app ' + appName);
  let globeDir = process.env.GLOBE_DIR;
  if (!globeDir) {
    globeDir = pathJoin(process.env.HOME, `.globe/g-${Date.now()}-globe`);
    console.log(
      'No GLOBE_DIR found in the environment. Creating a new globe working directory: ' +
        globeDir,
    );
    await fs.mkdirp(globeDir);
    await spawn(
      'rsync',
      [
        '-a',
        '--exclude',
        'node_modules',
        localGlobeDir + '/',
        globeDir,
      ],
      { stdio: 'inherit' },
    );
    await spawn('yarn', [], { stdio: 'inherit', cwd: globeDir });
  }

  const syncSrcToGlobe = async () =>
    await spawn(
      'rsync',
      [
        '-a',
        pathJoin(process.cwd(), appName) + '/',
        pathJoin(globeDir, 'src', appName),
      ],
      { stdio: 'inherit' },
    );

  const syncLoop = async () => {
    await syncSrcToGlobe();
    setTimeout(syncLoop, 500);
  };

  syncLoop(); // no await here because it goes indefinitely, and we want to spawn start:

  await spawn('yarn', ['start', appName], {
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

  console.log('Building app ' + appName);
  let globeDir = process.env.GLOBE_DIR;
  if (!globeDir) {
    globeDir = pathJoin(process.env.HOME, `.globe/g-${Date.now()}-globe`);
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
  await spawn(
    'rsync',
    [
      '-a',
      pathJoin(process.cwd(), appName) + '/',
      pathJoin(globeDir, 'src', appName),
    ],
    { stdio: 'inherit' },
  );
  await spawn(
    'rsync',
    [
      '-a',
      pathJoin(process.cwd(), appName) + '/public/',
      pathJoin(globeDir, 'public'),
    ],
    { stdio: 'inherit' },
  );
  await spawn('yarn', [], { stdio: 'inherit', cwd: globeDir });

  await spawn('yarn', ['build', appName], {
    stdio: 'inherit',
    cwd: globeDir,
    env: {
      ...process.env,
      GLOBE_APP: appName,
    },
  });

  await spawn(
    'rsync',
    ['-a', pathJoin(globeDir, 'build') + '/', pathJoin(process.cwd(), 'build')],
    { stdio: 'inherit' },
  );
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
