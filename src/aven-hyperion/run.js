require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const crypto = require('crypto');
const fs = require('fs-extra');

const spawn = require('child_process').execFileSync;
const goDeploy = require('./deploy');
const terra = require('./terra');

const app = express();

const taskQueue = [];

const kick = async (repoId, validateKickRequest) => {
  const props = JSON.parse(await fs.readFile('/globe/hyperion.props.json'));

  const clustersChecksum = crypto
    .createHash('md5')
    .update(JSON.stringify(props.clusters))
    .digest('hex');

  let state = null;
  try {
    state = JSON.parse(await fs.readFile('/globe/hyperion.state.json'));
  } catch (e) {
    if (e.code === 'ENOENT') {
      state = {};
    }
  }

  const setState = async newState => {
    const s = { ...state, ...newState };
    await fs.writeFile(
      '/globe/hyperion.state.json',
      JSON.stringify(s, null, 2),
    );
    console.log('State set!', s);
    state = s;
  };
  const dayInMS = 1000 * 60 * 60 * 24;
  const thisTime = Date.now();
  if (
    !state.lastTerraTime ||
    state.lastTerraTime + dayInMS < thisTime ||
    clustersChecksum !== state.lastTerraClustersChecksum
  ) {
    console.log('Go Terra');
    await terra(props, state);
    await setState({
      lastTerraTime: thisTime,
      lastTerraClustersChecksum: clustersChecksum,
    });
  }

  const buildJobs = [];

  for (let clusterName in props.clusters) {
    const cluster = props.clusters[clusterName];
    for (let serviceName in cluster.services) {
      const service = cluster.services[serviceName];
      if (service.deployHookId === repoId) {
        try {
          await validateKickRequest(service.deployHookSecret);
          buildJobs.push({ clusterName, serviceName });
        } catch (e) {
          console.error(`Could not validate secret checksum for ${repoId}`);
        }
      }
    }
  }

  for (let buildIndex in buildJobs) {
    const { clusterName, serviceName } = buildJobs[buildIndex];
    console.log(`Now deploying ${clusterName} ${serviceName}`);
    await goDeploy(clusterName, serviceName, props, state, setState);
  }
};

app.get('/clusters', async (req, res) => {
  if (req.query.secret !== process.env.GLOBE_HYPERION_SECRET) {
    res.status(400).send('Incorrect secret');
    return;
  }
});
app.get('/kick', async (req, res) => {
  if (req.query.secret !== process.env.GLOBE_HYPERION_SECRET) {
    res.status(400).send('Incorrect secret');
    return;
  }
  res.send('Thanks, kicked');
  kick(req.query.repo, () => {}).then(() => {
    console.log('Server Kick complete!');
  }, console.error);
});

app.post(
  '/update/github',
  bodyParser.json({
    verify: (req, res, buf) => {
      req.buf = buf;
    },
  }),
  async (req, res) => {
    const repoId = `github/${req.body.repository.full_name}`;

    const validateKickRequest = async deployHookSecret => {
      const secretDigest = crypto.createHmac('sha1', deployHookSecret);
      secretDigest.update(req.buf);
      const secretSig = secretDigest.digest('hex');
      const inputSecret = req.headers['x-hub-signature'];
      if (inputSecret !== 'sha1=' + secretSig) {
        throw new Error(`Invalid signature`);
      }
    };

    kick(repoId, validateKickRequest);

    res.send('thanks github');
  },
);

app.get('/', (req, res) => {
  res.send('Hello there, my name is Hyperion.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server started on ${port}`);
});
