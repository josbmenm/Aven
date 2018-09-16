const pathJoin = require('path').join;
const fs = require('fs-extra');
const { getLauncher } = require('./utils');

const appName = process.argv[2];
const appPath = pathJoin(__dirname, '../src', appName);
const pkgJson = JSON.parse(fs.readFileSync(pathJoin(appPath, 'package.json')));

getLauncher(pkgJson.globe.platform)(appName, appPath, pkgJson)
  .then()
  .catch(e => {
    console.error(e);
    throw e;
  });
