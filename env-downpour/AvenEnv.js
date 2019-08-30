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
      appcenterSecret,
      codePushKey,
      codePushChannel,
      codePushApp,
      appIcon,
    } = appPkg.aven.envOptions;
    const distPkgPath = pathJoin(location, 'package.json');
    let outDistPkg = {
      ...distPkg,
      scripts: {
        ...distPkg.scripts,
        'aven:deploy': `npx appcenter codepush release-react -a ${codePushApp} -d ${codePushChannel} --plist-file ios/downpour/Info.plist`,
      },
    };
    await fs.writeFile(distPkgPath, JSON.stringify(outDistPkg, null, 2));

    const xprojPath = `${location}/ios/downpour.xcodeproj/project.pbxproj`;
    const xprojData = fs.readFileSync(xprojPath, { encoding: 'utf8' });
    const xprojOut = xprojData.replace(
      /PRODUCT_BUNDLE_IDENTIFIER = .*;/g,
      `PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};`,
    );
    await fs.writeFile(xprojPath, xprojOut);

    const appIconPath = appIcon
      ? `${srcDir}/${appName}/${appIcon}`
      : `${location}/DefaultIcon.png`;
    const infoPath = `${location}/ios/downpour/Info.plist`;
    const infoTemplatePath = `${location}/ios/downpour/Info.template.plist`;
    const appCenterInfoPath = `${location}/ios/downpour/AppCenter-Config.plist`;
    const appCenterInfoTemplatePath = `${location}/ios/downpour/AppCenter-Config.template.plist`;
    const infoData = fs.readFileSync(infoTemplatePath, { encoding: 'utf8' });
    const appCenterInfoData = fs.readFileSync(appCenterInfoTemplatePath, {
      encoding: 'utf8',
    });
    const IMAGE_TARGETS = {
      'IconArtwork.png': 1024,
      'icon_20pt@2x.png': 40,
      'icon_60pt@3x.png': 180,
      'icon_20pt@3x.png': 60,
      'icon_29pt@2x.png': 58,
      'icon_40pt@2x.png': 80,
      'icon_76pt.png': 76,
      'icon_20pt.png': 20,
      'icon_29pt@3x.png': 87,
      'icon_40pt@3x.png': 120,
      'icon_76pt@2x.png': 152,
      'icon_29pt.png': 29,
      'icon_40pt.png': 40,
      'icon_60pt@2x.png': 120,
      'icon_83.5@2x.png': 167,
    };
    await Promise.all(
      Object.entries(IMAGE_TARGETS).map(async ([iconName, size]) => {
        const iconDest = `${location}/ios/downpour/Images.xcassets/AppIcon.appiconset/${iconName}`;
        await spawn('convert', [
          '-resize',
          `${size}X${size}`,
          appIconPath,
          iconDest,
        ]);
      }),
    );
    console.log(
      `Did resize app icons and install to ${location}/ios/downpour/Images.xcassets/AppIcon.appiconset`,
    );
    const infoOut = infoData
      .replace(
        /<key>CFBundleDisplayName<\/key><string>.*<\/string>/,
        `<key>CFBundleDisplayName</key><string>${displayName}</string>`,
      )
      .replace(
        /<key>CodePushDeploymentKey<\/key><string>.*<\/string>/,
        `<key>CodePushDeploymentKey</key><string>${codePushKey}</string>`,
      );
    const appCenterInfoOut = appCenterInfoData.replace(
      /<key>AppSecret<\/key><string>.*<\/string>/,
      `<key>AppSecret</key><string>${appcenterSecret}</string>`,
    );
    await fs.writeFile(infoPath, infoOut);
    await fs.writeFile(appCenterInfoPath, appCenterInfoOut);

    await fs.writeFile(
      pathJoin(location, 'index.js'),
      `
import {AppRegistry} from 'react-native';
import App from './src-sync/${appName}/${appPkg.main}';

AppRegistry.registerComponent('downpour', () => App);
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
