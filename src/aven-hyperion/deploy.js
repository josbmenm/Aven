const fs = require('fs-extra');

const spawn = require('@expo/spawn-async');
const os = require('os');
const serviceConfig = require('./serviceConfig');
const nginxConfig = require('./nginxConfig')

const readFile = path => fs.readFile(path, { encoding: 'utf8' });
const { getClusterData, rsyncToCluster, remoteExec, rsync } = require('./utils');
const candidatePortNumber = () =>
  String(Math.floor(Math.random() * 1000) + 8000);

const envifyObject = env =>
  Object.keys(env)
    .map(envKey => `${envKey}=${env[envKey]}`)
    .join('\n');

const goDeploy = async (
  clusterName,
  serviceName,
  props,
  getState,
  setState,
) => {

  const clusters = await getClusterData(props, getState());
  const cluster = clusters[clusterName];
  const buildNodeName = Object.keys(cluster.nodes)[0];
  const buildNode = cluster.nodes[buildNodeName];
  const service = cluster.services[serviceName];

  const deployStartTime = Date.now();
  const deployId = `${clusterName}-${serviceName}-${deployStartTime}`;
  const deployInfo = {
    id: deployId,
    clusterName,
    serviceName,
    socketDir: `/socket/${deployId}`,
    appName: service.appName,
    startTime: deployStartTime,
  };

  console.log('Building ', deployId);

  const buildNodeExec = cmd =>
    remoteExec(buildNode.ipv4_address, cmd, { stdio: 'inherit' });
  const cpToBuildNode = (srcPath, destPath) =>
    rsync(srcPath, buildNode.ipv4_address, destPath)
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

  const serviceFile = serviceConfig(service, deployId, serviceDir, {
    GLOBE_LISTEN_SOCKET: deployInfo.socketDir,
  });
  const systemServiceName = `globe-${deployId}`;

  const serviceFilePath = `/etc/systemd/system/${systemServiceName}.service`;

  await buildNodeExec(`echo "${serviceFile}" > ${serviceFilePath}`);

  await buildNodeExec(`systemctl daemon-reload`);
  await buildNodeExec(`systemctl enable ${systemServiceName}`);
  await buildNodeExec(`systemctl restart ${systemServiceName}`);

  console.log('Checking Status..');

  await buildNodeExec(`systemctl status ${systemServiceName}`);

  // TODO: Hit the server at its socket to do a health-check, BEFORE reconfiguring nginx..

  const getServiceState = () => {
    const state = getState();
    const clusters = state.clusters || {};
    const cluster = clusters[clusterName] || {};
    const services = cluster.services || {};
    const service = services[serviceName] || {};
    return service;
  };

  const setServiceState = async serviceTransactor => {
    await setState(lastState => {
      const clusters = lastState.clusters || {};
      const cluster = clusters[clusterName] || {};
      const services = cluster.services || {};
      const service = services[serviceName] || {};
      return {
        clusters: {
          ...clusters,
          [clusterName]: {
            ...cluster,
            services: {
              ...services,
              [serviceName]: {
                ...service,
                ...serviceTransactor(service),
              },
            },
          },
        },
      };
    });
  };

  console.log('============ PREV STATE')
  console.log(JSON.stringify(getState()));

  console.log('============ DEPLOY INFO')
  console.log(deployInfo);


  await setServiceState(lastService => ({
    deploys: { ...(lastService.deploys || {}), [deployInfo.id]: deployInfo },
  }));


  console.log('============ NEXT STATE')
  console.log(JSON.stringify(getState()));

  
  // let lastDeployId = getServiceState()

  const config = nginxConfig({
    props,
    state: getState(),
    serviceName,
    clusterName,
  });

  await fs.writeFile('/tmp/nginx.conf', config);
  await cpToBuildNode('/tmp/nginx.conf', '/etc/nginx/nginx.conf');

  await buildNodeExec(
    'nginx -s reload',
  );
};

module.exports = goDeploy;
