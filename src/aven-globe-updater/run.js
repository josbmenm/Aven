require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const crypto = require('crypto');

const spawn = require('@expo/spawn-async');

const app = express();

const goDeploy = async () => {
  console.log('git pull');
  await spawn('git', ['pull'], { cwd: '/globe', stdio: 'inherit' });
  console.log('yarn');
  await spawn('yarn', { cwd: '/globe', stdio: 'inherit' });
  console.log('yarn build-vendor');
  await spawn('yarn', ['build-vendor'], { cwd: '/globe', stdio: 'inherit' });
  console.log('yarn build-web');
  await spawn('yarn', ['build-web'], { cwd: '/globe', stdio: 'inherit' });
  console.log('systemctl restart aven-hyperion.service');
  await spawn('systemctl', ['restart', 'aven-hyperion.service'], {
    cwd: '/globe',
    stdio: 'inherit',
  });
  console.log('systemctl status aven-hyperion.service');
  await spawn('systemctl', ['status', 'aven-hyperion.service'], {
    cwd: '/globe',
    stdio: 'inherit',
  });
};

app.get('/', (req, res) => {
  res.send('Hello there, public world');
});

app.get('/kick', async (req, res) => {
  if (req.query.secret !== process.env.GLOBE_UPDATER_SECRET) {
    res.setStatus(400).send('Incorrect secret');
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
