require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const crypto = require('crypto');

const spawn = require('child_process').execFileSync;

const app = express();

const goDeploy = async () => {
  console.log('./src/aven-globe-updater/runUpdate.sh');
  await spawn('./src/aven-globe-updater/runUpdate.sh', [], {
    cwd: '/globe',
    stdio: 'inherit',
  });
  console.log('systemctl restart aven-hyperion.service');
  await spawn('systemctl', ['restart', 'aven-hyperion.service'], {
    cwd: '/globe',
    stdio: 'inherit',
  });
  console.log('deploy done!')
};

app.get('/', (req, res) => {
  res.send('Hello there, public world');
});

app.get('/kick', async (req, res) => {
  if (req.query.secret !== process.env.GLOBE_UPDATER_SECRET) {
    res.status(400).send('Incorrect secret');
    return;
  }
  await goDeploy();
  res.send('done');
});

app.post(
  '/update/github',
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      const secretDigest = crypto.createHmac(
        'sha1',
        process.env.GH_HOOK_SECRET,
      );
      secretDigest.update(buf);
      const secretSig = secretDigest.digest('hex');
      const inputSecret = req.headers['x-hub-signature'];
      if (inputSecret !== 'sha1=' + secretSig) {
        throw new Error('Invalid secret checksum');
      }
    },
  }),
  async (req, res) => {
    console.log('update from github');
    console.log(req.body);

    await goDeploy();

    res.send('thanks github');
  },
);

app.listen(8899, () => {
  console.log('server started on 8899');
});
