const spawn = require('@expo/spawn-async');

async function goProcess() {
  await spawn(
    'rsync',
    [
      '-ra',
      './process/',
      '-e',
      'ssh -p 8848',
      'ono@restaurant0.maui.onofood.co:/home/ono/process/',
    ],
    {
      stdio: 'inherit',
    },
  );
  await spawn(
    'ssh',
    [
      '-t',
      '-p',
      '8848',
      'ono@restaurant0.maui.onofood.co',
      'yarn --cwd process',
    ],
    {
      stdio: 'inherit',
    },
  );
  await spawn(
    'ssh',
    [
      '-t',
      '-p',
      '8848',
      'ono@restaurant0.maui.onofood.co',
      'node process/localProcess.js',
    ],
    {
      stdio: 'inherit',
    },
  );
}

goProcess()
  .then(() => {
    console.log('Done.');
  })
  .catch(e => {
    console.error(e);
  });
