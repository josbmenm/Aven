const fs = require('fs-extra');
const spawn = require('@expo/spawn-async');

const readFile = path => fs.readFile(path, { encoding: 'utf8' });
const hyperionKeyPath = '/globe/src/aven-hyperion/hyperion.key';

const getClusterData = async () => {
  const rawClusters = JSON.parse(
    await readFile('/globe/hyperion.clusters.json'),
  );
  const tfStateData = await readFile('/globe/hyperion.tfstate');
  const clusterData = {};
  const tfState = JSON.parse(tfStateData);
  const stateResourceNames = Object.keys(tfState.modules[0].resources);
  const getSingleClusterData = clusterName => {
    const getTypeFromResourceName = resourceName => {
      if (
        resourceName.match(
          new RegExp('^digitalocean_droplet.' + clusterName + '_node'),
        )
      ) {
        return 'node';
      }
      if (
        resourceName.match(
          new RegExp('^digitalocean_droplet.' + clusterName + '_hera'),
        )
      ) {
        return 'hera';
      }
      if (
        resourceName.match(
          new RegExp('^digitalocean_droplet.' + clusterName + '_pg'),
        )
      ) {
        return 'pg';
      }
      if (
        resourceName.match(
          new RegExp('^digitalocean_loadbalancer.' + clusterName + '_load'),
        )
      ) {
        return 'load';
      }
      return 'unknown';
    };
    const nodes = {};
    stateResourceNames.forEach(resourceName => {
      const type = getTypeFromResourceName(resourceName);
      if (type === 'unknown') {
        return;
      }
      const r = tfState.modules[0].resources[resourceName];
      const {
        ipv4_address,
        price_hourly,
        price_monthly,
        region,
        ip, // load balancer provides ip instead of ipv4_address
      } = r.primary.attributes;
      nodes[resourceName] = {
        price_hourly,
        ipv4_address: ipv4_address || ip,
        price_monthly,
        region,
        type,
      };
    });
    return {
      nodes,
    };
  };
  const clusterNames = Object.keys(rawClusters);
  clusterNames.forEach(clusterName => {
    clusterData[clusterName] = {
      ...rawClusters[clusterName],
      ...getSingleClusterData(clusterName),
    };
  });
  return clusterData;
};

const rsyncToCluster = async (source, cluster, dest) => {
  const { nodes } = cluster;
  const results = await Promise.all(
    Object.keys(nodes).map(async nodeName => {
      const node = nodes[nodeName];
      if (!isNodeNode(node)) return null;
      await rsync(source, node.ipv4_address, dest);
      return {
        node,
        nodeName,
      };
    }),
  );
  return results.filter(r => !!r);
};

const isNodeNode = node => {
  //lol
  return node.type === 'node' || node.type === 'hera';
};

const rsync = async (source, ip, dest) => {
  await spawn(
    'rsync',
    [
      '-rvzL',
      '-e',
      `ssh -o StrictHostKeyChecking=no -i ${hyperionKeyPath}`,
      source,
      `root@${ip}:${dest}`,
    ],
    {
      stdio: 'inherit',
    },
  );
};

const remoteExec = async (ip, cmd) => {
  return await spawn('ssh', [
    '-o',
    'StrictHostKeyChecking=no',
    '-i',
    hyperionKeyPath,
    `root@${ip}`,
    '-t',
    cmd,
  ]);
};

module.exports = {
  getClusterData,
  rsyncToCluster,
  isNodeNode,
  rsync,
  remoteExec,
};
