const pathJoin = require('path').join;
const fs = require('fs-extra');
const cuid = require('cuid');
const sane = require('sane');
const homeDir = require('os').homedir();
const spawn = require('@expo/spawn-async');
const semver = require('semver');
const crypto = require('crypto');
const isBinaryFile = require('isbinaryfile').isBinaryFile;

function checksum(input) {
  const shasum = crypto.createHash('sha256');
  shasum.update(input);
  return shasum.digest('hex');
}

async function checksumFolder(dir, overrides) {
  const children = {};
  const childFiles = await fs.readdir(dir);
  await childFiles.map(async childName => {
    const childPath = pathJoin(dir, childName);
    const stat = await fs.stat(childPath);
    if (stat.isDirectory()) {
      children[childName] = await checksumFolder(childPath, {});
    } else {
      const fileData = await fs.readFile(childPath);
      children[childName] = checksum(fileData);
    }
  });
  const finalChildren = {
    ...children,
    overrides,
  };
  return checksum(JSON.stringify(finalChildren));
}

async function syncAndReplace(source, dest, replacements) {
  const info = await fs.stat(source);
  if (info.isDirectory()) {
    const children = await fs.readdir(source);
    try {
      await fs.mkdir(dest);
    } catch (e) {
      // assume it already exisdted
    }
    await Promise.all(
      children.map(async childName => {
        const destChild = pathJoin(dest, childName);
        const sourceChild = pathJoin(source, childName);
        await syncAndReplace(sourceChild, destChild, replacements);
      }),
    );

    return;
  }
  if (await isBinaryFile(source)) {
    await fs.copy(source, dest);
  } else {
    const data = await fs.readFile(source);
    let newData = data;
    Object.keys(replacements).forEach(fromReplace => {
      const toReplace = replacements[fromReplace];
      newData = newData
        .toString()
        .split(fromReplace)
        .join(toReplace);
    });
    await fs.writeFile(dest, newData);
  }
}

const srcDir = process.cwd();
const repoPkg = require(`${srcDir}/package.json`);
const avenHomeDir = pathJoin(homeDir, '.aven');
const envStatePath = pathJoin(srcDir, '.aven-env-state.json');

const extendOverride = process.env.AVEN_SRC_EXTEND_OVERRIDE;
if (extendOverride) {
  console.log(
    `⚠️ - Using AvenTools extendsSrcModule from process.env.AVEN_SRC_EXTEND_OVERRIDE (${extendOverride}). You are responsible for syncronization of the extended aven src dir!`,
  );
}

const getPackageDir = async (srcDir, packageName, repoPkg) => {
  const extendsSrcModule =
    repoPkg && repoPkg.aven && repoPkg.aven.extendsSrcModule;
  let packageDir = pathJoin(srcDir, packageName);
  let extendingSrcDir = null;
  if (!(await fs.existsSync(packageDir)) && extendsSrcModule) {
    extendingSrcDir =
      extendOverride || pathJoin(srcDir, 'node_modules', extendsSrcModule);
    const extendsPkgDir = pathJoin(extendingSrcDir, packageName);
    packageDir = extendsPkgDir;
  }
  return { packageDir, extendingSrcDir };
};

async function syncDirectoriesMac(from, to, exclude = []) {
  const args = ['-a'];
  exclude.forEach(ex => {
    args.push('--exclude');
    args.push(ex + '*');
  });
  args.push(from + '/');
  args.push(to + '/');
  await spawn('rsync', args);
}

async function syncDirectories(from, to, exclude = []) {
  if (process.platform === 'win32') {
    const winPrefix = /^([a-z]):/i;
    from = from.replace(winPrefix, '/cygdrive/$1');
    to = to.replace(winPrefix, '/cygdrive/$1');
  }
  return await syncDirectoriesMac(from, to, exclude);
  await fs.emptyDir(to);
  await fs.copy(from, to, {
    filter: file =>
      exclude.reduce(
        (prev, next) => prev && !new RegExp(next).exec(file),
        true,
      ),
  });
}

const syncPackage = async (packageName, srcDir, destLocation, repoPkg) => {
  const { packageDir } = await getPackageDir(srcDir, packageName, repoPkg);
  const destPackage = pathJoin(destLocation, packageName);
  await syncDirectories(packageDir, destPackage, ['node_modules', 'src-sync']);
};

