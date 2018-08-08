const fs = require('fs-extra');

const spawn = require('@expo/spawn-async');
const os = require('os');
const serviceConfig = require('./serviceConfig');

const readFile = path => fs.readFile(path, { encoding: 'utf8' });
const { getClusterData, rsyncToCluster, remoteExec } = require('./utils');
const candidatePortNumber = () =>
  String(Math.floor(Math.random() * 1000) + 8000);

const envifyObject = env =>
  Object.keys(env)
    .map(envKey => `${envKey}=${env[envKey]}`)
    .join('\n');

const goDeploy = async (clusterName, serviceName, props, state, setState) => {
  const clusters = await getClusterData(props, state);
  const cluster = clusters[clusterName];
  const buildNodeName = Object.keys(cluster.nodes)[0];
  const buildNode = cluster.nodes[buildNodeName];
  const service = cluster.services[serviceName];

  const deployId = `${clusterName}-${serviceName}-${Date.now()}`;

  console.log('Building ', deployId);

  const buildNodeExec = cmd =>
    remoteExec(buildNode.ipv4_address, cmd, { stdio: 'inherit' });
  const buildNodeMkdir = dir => buildNodeExec(`mkdir -p ${dir}`);
  // const cleanup = [];
  // const cleanupAfterBuild = path => cleanup.push(() => fs.remove(path))

  console.log('Preparing Build Node');

  const servicesDir = '/services';
  await buildNodeMkdir(servicesDir);
  const buildPath = `/builds/${serviceName}/${deployId}`;
  await buildNodeMkdir(buildPath);
  await buildNodeMkdir('/deployKeys');
  await buildNodeMkdir('/dist');
  const gitKeyFile = `/deployKeys/${serviceName}-${deployId}.key`;

  console.log('Preparing For Clone');
  await buildNodeExec(
    `echo "${service.gitKey}" > ${gitKeyFile}; chmod go-wrx ${gitKeyFile}`,
  );

  console.log('Cloning..');
  const gitCmd = `GIT_SSH_COMMAND="ssh -i ${gitKeyFile} -o StrictHostKeyChecking=no" git clone -b ${
    service.gitBranch
  } --single-branch ${service.gitUrl} ${buildPath}`;
  await buildNodeExec(gitCmd);

  const buildPackagePath = `/dist/${deployId}.tar.gz`;
  console.log('Yarn');
  await buildNodeExec(`cd ${buildPath}; yarn`);

  console.log('Yarn Build for ' + service.appName);
  await buildNodeExec(`cd ${buildPath}; npx globe build ${service.appName}`);

  console.log('Compressing Build');
  await buildNodeExec(`cd ${buildPath}; tar -czf ${buildPackagePath} .`);

  console.log('Cleaning up build');

  console.log('Deploying');

  const serviceDir = `${servicesDir}/${deployId}`;

  await buildNodeExec(`rm -rf ${serviceDir}`);

  await buildNodeExec(
    `mkdir ${serviceDir}; cd ${serviceDir}; tar -xzf ${buildPackagePath}`,
  );

  const socketDir = `/socket/${deployId}`;

  const serviceFile = serviceConfig(service, deployId, serviceDir, {
    GLOBE_LISTEN_SOCKET: socketDir,
  });
  const systemServiceName = `globe-${deployId}`;

  const serviceFilePath = `/etc/systemd/system/${systemServiceName}.service`;

  await buildNodeExec(`echo "${serviceFile}" > ${serviceFilePath}`);

  await buildNodeExec(`systemctl daemon-reload`);
  await buildNodeExec(`systemctl enable ${systemServiceName}`);
  await buildNodeExec(`systemctl restart ${systemServiceName}`);

  console.log('Checking Status..');

  await buildNodeExec(`systemctl status ${systemServiceName}`);

  const serviceState =
    (state &&
      state.clusters &&
      state.clusters[clusterName] &&
      state.clusters[clusterName].services &&
      state.clusters[clusterName].services[serviceName]) ||
    {};

  const setServiceState = newState =>
    setState({
      clusters: {
        ...state.clusters,
        [clusterName]: {
          services: {
            ...state.clusters[clusterName].services,
            [serviceName]: {
              ...serviceState,
              ...newState,
            },
          },
        },
      },
    });

  console.log('woah dude..', serviceState);
  // const config = nginxConfig({
  //   cluster
  //   cluster,
  //   clusterName,
  // });

  // const reloadResults = await buildNodeExec(
  //   'nginx -s reload',
  // );

  // const services = [cluster.mainApp, ...Object.keys(cluster.services)]

  // console.log('Now its my job to update services:', services)
  // console.log(
  //   'restart service:',
  //   await buildNodeExec(`systemctl restart avencloud`),
  // );

  // console.log(
  //   'restart service:',
  //   await buildNodeExec(`systemctl restart avencloud`),
  // );
};

module.exports = goDeploy;
