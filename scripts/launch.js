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
const iosPlatform = async () => {};
const androidPlatform = async () => {};
const webPlatform = async () => {
  const serverFilePath = pathJoin(__dirname, '../src/server.js');
  const clientFilePath = pathJoin(__dirname, '../src/client.js');
  const importStatement = `\nimport App from './${appName}';\n`;
  await writeFileReplacements(serverFilePath, importStatement);
  await writeFileReplacements(clientFilePath, importStatement);
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