const getAllSrcDependencies = async (srcDir, packageName, repoPkg) => {
  const { packageDir } = await getPackageDir(srcDir, packageName, repoPkg);
  const packageJSONPath = pathJoin(packageDir, 'package.json');
  const pkgJSON = JSON.parse(await fs.readFile(packageJSONPath));
  const pkgDeps = (pkgJSON.aven && pkgJSON.aven.srcDependencies) || [];
  const childPkgDeps = await Promise.all(
    pkgDeps.map(async pkgDep => {
      return await getAllSrcDependencies(srcDir, pkgDep, repoPkg);
    }),
  );
  const allPkgDeps = new Set(pkgDeps);
  allPkgDeps.add(packageName);
  childPkgDeps.forEach(cPkgDeps =>
    cPkgDeps.forEach(cPkgDep => allPkgDeps.add(cPkgDep)),
  );
  return allPkgDeps;
};

const getAllModuleDependencies = async (srcDir, packageName, repoPkg) => {
  const pkgDeps = await getAllSrcDependencies(srcDir, packageName, repoPkg);
  const allModuleDeps = {};
  await Promise.all(
    Array.from(pkgDeps).map(async pkgDep => {
      const { packageDir, extendingSrcDir } = await getPackageDir(
        srcDir,
        pkgDep,
        repoPkg,
      );
      const packageJSONPath = pathJoin(packageDir, 'package.json');
      const pkgJSON = JSON.parse(await fs.readFile(packageJSONPath));
      const moduleDeps =
        (pkgJSON.aven && pkgJSON.aven.moduleDependencies) || [];
      const extendsSrcModulePkg =
        extendingSrcDir &&
        JSON.parse(
          await fs.readFile(pathJoin(extendingSrcDir, 'package.json')),
        );
      const srcPkg = extendsSrcModulePkg ? extendsSrcModulePkg : repoPkg;
      moduleDeps.forEach(moduleDepName => {
        if (!srcPkg.dependencies[moduleDepName]) {
          throw new Error(
            'Cannot find ' +
              moduleDepName +
              ' in the source env package.json while requiring ' +
              pkgDep +
              '!',
          );
        }
        allModuleDeps[moduleDepName] = srcPkg.dependencies[moduleDepName];
      });
    }),
  );
  return allModuleDeps;
};

const getAllPublicAssetDirs = async (srcDir, packageName, repoPkg) => {
  const pkgDeps = await getAllSrcDependencies(srcDir, packageName, repoPkg);
  const allPublicAssetDirs = [];
  await Promise.all(
    Array.from(pkgDeps).map(async pkgDep => {
      const { packageDir } = await getPackageDir(srcDir, pkgDep, repoPkg);
      const packageJSONPath = pathJoin(packageDir, 'package.json');
      const pkgJSON = JSON.parse(await fs.readFile(packageJSONPath));
      if (pkgJSON.aven && pkgJSON.aven.publicAssetDir) {
        allPublicAssetDirs.push(
          pathJoin(packageDir, pkgJSON.aven.publicAssetDir),
        );
      }
    }),
  );
  return allPublicAssetDirs;
};

const globeEnvs = {
  dom: require('./dom'),
  expo: require('./expo'),
  razzle: require('./razzle'),
};

const getAppPackage = async appName => {
  const appDir = pathJoin(srcDir, appName);
  const appPkgPath = pathJoin(appDir, 'package.json');
  let appPkg = null;
  try {
    appPkg = JSON.parse(await fs.readFile(appPkgPath));
  } catch (e) {
    throw new Error(`Failed to read package file at "${appPkgPath}"`);
  }
  return appPkg;
};

const getAppEnv = async (appName, appPkg) => {
  const specifiedEnvName = appPkg && appPkg.aven && appPkg.aven.env;
  const envName = specifiedEnvName || 'razzle';
  let envModule = globeEnvs[envName];
  if (!envModule) {
    let envPath = null;
    let error = null;
    try {
      const { packageDir } = await getPackageDir(srcDir, envName, repoPkg);
      envPath = packageDir;
    } catch (e) {
      error = e;
    }
    if (!envPath) {
      error && console.error(error);
      throw new Error(
        `Failed to load platform env "${envName}" as specified in package.json aven.env for "${appName}"`,
      );
    }
    envModule = require(pathJoin(envPath, 'AvenEnv.js'));
    envModule.localEnv = envName;
  }
  envModule.name = envName;
  return envModule;
};

