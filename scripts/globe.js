#!/usr/bin/env node

const pathJoin = require('path').join;
const fs = require('fs-extra');
const spawn = require('@expo/spawn-async');

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
        pathJoin(__dirname, '..') + '/',
        globeDir,
      ],
      { stdio: 'inherit' },
    );
    await spawn('yarn', [], { stdio: 'inherit', cwd: globeDir });
    await spawn('yarn', ['build-vendor'], { stdio: 'inherit', cwd: globeDir });
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

  syncLoop();

  await spawn('yarn', ['launch', appName], {
    stdio: 'inherit',
    cwd: globeDir,
  });
}

async function build(args) {
  const appName = args[0];
}

async function runProd() {
  await spawn(
    'rsync',
    [
      '-a',
      pathJoin(process.cwd(), appName) + '/',
      pathJoin(globeDir, 'src', appName),
    ],
    { stdio: 'inherit' },
  );
}

const command = process.argv[2];
const args = process.argv.slice(3);
const commandFunctions = { start, build, 'run-prod': runProd };
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
