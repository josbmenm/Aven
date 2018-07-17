/**
 * @noflow
 */

const fs = require('fs');
const path = require('path');
const blacklist = require('metro/src/blacklist');

module.exports = {
  getBlacklistRE() {
    return blacklist([
      // /\/mobile\/(?!App).*/,

      // this folder is for publishing to NPM. the RN packager should not look at it
      /\/npm-dist\//,

      // The following modules will cause @providesModule exceptions unless we blacklist them.
      // Note! the main folder must end with "globe" for this to work
      /globe\/node_modules\/react-native\/(.*)/,
      /globe\/node_modules\/react\/(.*)/,
      /globe\/node_modules\/react-native-paper\/(.*)/,
      /globe\/node_modules\/@expo\/vector-icons\/(.*)/,
    ]);
  },
  extraNodeModules: getNodeModulesForDirectory(path.resolve('.')),
};

function getNodeModulesForDirectory(rootPath) {
  const moduleBlacklist = new Set([]);

  const nodeModulePath = path.join(rootPath, 'node_modules');
  const folders = fs.readdirSync(nodeModulePath);
  return folders.reduce((modules, folderName) => {
    const folderPath = path.join(nodeModulePath, folderName);
    if (folderName.startsWith('@')) {
      const scopedModuleFolders = fs.readdirSync(folderPath);
      const scopedModules = scopedModuleFolders.reduce(
        (scopedModules, scopedFolderName) => {
          const moduleName = `${folderName}/${scopedFolderName}`;
          if (!moduleBlacklist.has(moduleName)) {
            scopedModules[moduleName] = maybeResolveSymlink(
              path.join(folderPath, scopedFolderName),
            );
          }
          return scopedModules;
        },
        {},
      );
      return Object.assign({}, modules, scopedModules);
    }
    if (!moduleBlacklist.has(folderName)) {
      modules[folderName] = maybeResolveSymlink(folderPath);
    }
    return modules;
  }, {});
}

function maybeResolveSymlink(maybeSymlinkPath) {
  if (fs.lstatSync(maybeSymlinkPath).isSymbolicLink()) {
    const resolved = path.resolve(
      path.dirname(maybeSymlinkPath),
      fs.readlinkSync(maybeSymlinkPath),
    );
    return resolved;
  }
  return maybeSymlinkPath;
}