async function readGlobeState() {
  let state = {};
  try {
    state = JSON.parse(await fs.readFile(envStatePath));
    if (state.srcDir !== srcDir) {
      state = {};
      console.log('Aven src has moved! Removing old state..');
      await fs.remove(envStatePath);
    }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
  return state;
}

async function writeAvenEnvState(state) {
  const stateData = JSON.stringify(state);
  await fs.writeFile(envStatePath, stateData);
}

async function initLocation(appName, appPkg, platform, appState) {
  const newLocation = pathJoin(avenHomeDir, appName + '_' + cuid());
  await fs.mkdirp(newLocation);
  await platform.init({
    srcDir,
    appName,
    appPkg,
    location: newLocation,
  });
  return {
    location: newLocation,
    ...appState,
  };
}
async function getAppLocation(appName, appPkg, platform, appState) {
  if (platform.runInPlace) {
    return { ...appState, location: pathJoin(srcDir, platform.name) };
  }
  if (
    !appState ||
    !appState.location ||
    !(await fs.exists(appState.location))
  ) {
    return await initLocation(appName, appPkg, platform, appState);
  }
  return appState;
}

async function sync(appEnv, location, appName, appPkg, srcDir) {
  const packageSourceDir = appEnv.getPackageSourceDir(location);
  const repoPkg = JSON.parse(
    await fs.readFile(pathJoin(srcDir, 'package.json')),
  );
  await fs.mkdirp(packageSourceDir);

  const existingDirs = await fs.readdir(packageSourceDir);

  const srcDepsSet = await getAllSrcDependencies(srcDir, appName, repoPkg);
  const srcDeps = Array.from(srcDepsSet);
  await Promise.all(
    existingDirs
      .filter(testPkgName => !srcDepsSet.has(testPkgName))
      .map(async pkgToRemove => {
        const pkgToRemovePath = pathJoin(packageSourceDir, pkgToRemove);
        await fs.remove(pkgToRemovePath);
      }),
  );
  await Promise.all(
    srcDeps.map(async srcDep => {
      await syncPackage(srcDep, srcDir, packageSourceDir, repoPkg);
    }),
  );

  const distPkgTemplate = await appEnv.getTemplatePkg(location);

  const allModuleDeps = await getAllModuleDependencies(
    srcDir,
    appName,
    repoPkg,
  );

  const distPkg = {
    ...distPkgTemplate,
    dependencies: {
      ...distPkgTemplate.dependencies,
      ...appPkg.dependencies,
      ...allModuleDeps,
    },
  };

  const assetDirs = await getAllPublicAssetDirs(srcDir, appName, repoPkg);
  const destAssetDir = pathJoin(location, 'public');
  await Promise.all(
    assetDirs.map(async assetDir => syncDirectories(assetDir, destAssetDir)),
  );

  await appEnv.applyPackage({
    location,
    appName,
    appPkg,
    distPkg,
    srcDir,
  });

  return { srcDeps };
}

async function runStart(argv) {
  const appName = argv._[1];
  const appPkg = await getAppPackage(appName);
  const appEnv = await getAppEnv(appName, appPkg);

  const state = await readGlobeState();
  let appState = state.apps && state.apps[appName];
  appState = await getAppLocation(appName, appPkg, appEnv, appState);
  const goSync = async () => {
    console.log(
      `🌐 🏹 Syncronizing Workspace to App "${appName}" at ${appState.location}`,
    );
    return await sync(appEnv, appState.location, appName, appPkg, srcDir);
  };
  await writeAvenEnvState({
    ...state,
    srcDir,
    apps: {
      ...state.apps,
      [appName]: appState,
    },
  });
  let syncState = await goSync();

  const watcher = sane(srcDir, { watchman: process.platform != 'win32' });

  let extendedGlobeWatcher =
    extendOverride &&
    sane(extendOverride, { watchman: process.platform != 'win32' });

  let syncTimeout = null;
  const scheduleSync = (filepath, root, stat) => {
    if (
      appEnv.localEnv &&
      filepath.substr(0, appEnv.localEnv.length) === appEnv.localEnv
    ) {
      return;
    }
    let shouldSync = false;
    for (let srcDep of syncState.srcDeps) {
      if (filepath.substr(0, srcDep.length) === srcDep) {
        shouldSync = true;
      }
    }
    if (!shouldSync) {
      return;
    }
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      goSync()
        .then(s => {
          syncState = s;
        })
        .catch(e => {
          console.log('ERROR after file change sync');
          console.error(e);
          process.exit(1);
        });
    }, 25);
  };
  watcher.on('change', scheduleSync);
  watcher.on('add', scheduleSync);
  watcher.on('delete', scheduleSync);

  extendedGlobeWatcher && extendedGlobeWatcher.on('change', scheduleSync);
  extendedGlobeWatcher && extendedGlobeWatcher.on('add', scheduleSync);
  extendedGlobeWatcher && extendedGlobeWatcher.on('delete', scheduleSync);

  await Promise.all([
    new Promise(resolve => {
      watcher.on('ready', () => {
        console.log(`🌐 👓 Watching ${srcDir} for changes..`);
        resolve();
      });
    }),
    new Promise(resolve => {
      if (!extendedGlobeWatcher) {
        return resolve();
      }
      extendedGlobeWatcher.on('ready', () => {
        console.log(
          `🌐 👓 Also watching extended src dir ${extendOverride} for changes..`,
        );
        resolve();
      });
    }),
  ]);

  await appEnv.start({
    srcDir,
    appName,
    appPkg,
    location: appState.location,
  });

  watcher.close();
  extendedGlobeWatcher && extendedGlobeWatcher.close();
}

