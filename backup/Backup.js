import { createClient } from '../cloud-core/Kite';
import createFSClient from '../cloud-server/createFSClient';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';
import fs from 'fs-extra';
import cuid from 'cuid';

const domain = 'onofood.co';
const source = createNodeNetworkSource({
  authority: 'onoblends.co',
  useSSL: true,
  quiet: true,
});
// const client = createClient({
//   source,
//   domain,
// });
const auth = {
  accountId: 'root',
  verificationInfo: {},
  verificationResponse: { password: process.env.ONO_ROOT_PASSWORD },
};

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

const tasks = [];
function queueTask(type, params) {
  tasks.push({ type, params });
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
    queueTask('BackupDocNode', { name: childFullName, jobId });
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
      queueTask('BackupBlockNode', { name, id: res.id });
      outputNode.id = res.id;
    }
  }
}

fs.mkdirpSync(`${BACKUP_DIR}/blocks`);
fs.mkdirpSync(`${BACKUP_DIR}/docs`);

const CHECK_DEEP = true;

async function handleBackupBlockNode({ name, id }) {
  const blockPath = `${BACKUP_DIR}/blocks/${id}.json`;
  if (await fs.exists(blockPath)) {
    if (CHECK_DEEP) {
      const data = await fs.readFile(blockPath);
      const blockValue = JSON.parse(data);
      const children = extractBlockRefs(blockValue);
      if (children) {
        children.forEach(childId => {
          queueTask('BackupBlockNode', { name, id: childId });
        });
      }
    }
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
      queueTask('BackupBlockNode', { name, id: childId });
    });
  }
  await fs.writeFile(blockPath, JSON.stringify(res.value));
}

async function handleTask(task) {
  console.log(
    `Handling ${task.type}.. ${Object.entries(task.params)
      .map(([k, v]) => `${k}:${v}`)
      .join(',')}`,
  );
  try {
    switch (task.type) {
      case 'BackupDocNode': {
        return await handleBackupDocNode(task.params);
      }
      case 'BackupBlockNode': {
        return await handleBackupBlockNode(task.params);
      }
    }
  } catch (e) {
    console.error('Task failed!', task, e);
    console.log('Will retry..');
    queueTask(task.type, task.params);
  }
}

async function handleRollup(jobId) {
  const docsFile = `${BACKUP_DIR}/docs/${domain}_${jobId}.json`;
  await fs.writeFile(docsFile, JSON.stringify(jobResults[jobId]));
}

const doneTasks = [];

async function runBackup() {
  const jobId = cuid();
  queueTask('BackupDocNode', { name: null, jobId });
  while (tasks.length > 0) {
    const task = tasks.shift();
    await handleTask(task);
    doneTasks.push(task);
  }
  await handleRollup(jobId);
}

runBackup()
  .then(() => {
    console.log('Backup run done.');
    console.log(`(in ${doneTasks.length} tasks)`);
  })
  .catch(e => {
    console.error(e);
  });
