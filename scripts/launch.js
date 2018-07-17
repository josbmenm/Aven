const pathJoin = require('path').join;
const fs = require('fs-extra');
const spawn = require('@expo/spawn-async');

const appName = process.argv[2];
const appPath = pathJoin(__dirname, '../src', appName);
const subpackage = JSON.parse(
  fs.readFileSync(pathJoin(appPath, 'subpackage.json')),
);
const writeFileReplacements = async (file, newval) => {
  let fileValue = await fs.readFile(file, { encoding: 'utf8' });
  const wrap = v => '//ReplaceStart\n' + v + '\n//ReplaceEnd';
  fileValue = fileValue.replace(
    /\/\/ReplaceStart(.*)\/\/ReplaceEnd/s,
    wrap(newval),
  );
  await fs.writeFile(file, fileValue);
};
const writeMobileConfig = async () => {
  const appFilePath = pathJoin(__dirname, '../mobile/App/App.js');
  const importStatement = `\nimport App from 'globe/src/${appName}';\n`;
  await writeFileReplacements(appFilePath, importStatement);
};
const iosPlatform = async () => {
  await writeMobileConfig();
  await spawn('yarn', ['ios'], { stdio: 'inherit' });
};
const androidPlatform = async () => {
  await writeMobileConfig();
  await spawn('yarn', ['android'], { stdio: 'inherit' });
};
const webPlatform = async () => {
  const serverFilePath = pathJoin(__dirname, '../src/server.js');
  const clientFilePath = pathJoin(__dirname, '../src/client.js');
  const serverImportStatement = `\export { startServer } from './${appName}/MainServer';\n`;
  const clientImportStatement = `\nimport Client from './${appName}/MainClient';\n`;
  await writeFileReplacements(serverFilePath, serverImportStatement);
  await writeFileReplacements(clientFilePath, clientImportStatement);
  await spawn('yarn', ['web'], { stdio: 'inherit' });
};
const platformFunctions = {
  ios: iosPlatform,
  android: androidPlatform,
  web: webPlatform,
};

const launchFn = platformFunctions[subpackage.platform];

if (!launchFn) {
  throw new Error(`Cannot find launcher for platform "${subpackage.platform}"`);
}

launchFn()
  .then()
  .catch(e => {
    console.error(e);
    throw e;
  });