async function runBuild(argv) {
  const appName = argv._[1];
  const appPkg = await getAppPackage(appName);
  const appEnv = await getAppEnv(appName, appPkg);
  const state = await readGlobeState();
  let appState = state.apps && state.apps[appName];
  appState = await getAppLocation(appName, appPkg, appEnv, appState);
  const buildId = cuid();
  const buildLocation = pathJoin(avenHomeDir, appName + '_build_' + buildId);

  await fs.mkdirp(buildLocation);
  await appEnv.init({
    srcDir,
    appName,
    appPkg,
    location: buildLocation,
  });

  await sync(appEnv, buildLocation, appName, appPkg, srcDir);

  await appEnv.build({
    srcDir,
    appName,
    appPkg,
    location: buildLocation,
  });

  return { buildLocation };
}

async function runDeploy(argv) {
  const appName = argv._[1];
  const appPkg = await getAppPackage(appName);
  const appEnv = await getAppEnv(appName, appPkg);
  const state = await readGlobeState();
  let appState = state.apps && state.apps[appName];
  appState = await getAppLocation(appName, appPkg, appEnv, appState);
  const buildId = cuid();
  const buildLocation = pathJoin(avenHomeDir, appName + '_build_' + buildId);

  await fs.mkdirp(buildLocation);
  await appEnv.init({
    srcDir,
    appName,
    appPkg,
    location: buildLocation,
  });

  await sync(appEnv, buildLocation, appName, appPkg, srcDir);

  await appEnv.build({
    srcDir,
    appName,
    appPkg,
    location: buildLocation,
  });

  await appEnv.deploy({
    srcDir,
    appName,
    appPkg,
    location: buildLocation,
  });

  return { buildLocation };
}

async function runTest(argv) {
  const appName = argv._[1];
  const appPkg = await getAppPackage(appName);
  const appEnv = await getAppEnv(appName, appPkg);

  const state = await readGlobeState();
  let appState = state.apps && state.apps[appName];
  appState = await getAppLocation(appName, appPkg, appEnv, appState);

  await writeAvenEnvState({
    ...state,
    srcDir,
    apps: {
      ...state.apps,
      [appName]: appState,
    },
  });

  console.log(
    `🌐 🏹 Syncronizing Workspace to App "${appName}" at ${appState.location}`,
  );
  await sync(appEnv, appState.location, appName, appPkg, srcDir);

  await appEnv.test({
    srcDir,
    appName,
    appPkg,
    location: appState.location,
  });
}

const runClean = async () => {
  await fs.remove(avenHomeDir);
  await fs.remove(envStatePath);
};

