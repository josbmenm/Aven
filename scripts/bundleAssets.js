const fetch = require('node-fetch');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const appDistName = process.argv[2];
const clientMainFile = process.argv[3];

const child = spawn(
  './node_modules/@react-native-community/cli/build/bin.js',
  ['start'],
  {
    env: process.env,
  },
);
child.on('exit', code => {
  console.log('Metro closed with code: ' + code);
});
child.stdout.on('data', data => {
  if (data.indexOf('Welcome to React Native!') !== -1) {
    fetch(`http://localhost:8081/src/${clientMainFile}.assets?platform=web`)
      .then(resp => {
        return resp.json();
      })
      .then(assets => {
        return fs.writeFile(
          `dist/${appDistName}/server/AssetManifest.json`,
          JSON.stringify(assets),
        );
      })
      .catch(e => {
        console.error(e);
      })
      .finally(() => {
        process.exit(0);
      });
  }
});
child.stderr.on('data', data => {});
