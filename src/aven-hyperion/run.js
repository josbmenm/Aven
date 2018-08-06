require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const crypto = require('crypto');
const fs = require('fs-extra')

const spawn = require('child_process').execFileSync;
const goDeploy = require('./deploy');

const app = express();

app.get('/kick', async (req, res) => {
  if (req.query.secret !== process.env.GLOBE_UPDATER_SECRET) {
    res.status(400).send('Incorrect secret');
    return;
  }
  await goDeploy(req.query.clusterName);
  res.send('done');
});


app.post(
  '/update/github',
  bodyParser.json({
    verify: (req, res, buf) => {
      req.buf = buf;
    },
  }),
  async (req, res) => {

    const clusterConfigData = await fs.readFile('/globe/hyperion.clusters.json');
    const clusterConfig = JSON.parse(clusterConfigData)
    const clusterNames = Object.keys(clusterConfig)
    const inputSecret = req.headers['x-hub-signature'];
    const repoId = `github/${req.body.repository.full_name}`
    const clusterName = clusterNames.find(n => clusterConfig[n].deployHookId === repoId)
    if (!clusterName) {
      throw new Error( `Cannot find cluster for repo id "${repoId}"`)
    }
    const {deployHookSecret} = clusterConfig[clusterName];
    
    const secretDigest = crypto.createHmac(
      'sha1',
      deployHookSecret,
    );
    secretDigest.update(req.buf);
    const secretSig = secretDigest.digest('hex');

    if (inputSecret !== 'sha1=' + secretSig) {
      throw new Error(`Invalid signature`)
    }

    goDeploy(clusterName).then(() => {
      console.log('Done deploying!!');
    }, console.error)

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
