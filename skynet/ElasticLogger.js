import { LOG_LEVELS } from '../logger/logger';
import cuid from 'cuid';

const fetch = require('node-fetch');

const ELASTIC_HOST = process.env.ELASTIC_HOST;
const ELASTIC_USERNAME = process.env.ELASTIC_USERNAME;
const ELASTIC_SECRET = process.env.ELASTIC_SECRET;

let pendingLogs = [];

let savingPromise = null;

let savingTimeoutSlow = null;
let savingTimeoutFast = null;

function startLogSave() {
  clearTimeout(savingTimeoutSlow);
  clearTimeout(savingTimeoutFast);

  if (savingPromise) {
    savingPromise.then(() => {
      scheduleLogSave();
    });
    return;
  }
  if (pendingLogs.length === 0) {
    return;
  }
  const savingLogs = pendingLogs;
  pendingLogs = [];
  savingPromise = saveLogs(savingLogs);

  savingPromise
    .then(() => {})
    .catch(e => {
      console.error('Could not write logs!');
      console.error(e);
      pendingLogs = [...savingLogs, ...pendingLogs];
      console.log('Now has ' + pendingLogs.length + ' logs in queue');
    })
    .finally(() => {
      savingPromise = null;
    });
}

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function scheduleLogSave() {
  clearTimeout(savingTimeoutFast);
  savingTimeoutFast = setTimeout(startLogSave, 50);
  savingTimeoutSlow = setTimeout(startLogSave, 500);
}

async function saveLogs(logValues) {
  const actions = [];
  const todayString = getTodayString();
  logValues.forEach(log => {
    actions.push({
      create: {
        _index: `node-${todayString}`,
        _type: '_doc',
        _id: log['@eventId'],
      },
    });
    actions.push(log);
  });
  const reqBody = actions.map(a => JSON.stringify(a)).join('\n') + '\n';

  const res = await fetch(`${ELASTIC_HOST}/_bulk`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-ndjson',
      Authorization:
        'Basic ' +
        Buffer.from(ELASTIC_USERNAME + ':' + ELASTIC_SECRET).toString('base64'),
    },
    body: reqBody,
  });

  if (res.status !== 200) {
    console.error(res);
    res.text().then(e => console.error(e));
    throw new Error('Could not save logs');
  }

  const resp = await res.json();

  if (resp.errors) {
    console.error(resp);
    throw new Error('Could not save logs');
  }
}

const MESSAGES_ALLOWED = new Set([
  'CustomerFeedbackWillSubmit',
  'CustomerFeedbackDidSubmit',
]);

export function logElastic(message, fields, level) {
  const logValue = {
    ...fields,
    '@eventId': cuid(),
    '@timestamp': new Date().toISOString(),
    '@message': message,
    '@version': 1,
    level: LOG_LEVELS[level],
  };
  const logLine = JSON.stringify(logValue);
  console.log(logLine);
  if (MESSAGES_ALLOWED.has(message)) {
    pendingLogs.push(logValue);
    scheduleLogSave();
  }
}
