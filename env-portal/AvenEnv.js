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
  init: async ({ location }) => {
    await spawn('rsync', [
      '-a',
      __dirname + '/',
      location + '/',
      '--exclude',
      'node_modules',
    ]);
  },
  applyPackage: async ({ location, appName, srcDir, distPkg, appPkg }) => {
    const {
      bundleId,
      displayName,
      codePushKey,
      codePushChannel,
      codePushApp,
    } = appPkg.aven.envOptions;
    const distPkgPath = pathJoin(location, 'package.json');
    let outDistPkg = {
      ...distPkg,
      scripts: {
        ...distPkg.scripts,
        'aven:deploy': `npx appcenter codepush release-react -a ${codePushApp} -d ${codePushChannel} --plist-file ios/portal/Info.plist`,
      },
    };
    await fs.writeFile(distPkgPath, JSON.stringify(outDistPkg, null, 2));

    const xprojPath = `${location}/ios/portal.xcodeproj/project.pbxproj`;
    const xprojData = fs.readFileSync(xprojPath, { encoding: 'utf8' });
    const xprojOut = xprojData.replace(
      /PRODUCT_BUNDLE_IDENTIFIER = .*;/g,
      `PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};`,
    );
    await fs.writeFile(xprojPath, xprojOut);

    const infoPath = `${location}/ios/portal/Info.plist`;
    const infoData = fs.readFileSync(infoPath, { encoding: 'utf8' });
    const infoOut = infoData
      .replace(
        /<key>CFBundleDisplayName<\/key>\n	<string>.*<\/string>/,
        `<key>CFBundleDisplayName</key>
	<string>${displayName}</string>`,
      )
      .replace(
        /<key>CodePushDeploymentKey<\/key>\n	<string>.*<\/string>/,
        `<key>CodePushDeploymentKey</key>
	<string>${codePushKey}</string>`,
      );
    await fs.writeFile(infoPath, infoOut);

    await fs.writeFile(
      pathJoin(location, 'index.js'),
      `
import {AppRegistry} from 'react-native';
import App from './src-sync/${appName}/${appPkg.main}';

AppRegistry.registerComponent('portal', () => App);
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
    console.log('Before build, running yarn install in ' + location);
    await spawn('yarn', ['install'], {
      cwd: location,
      stdio: 'inherit',
    });
    await runPlatformCommand(location, 'build');
  },
  deploy: async ({ location }) => {
    console.log('Before deploy, running yarn install in ' + location);
    await spawn('yarn', ['install'], {
      cwd: location,
      stdio: 'inherit',
    });
    await runPlatformCommand(location, 'deploy');
  },
  runInPlace: true,
};
