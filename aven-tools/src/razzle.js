const fs = require('fs-extra');
const pathJoin = require('path').join;
const spawn = require('@expo/spawn-async');
const yaml = require('js-yaml');
const Migrator = require('knex/lib/migrate/Migrator').default;
const Knex = require('knex');
const pg = require('pg');

const protoPath = pathJoin(__dirname, '../proto/web');

const getPackageSourceDir = location => pathJoin(location, 'src', 'sync');

const getTemplatePkg = async () => {
  const pkgPath = pathJoin(protoPath, 'package.template.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath));
  return pkg;
};

const applyPackage = async ({ location, appName, appPkg, distPkg }) => {
  const serverAppPath = pathJoin(location, 'src', 'server.js');
  const envOptions = appPkg.aven.envOptions || {};
  const serverAppFileData = `
import startServer from './sync/${appName}/${envOptions.mainServer}';

export default startServer;
`;
  await fs.writeFile(serverAppPath, serverAppFileData);

  const clientAppPath = pathJoin(location, 'src', 'client.js');
  const clientAppFileData = `
import startClient from './sync/${appName}/${envOptions.mainClient}';

startClient();
`;
  await fs.writeFile(clientAppPath, clientAppFileData);

  if (envOptions.knexFile) {
    const knexFilePath = pathJoin(location, 'knexfile.js');
    const knexFileData = `module.exports = ${JSON.stringify(
      envOptions.knexFile,
    )};`;
    await fs.writeFile(knexFilePath, knexFileData);
  }

  const finalDistPkg = {
    ...distPkg,
    scripts: {
      ...distPkg.scripts,
      test: `${distPkg.scripts.test} ${appName}/`,
    },
  };

  const distPkgPath = pathJoin(location, 'package.json');
  await fs.writeFile(distPkgPath, JSON.stringify(finalDistPkg, null, 2));

  await spawn('yarn', { cwd: location, stdio: 'inherit' });
};

const init = async ({ location }) => {
  await fs.copy(pathJoin(protoPath), location);
  await spawn('git', ['init'], { cwd: location, stdio: 'inherit' });

  return {};
};

const start = async ({ location }) => {
  const knexFilePath = pathJoin(location, 'knexfile.js');
  if (await fs.exists(knexFilePath)) {
    await spawn('npx', ['knex', 'migrate:latest'], {
      cwd: location,
      stdio: 'inherit',
    });
  }
  await spawn('yarn', ['start-dev'], { cwd: location, stdio: 'inherit' });
  return {};
};

const deploy = async ({ appName, appPkg, location, srcDir }) => {
  if (
    appPkg.aven &&
    appPkg.aven.envOptions &&
    appPkg.aven.envOptions.deployEnv === 'GoogleAppEngine'
  ) {
    // Warning! This is not actively being used or maintained. We are using Heroku now..
    const appYamlPath = pathJoin(location, 'app.yaml');
    const appConfig = yaml.safeLoad(await fs.readFile(appYamlPath));
    const publicConfig = { _configType: 'public' };
    const secretConfig = { _configType: 'secret' };
    if (appPkg.aven && appPkg.aven.publicBuildConfigVars) {
      appPkg.aven.publicBuildConfigVars.forEach(varName => {
        publicConfig[varName] = process.env[varName];
      });
    }
    if (appPkg.aven && appPkg.aven.secretBuildConfigVars) {
      appPkg.aven.secretBuildConfigVars.forEach(varName => {
        secretConfig[varName] = process.env[varName];
      });
    }
    const newAppConfig = {
      ...appConfig,
      env_variables: {
        ...appConfig.env_variables,
        PUBLIC_CONFIG_JSON: JSON.stringify(publicConfig),
        SECRET_CONFIG_JSON: JSON.stringify(secretConfig),
      },
    };
    if (secretConfig.SQL_INSTANCE_CONNECTION_NAME) {
      newAppConfig.beta_settings = {
        cloud_sql_instances: secretConfig.SQL_INSTANCE_CONNECTION_NAME,
      };
    }
    await fs.writeFile(appYamlPath, yaml.safeDump(newAppConfig));
    await spawn('gcloud', ['app', 'deploy', '-q'], {
      cwd: location,
      stdio: 'inherit',
    });
    return;
  }

  if (
    appPkg.aven &&
    appPkg.aven.envOptions &&
    appPkg.aven.envOptions.deployEnv === 'Heroku'
  ) {
    const spawnInBuildDir = async (cmd, args, stdio = 'inherit') => {
      console.log('⌨️  ' + cmd + ' ' + args.join(' '));
      return await spawn(cmd, args, { cwd: location, stdio });
    };
    await spawnInBuildDir('git', ['init']);
    await spawnInBuildDir('git', ['add', '.']);
    await spawnInBuildDir('git', [
      'commit',
      '-am',
      `Deploy on ${new Date().toUTCString()}`,
    ]);
    const herokuAppName =
      (appPkg.aven.envOptions && appPkg.aven.envOptions.herokuAppName) ||
      process.env.HEROKU_DEPLOY_APP ||
      appName;
    const HEROKU_API_KEY = process.env.HEROKU_API_KEY;
    await spawnInBuildDir('heroku', ['git:remote', '--app', herokuAppName]);
    const conn = await spawnInBuildDir(
      'heroku',
      ['pg:credentials:url', 'DATABASE'],
      'pipe',
    );
    const connLines = conn.stdout.split('\n');
    const connDelimIndex = connLines.indexOf('Connection URL:');
    const connURL = connLines[connDelimIndex + 1].trim();
    const migrationsDir = pathJoin(
      location,
      'src/sync/cloud-postgres/migrations',
    );
    pg.defaults.ssl = true; // https://github.com/tgriesser/knex/issues/852
    const knex = new Knex({
      connection: connURL,
      client: 'pg',
    });
    const migrator = new Migrator(knex);
    const migrateResult = await migrator.latest({
      directory: migrationsDir,
    });
    knex.destroy();
    console.log('Migrated to db version ' + migrateResult[0]);
    await spawnInBuildDir('git', [
      'push',
      '-f',
      `https://heroku:${HEROKU_API_KEY}@git.heroku.com/${herokuAppName}.git`,
      'master',
    ]);
    return;
  }

  if (
    appPkg.aven &&
    appPkg.aven.envOptions &&
    appPkg.aven.envOptions.deployEnv === 'Script'
  ) {
    console.log('Running Deploy Script..');
    const script = pathJoin(
      location,
      'src',
      'sync',
      appName,
      appPkg.aven.envOptions.deployScript,
    );
    await spawn(script, [], { cwd: location, stdio: 'inherit' });
    return;
  }

  throw new Error(
    'Invalid pkg.aven.envOptions.deployEnv in "' + appName + '"!',
  );
};

const build = async ({ appName, appPkg, location, srcDir }) => {
  const razzleLocation = pathJoin(
    location,
    'node_modules/razzle/bin/razzle.js',
  );
  const buildResult = await spawn(razzleLocation, ['build'], {
    cwd: location,
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: false, // when CI is true, every warning is a build failure!
    },
  });
  const buildLocation = pathJoin(location, 'build');
  return { buildLocation };
};

const test = async ({ appName, appPkg, location, srcDir }) => {
  const testResult = await spawn('yarn', ['test'], {
    cwd: location,
    stdio: 'inherit',
    env: {
      ...process.env,
    },
  });
  return { testResult };
};

module.exports = {
  getPackageSourceDir,
  getTemplatePkg,
  applyPackage,

  init,
  start,
  build,
  deploy,
  test,
};
