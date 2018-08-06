const fs = require('fs-extra');

const spawn = require('@expo/spawn-async');
const os = require('os');

const readFile = path => fs.readFile(path, { encoding: 'utf8' });
const { getClusterData, rsyncToCluster, remoteExec } = require('./utils');
const candidatePortNumber = () =>
  String(Math.floor(Math.random() * 1000) + 8000);

const envifyObject = env =>
  Object.keys(env)
    .map(envKey => `${envKey}=${env[envKey]}`)
    .join('\n');

const goDeploy = async clusterName => {
  const clusters = await getClusterData();
  const cluster = clusters[clusterName];
  const buildNodeName = Object.keys(cluster.nodes)[0];
  const buildNode = cluster.nodes[buildNodeName];

  console.log('Building on ', buildNode);
  const buildNodeExec = cmd => remoteExec(buildNode.ipv4_address, cmd);

  const deployId = `deploy-${Date.now()}`;
  const localTmpDir = `${os.tmpdir()}/${deployId}`;
  await fs.mkdirp(localTmpDir);

  // build phase:
  console.log(
    'write key file:',
    await buildNodeExec(
      `echo "${cluster.gitKey}" > /deploykey ; chmod go-wrx /deploykey`,
    ),
  );
  console.log('make builds dir:', await buildNodeExec('mkdir -p /builds'));
  console.log('make dist dir:', await buildNodeExec('mkdir -p /dist'));
  const gitCmd = `GIT_SSH_COMMAND="ssh -i /deploykey -o StrictHostKeyChecking=no" git clone -b ${
    cluster.gitBranch
  } --single-branch ${cluster.gitUrl} /builds/${deployId}`;
  console.log(gitCmd);
  console.log('git clone:', gitCmd, await buildNodeExec(gitCmd));
  const buildPath = `/builds/${deployId}`;
  const buildPackagePath = `/dist/${deployId}.tar.gz`;
  console.log('yarn:', await buildNodeExec(`cd ${buildPath} ; yarn`));

  console.log(
    'yarn build appName:',
    cluster.appName,
    await buildNodeExec(`cd ${buildPath} ; yarn build ${cluster.appName}`),
  );
  console.log(
    'tar build dir:',
    await buildNodeExec(`cd ${buildPath} ; tar -czf ${buildPackagePath} .`),
  );
  console.log('rm -rf build dir:', await buildNodeExec(`rm -rf ${buildPath}`));

  // test phase: coming soon

  // deploy phase:
  console.log('rm -rf globe dir:', await buildNodeExec(`rm -rf /globe`));
  console.log(
    'tar build dir:',
    await buildNodeExec(
      `mkdir /globe ; cd /globe ; tar -xzf ${buildPackagePath}`,
    ),
  );

  console.log(
    'restart service:',
    await buildNodeExec(`systemctl restart avencloud`),
  );
};

module.exports = goDeploy;
