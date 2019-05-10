const path = require('path');
const fs = require('fs-extra');

async function BackupDoc(source, { domain, name }) {}

async function BackupBlock(source, { domain, name, id }) {}

async function BackupDomain(source, { domain }) {}

const backupJobs = {
  BackupDoc,
  BackupBlock,
  BackupDomain,
};

async function startBackupRunner(
  source,
  startDomain,
  stateFilePath = './backupState.json',
) {
  let backupState = {
    jobQueue: [],
  };
  if (await fs.exists('./backupState.json')) {
    await fs.readFile('./backupState.json', {
      encoding: 'utf8',
    });
  }
  console.log('ffs', backupState);

  let flushStateQuickTimeout = null;
  let flushStateSlowTimeout = null;
  function scheduleStateFlush() {
    flushStateQuickTimeout = setTimeout(flushState, 50);
    flushStateSlowTimeout = setTimeout(flushState, 500);
  }
  function flushState() {
    let startingState = backupState;
    clearTimeout(flushStateQuickTimeout);
    clearTimeout(flushStateSlowTimeout);
    fs.writeFile('./backupState.json', JSON.stringify(startingState, null, 2))
      .then(() => {
        console.log('Wrote backup state.');
      })
      .catch(console.error);
    if (backupState !== startingState) {
      scheduleStateFlush();
    }
  }
  async function enqueueJob(jobType, params) {
    backupState = {
      ...backupState,
      jobQueue: [
        ...backupState.jobQueue,
        { jobType, params, queueTime: Date.now() },
      ],
    };
    scheduleStateFlush();
  }

  if (startDomain) {
    enqueueJob('BackupDomain', { domain: startDomain });
  }
}

const shouldStart = process.argv[2] === 'start';
const startDomain = shouldStart ? 'onofood.co' : null;

const source = {};

startBackupRunner(source, startDomain)
  .then(() => {})
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
