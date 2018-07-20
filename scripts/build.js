const pathJoin = require('path').join;
const fs = require('fs-extra');
const { getBuilder } = require('./utils');

const appName = process.argv[2];
const appPath = pathJoin(__dirname, '../src', appName);
const subpackage = JSON.parse(
  fs.readFileSync(pathJoin(appPath, 'subpackage.json')),
);

getBuilder(subpackage.platform)(appName, appPath, subpackage)
  .then()
  .catch(e => {
    console.error(e);
    throw e;
  });
