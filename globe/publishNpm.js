const fs = require('fs-extra');
const { join, basename, relative } = require('path');
const klawSync = require('klaw-sync');
const babel = require('babel-core');
const presetReact = require('babel-preset-react');
const classProperties = require('babel-plugin-transform-class-properties');
const presetEnv = require('babel-preset-env');
const restSpread = require('babel-plugin-transform-object-rest-spread');
const { execFileSync } = require('child_process');
const {
  identifier,
  importSpecifier,
  importDefaultSpecifier,
  expressionStatement,
  nullLiteral,
} = require('babel-types');

const REPO_DEP_NAMES = {};

function publishModule(moduleName) {
  const source = join('./src', moduleName);
  const npmOutDir = './npm-dist';

  function performSrcTransform(fileData, filePath, subModulePath) {
    const npmDeps = new Set();
    const repoDeps = new Set();

    const handleImportTransform = lastImport => {
      if (lastImport.match(/^\.\//)) {
        // starts with ./
        // Import is already correct
        return lastImport;
      }
      const repoPathMatch = lastImport.match(/\.\.\/(.*)$/);
      if (repoPathMatch) {
        // starts with ../
        const relativeRef = relative(subModulePath, join(filePath, lastImport));
        const isRepoDep = !relativeRef.match(/\//);
        const newImport = isRepoDep ? REPO_DEP_NAMES[relativeRef] : lastImport;
        isRepoDep && repoDeps.add(relativeRef);
        return newImport;
      }
      npmDeps.add(lastImport);
      return lastImport;
    };

    const handledBabelSrc = babel.transform(fileData, {
      sourceMaps: true,
      comments: true,
      parserOpts: {
        plugins: ['jsx', 'objectRestSpread', 'classProperties', 'flow'],
      },
      plugins: [
        ({ parse, traverse }) => ({
          visitor: {
            CallExpression(path) {
              if (path.node.callee && path.node.callee.name === 'require') {
                if (
                  path.node.arguments.length === 1 &&
                  path.node.arguments[0].value
                ) {
                  path.node.arguments[0].value = handleImportTransform(
                    path.node.arguments[0].value,
                  );
                }
              }
            },
            ImportDeclaration(path) {
              path.node.source.value = handleImportTransform(
                path.node.source.value,
              );
            },
          },
        }),
      ],
    });

    const handledBabelLib = babel.transform(handledBabelSrc.code, {
      sourceMaps: true,
      comments: true,
      parserOpts: {
        plugins: ['jsx', 'objectRestSpread', 'classProperties', 'flow'],
      },
      plugins: [restSpread, classProperties],
      presets: [presetEnv, presetReact],
    });
    return {
      distSrc: handledBabelSrc.code,
      distLib: handledBabelLib.code,
      npmDeps,
      repoDeps,
    };
  }

  const subPackageData = fs.readFileSync(join(source, 'subpackage.json'));
  const subPackage = JSON.parse(subPackageData);
  const packageName = subPackage.name;
  const packageDest = join(npmOutDir, packageName);
  fs.removeSync(packageDest);
  fs.mkdirsSync(packageDest);
  const parentPackageJSON = require('./package.json');
  const allNpmDeps = new Set();
  const allRepoDeps = new Set();

  const destSrc = join(packageDest, 'src');
  const destLib = join(packageDest, 'lib');
  fs.copySync(source, destSrc);
  fs.copySync(source, destLib);
  fs.removeSync(join(destSrc, 'subpackage.json'));
  fs.removeSync(join(destLib, 'subpackage.json'));
  const destFiles = klawSync(destSrc, { nodir: true }).map(thing => thing.path);
  const destJSFiles = destFiles.filter(f => !!f.match(/\.js$/));
  destJSFiles.forEach(destJSFile => {
    const jsFile = fs.readFileSync(destJSFile, { encoding: 'utf8' });
    const { distSrc, npmDeps, repoDeps, distLib } = performSrcTransform(
      jsFile,
      destJSFile,
      destSrc,
    );
    fs.writeFileSync(destJSFile, distSrc);
    fs.writeFileSync(join(destLib, basename(destJSFile)), distLib);
    npmDeps.forEach(dep => allNpmDeps.add(dep));
    repoDeps.forEach(dep => allRepoDeps.add(dep));
  });
  const dependencies = {};
  allNpmDeps.forEach(npmDep => {
    dependencies[npmDep] = parentPackageJSON.dependencies[npmDep];
  });
  allRepoDeps.forEach(repoDep => {
    dependencies[REPO_DEP_NAMES[repoDep]] = parentPackageJSON.version;
  });
  const packageJSON = {
    name: packageName,
    dependencies,
    version: parentPackageJSON.version,
    main: 'lib/index',
    'react-native': 'src/index',
    private: false,
  };

  fs.writeFileSync(
    join(packageDest, 'package.json'),
    JSON.stringify(packageJSON, null, 2),
  );

  console.log(
    'Publishing version ' + parentPackageJSON.version + ' of ' + packageName,
  );
  execFileSync('npm', ['publish', '--access', 'public'], {
    cwd: packageDest,
    stdio: [],
  });
}

const srcModules = fs.readdirSync('src').filter(srcModule => {
  try {
    const subPkgData = fs.readFileSync(
      join('src', srcModule, 'subpackage.json'),
    );
    const subPkg = JSON.parse(subPkgData);
    REPO_DEP_NAMES[srcModule] = subPkg.name;
    return true;
  } catch (e) {
    return false;
  }
});

srcModules.forEach(srcModule => publishModule(srcModule));

// publishModule('react-navigation-icons');
// publishModule('react-navigation-stack');