async function doPublish(packageName, localParentDeps = []) {
  const packageDir = pathJoin(srcDir, packageName);
  const localPackagePath = pathJoin(packageDir, 'package.json');

  const localPackage = await getAppPackage(packageName);
  if (!localPackage) {
    throw new Error(`Cannot read package of "${packageName}"`);
  }
  if (!localPackage.aven) {
    throw new Error(
      `Package "${packageName}" does not have ".aven" configured`,
    );
  }
  const { moduleDependencies, srcDependencies } = localPackage.aven;
  const repoPkg = JSON.parse(
    await fs.readFile(pathJoin(srcDir, 'package.json')),
  );
  let publishedVersion = localPackage.version;
  let publishedName = localPackage.name;
  const finalPkgJson = {
    ...localPackage,
    aven: undefined,
    // these are stripped for now, so that the checksum remains pure:
    version: undefined,
    srcChecksum: undefined,
    dependencies: {
      '@babel/polyfill': '^7.2.5',
    },
  };
  if (moduleDependencies) {
    moduleDependencies.forEach(depName => {
      finalPkgJson.dependencies[depName] = repoPkg.dependencies[depName];
    });
  }
  const npmNames = {};
  if (srcDependencies) {
    await Promise.all(
      srcDependencies.map(async localDepName => {
        const result = await doPublish(localDepName, [
          ...localParentDeps,
          packageName,
        ]);
        finalPkgJson.dependencies[result.publishedName] =
          '^' + result.publishedVersion;
        npmNames[localDepName] = result.publishedName;
      }),
    );
  }

  packageJSONChecksum = checksum(JSON.stringify(finalPkgJson));

  const srcChecksum = await checksumFolder(packageDir, {
    'package.json': packageJSONChecksum,
  });
  let buildDir = null;
  if (srcChecksum !== localPackage.srcChecksum) {
    // time to cut a new version

    publishedVersion = semver.inc(localPackage.version, 'minor');

    finalPkgJson.version = publishedVersion;

    finalPkgJson.scripts = {
      build: 'babel src --out-dir .',
    };
    finalPkgJson.devDependencies = {
      '@babel/cli': '^7.2.3',
      '@babel/core': '^7.2.2',
      '@babel/node': '^7.2.2',
      '@babel/preset-env': '^7.3.1',
      '@babel/plugin-proposal-class-properties': '^7.3.0',
      '@babel/plugin-transform-react-jsx': '^7.3.0',
    };

    // doing publish
    buildDir = pathJoin(avenHomeDir, packageName + '_publish');
    // try {
    await fs.remove(buildDir);
    // } catch (e) {}
    const buildSrcDir = pathJoin(buildDir, 'src');
    await fs.mkdirp(buildSrcDir);

    await fs.writeFile(
      pathJoin(buildSrcDir, '.babelrc'),
      JSON.stringify(
        {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-react-jsx',
          ],
        },
        null,
        2,
      ),
    );

    const replacements = {};
    srcDependencies &&
      srcDependencies.forEach(depName => {
        replacements[`../${depName}/`] = `${npmNames[depName]}/`;
      });

    await syncAndReplace(packageDir, buildSrcDir, replacements);

    try {
      await fs.remove(pathJoin(buildSrcDir, 'package.json'));
    } catch (e) {}
    await fs.writeFile(
      pathJoin(buildDir, 'package.json'),
      JSON.stringify(finalPkgJson, null, 2),
    );
    await spawn('yarn', [], {
      cwd: buildDir,
      stdio: 'inherit',
    });
    await spawn('yarn', ['build'], {
      cwd: buildDir,
      stdio: 'inherit',
    });

    const dryRun = !!process.env.DRY_RUN;
    if (!dryRun) {
      await spawn('npm', ['publish', '--access', 'public'], {
        cwd: buildDir,
        env: process.env,
        stdio: 'inherit',
      });

      // write new version and checksum to local package
      await fs.writeFile(
        localPackagePath,
        JSON.stringify(
          {
            ...localPackage,
            version: publishedVersion,
            srcChecksum,
          },
          null,
          2,
        ),
      );
    }
  }

  return { publishedVersion, publishedName };
}

async function runPublish(argv) {
  const packageName = argv._[1];
  return await doPublish(packageName);
}

async function createLib(pkgName) {
  const packageDir = pathJoin(srcDir, pkgName);

  if (await fs.exists(packageDir)) {
    throw new Error(
      `Cannot create a lib at "${packageDir}" because it already exists.`,
    );
  }

  await fs.mkdir(packageDir);
  const pkg = {
    name: pkgName,
    aven: { moduleDependencies: {}, srcDependencies: {} },
  };
  await fs.writeFile(
    pathJoin(packageDir, 'package.json'),
    JSON.stringify(pkg, null, 2),
  );
}

async function createApp(appName, envName) {
  const appDir = pathJoin(srcDir, appName);

  if (await fs.exists(appDir)) {
    throw new Error(
      `Cannot create an app at "${appDir}" because it already exists.`,
    );
  }

  await fs.mkdir(appDir);

  const pkg = {
    name: appName,
    aven: { moduleDependencies: {}, srcDependencies: {} },
  };
  await fs.writeFile(
    pathJoin(appDir, 'package.json'),
    JSON.stringify(pkg, null, 2),
  );
}

module.exports = {
  runStart,
  runBuild,
  runDeploy,
  runClean,
  runPublish,
  runTest,
  createLib,
  createApp,
};
