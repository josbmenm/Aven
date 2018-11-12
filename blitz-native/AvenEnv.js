'use strict';
// Node8 file, not babel-transformed

const pathJoin = require('path').join;
const fs = require('fs-extra');
const spawn = require('@expo/spawn-async');

const runPlatformCommand = async (cwd, cmdName) => {
  await spawn('yarn', ['aven:' + cmdName], {
    cwd,
    stdio: 'inherit',
  });
};

module.exports = {
  init: async () => {},
  applyPackage: async ({ location, appName, srcDir, distPkg, appPkg }) => {
    const distPkgPath = pathJoin(location, 'package.json');
    await fs.writeFile(distPkgPath, JSON.stringify(distPkg, null, 2));

    await fs.writeFile(
      pathJoin(location, 'index.js'),
      `
import {AppRegistry} from 'react-native';
import App from './src-sync/${appName}/${appPkg.main}';

AppRegistry.registerComponent('blitz', () => App);
`,
    );
    await spawn('yarn', [], {
      cwd: location,
      stdio: 'inherit',
    });
  },
  getPackageSourceDir: location => pathJoin(location, 'src-sync'),
  getTemplatePkg: async location => {
    const pkgPath = pathJoin(__dirname, 'package.template.json');
    const pkgJSONData = fs.readFileSync(pkgPath);
    const pkgJSON = JSON.parse(pkgJSONData);
    return pkgJSON;
  },
  start: async ({ location }) => {
    await runPlatformCommand(location, 'start');
  },
  build: async ({ location }) => {
    await runPlatformCommand(location, 'build');
  },
  deploy: async ({ location }) => {
    await runPlatformCommand(location, 'deploy');
  },
  runInPlace: true,
};
