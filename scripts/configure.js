const pathJoin = require('path').join;
const fs = require('fs-extra');
const { getConfigurer } = require('./utils');

const appName = process.argv[2];
const appPath = pathJoin(__dirname, '../src', appName);
const subpackage = JSON.parse(
  fs.readFileSync(pathJoin(appPath, 'subpackage.json')),
);

getConfigurer(subpackage.platform)(appName, appPath, subpackage)
  .then()
  .catch(e => {
    console.error(e);
    throw e;
  });
