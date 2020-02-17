const fs = require('fs-extra');
const pathJoin = require('path').join;
const spawn = require('@expo/spawn-async');

const protoPath = pathJoin(__dirname, '../proto/expo');

const getPackageSourceDir = location => pathJoin(location, 'src-sync');

const getTemplatePkg = async () => {
  const pkgPath = pathJoin(protoPath, 'package.template.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath));
  return pkg;
};

const applyPackage = async ({ location, appName, appPkg, distPkg }) => {
  const appPath = pathJoin(location, 'App.js');
  const mainAppFileData = `
import App from './src-sync/${appName}/${appPkg.main}';

export default App;`;
  await fs.writeFile(appPath, mainAppFileData);
  const defaultExpoConfig = {
    name: 'app',
    description: 'App description coming soon',
    slug: 'expo-app',
    privacy: 'unlisted',
    sdkVersion: '32.0.0',
    platforms: ['ios', 'android'],
    version: '0.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
  };
  const appExpoConfig = appPkg.aven.envOptions && appPkg.aven.envOptions.app;
  const expoConfig = { ...defaultExpoConfig, ...appExpoConfig };
  const appJsonData = JSON.stringify({ expo: expoConfig }, null, 2);
  await fs.writeFile(pathJoin(location, 'app.json'), appJsonData);

  const distPkgPath = pathJoin(location, 'package.json');
  await fs.writeFile(distPkgPath, JSON.stringify(distPkg, null, 2));

  await spawn('yarn', { cwd: location, stdio: 'inherit' });
};

const init = async ({ appName, appPkg, location, srcDir }) => {
  await fs.copy(pathJoin(protoPath), location);
};

const start = async ({ appName, appPkg, location, srcDir }) => {
  await spawn('exp', ['start'], { cwd: location, stdio: 'inherit' });
};

module.exports = {
  init,
  start,
  getTemplatePkg,
  applyPackage,
  getPackageSourceDir,
};
