const pathJoin = require('path').join;
const fs = require('fs-extra');
const spawn = require('@expo/spawn-async');

const writeFileReplacements = async (file, newval) => {
  let fileValue = await fs.readFile(file, { encoding: 'utf8' });
  const wrap = v => '//ReplaceStart\n' + v + '\n//ReplaceEnd';
  fileValue = fileValue.replace(
    /\/\/ReplaceStart(.*)\/\/ReplaceEnd/s,
    wrap(newval),
  );
  await fs.writeFile(file, fileValue);
};
const writeMobileConfig = async (appName, appPath, subPackage) => {
  const appFilePath = pathJoin(__dirname, '../mobile/App/App.js');
  const importStatement = `\nimport App from 'globe/src/${appName}';\n`;
  await writeFileReplacements(appFilePath, importStatement);
};
const configureIOSPlatform = async (appName, appPath, subPackage) => {
  await writeMobileConfig(appName, appPath, subPackage);
};
const configureAndroidPlatform = async (appName, appPath, subPackage) => {
  await writeMobileConfig(appName, appPath, subPackage);
};
const configureWebPlatform = async appName => {
  const serverFilePath = pathJoin(__dirname, '../src/server.js');
  const clientFilePath = pathJoin(__dirname, '../src/client.js');
  const serverImportStatement = `\export { startServer } from './${appName}/MainServer';\n`;
  const clientImportStatement = `\nimport Client from './${appName}/MainClient';\n`;
  await writeFileReplacements(serverFilePath, serverImportStatement);
  await writeFileReplacements(clientFilePath, clientImportStatement);
};
const configureFnForPlatform = {
  ios: configureIOSPlatform,
  android: configureAndroidPlatform,
  web: configureWebPlatform,
};

const launchIOSPlatform = async (appName, appPath, subPackage) => {
  await configureIOSPlatform(appName, appPath, subPackage);
  await spawn('yarn', ['ios'], { stdio: 'inherit' });
};
const launchAndroidPlatform = async (appName, appPath, subPackage) => {
  await configureAndroidPlatform(appName, appPath, subPackage);
  await spawn('yarn', ['android'], { stdio: 'inherit' });
};
const launchDOMPlatform = async (appName, appPath, subPackage) => {
  await configureAndroidPlatform(appName, appPath, subPackage);
  await spawn('yarn', ['android'], { stdio: 'inherit' });
};
const launchWebPlatform = async (appName, appPath, subPackage) => {
  await configureWebPlatform(appName, appPath, subPackage);
  await spawn('npx', ['razzle', 'start'], { stdio: 'inherit' });
};
const launchFnForPlatform = {
  ios: launchIOSPlatform,
  android: launchAndroidPlatform,
  web: launchWebPlatform,
  dom: launchDOMPlatform,
};
const getLauncher = platform => {
  const launchFn = launchFnForPlatform[platform];

  if (!launchFn) {
    throw new Error(`Cannot find launcher for platform "${platform}"`);
  }
  return launchFn;
};

const buildMobile = async (appName, appPath, subPackage) => {
  // todo. expo build something something
};

const buildIOSPlatform = async (appName, appPath, subPackage) => {
  await configureIOSPlatform(appName, appPath, subPackage);
  await buildMobile(appName, appPath, subPackage);
};
const buildAndroidPlatform = async (appName, appPath, subPackage) => {
  await configureAndroidPlatform(appName, appPath, subPackage);
  await buildMobile(appName, appPath, subPackage);
};
const buildWebPlatform = async (appName, appPath, subPackage) => {
  await configureWebPlatform(appName, appPath, subPackage);
  await spawn('node', ['node_modules/razzle-rn/bin/razzle.js', 'build'], {
    stdio: 'inherit',
  });
};
const buildFnForPlatform = {
  ios: buildIOSPlatform,
  android: buildAndroidPlatform,
  web: buildWebPlatform,
};
const getBuilder = platform => {
  const buildFn = buildFnForPlatform[platform];

  if (!buildFn) {
    throw new Error(
      `Cannot find builder for platform "${subpackage.platform}"`,
    );
  }
  return buildFn;
};

module.exports = {
  getLauncher,
  getBuilder,
};
