import createCloudClient from '../cloud-core/createCloudClient';
import createFSClient from '../cloud-server/createFSClient';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';
import fs from 'fs-extra';

const domain = 'onofood.co';
const source = createNodeNetworkSource({
  authority: 'onofood.co',
  useSSL: true,
  quiet: true,
});
const client = createCloudClient({
  source,
  domain,
});
const auth = {
  accountId: 'root',
  verificationInfo: {},
  verificationResponse: { password: process.env.ONO_ROOT_PASSWORD },
};
const fsClient = createFSClient({ client });

const BACKUP_DIR = process.env.ONO_BACKUP_DIR;

const jobResults = {};

if (!BACKUP_DIR) {
  throw new Error('Set env ONO_BACKUP_DIR');
}

function extractBlockRefs(value) {
  if (value === null || typeof value !== 'object') {
    return null;
  }
  if (value.type === 'BlockReference' && value.id) {
    return [value.id];
  }
  const extractVals = value instanceof Array ? value : Object.entries(value);
  return extractVals.reduce((refs, childVal) => {
    const childRefs = extractBlockRefs(childVal);
    if (childRefs) {
      return [...refs, ...childRefs];
    }
    return refs;
  }, []);
}

const jobs = [];
function queueJob(type, params) {
  jobs.push({ type, params });
}

async function listAllDocs(parentName) {
  let isDone = false;
  let allChildren = [];
  let lastNameSeen = undefined;
  while (isDone === false) {
    const results = await source.dispatch({
      type: 'ListDocs',
      domain,
      auth,
      parentName,
      afterName: lastNameSeen,
    });
    const lastResult = results.docs[results.docs.length - 1];
    lastNameSeen = lastResult;
    allChildren = [...allChildren, ...results.docs];
    isDone = !results.hasMore;
  }
  return allChildren;
}

function dig(context, path) {
  if (!path || path === '') {
    return context;
  }
  let innerCtx = context;
  path.split('/').forEach(pathTerm => {
    const children = innerCtx.children || (innerCtx.children = {});
    innerCtx = children[pathTerm] || (children[pathTerm] = {});
  });
  return innerCtx;
}

async function handleBackupDocNode({ name, jobId }) {
  const children = await listAllDocs(name);

  children.forEach(childName => {
    const childFullName = name ? `${name}/${childName}` : childName;
    queueJob('BackupDocNode', { name: childFullName, jobId });
  });
  const jobResultNode = jobResults[jobId] || (jobResults[jobId] = {});
  let outputNode = name ? dig(jobResultNode, name) : jobResultNode;

  if (name) {
    const res = await source.dispatch({
      type: 'GetDoc',
      domain,
      auth,
      name,
    });
    if (res && res.id) {
      queueJob('BackupBlockNode', { name, id: res.id });
      outputNode.id = res.id;
    }
  }
}

fs.mkdirpSync(`${BACKUP_DIR}/blocks`);
fs.mkdirpSync(`${BACKUP_DIR}/docs`);

async function handleBackupBlockNode({ name, id }) {
  const blockPath = `${BACKUP_DIR}/blocks/${id}.json`;
  if (await fs.exists(blockPath)) {
    return;
  }
  const res = await source.dispatch({
    type: 'GetBlock',
    domain,
    auth,
    name,
    id,
  });
  const children = extractBlockRefs(res.value);
  if (children) {
    children.forEach(childId => {
      queueJob('BackupBlockNode', { name, id: childId });
    });
  }
  await fs.writeFile(blockPath, JSON.stringify(res.value));
}

async function handleJob(job) {
  console.log('Handling Backup Job', job);
  switch (job.type) {
    case 'BackupDocNode': {
      return await handleBackupDocNode(job.params);
    }
    case 'BackupBlockNode': {
      return await handleBackupBlockNode(job.params);
    }
  }
}

async function handleJobRollup(jobId) {
  const docsFile = `${BACKUP_DIR}/docs/${domain}_${jobId}.json`;
  await fs.writeFile(docsFile, JSON.stringify(jobResults[jobId]));
}

const doneJobs = [];

async function runBackup() {
  const jobId = new Date().toISOString();
  queueJob('BackupDocNode', { name: null, jobId });
  while (jobs.length > 0) {
    const job = jobs.shift();
    await handleJob(job);
    doneJobs.push(job);
  }
  await handleJobRollup(jobId);
}

runBackup()
  .then(() => {
    console.log('Backup run done.');
    console.log(`(in ${doneJobs.length} jobs)`);
  })
  .catch(e => {
    console.error(e);
  });
