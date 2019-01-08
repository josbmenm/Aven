import { BehaviorSubject } from 'rxjs-compat';
import createGenericDataSource from '../aven-cloud/createGenericDataSource';

const fs = require('fs-extra');
const crypto = require('crypto');
const stringify = require('json-stable-stringify');
const pathJoin = require('path').join;

async function readFSDoc(dataDir, name) {
  const docsDir = pathJoin(dataDir, 'docs');
  const docPath = pathJoin(docsDir, name);
  const childList = await fs.readdir(docPath);
  const children = {};
  const childrenSet = new Set();
  let id = undefined;
  await Promise.all(
    childList.map(async child => {
      if (child === '__document.json') {
        const docFile = await fs.readFile(pathJoin(docPath, '__document.json'));
        const docData = JSON.parse(docFile);
        id = docData.id;
        return;
      }
      children[child] = await readFSDoc(dataDir, pathJoin(name, child));
      childrenSet.add(child);
    })
  );
  return {
    children,
    childrenSet,
    id,
  };
}

async function writeFSBlock(dataDir, value) {
  const blocksDir = pathJoin(dataDir, 'blocks');
  const blockData = stringify(value);
  const sha = crypto.createHash('sha1');
  sha.update(blockData);
  const id = sha.digest('hex');
  const blockPath = pathJoin(blocksDir, id);
  if (!(await fs.exists(blockPath))) {
    await fs.writeFile(blockPath, blockData);
  }
  return { id };
}

async function readFSBlock(dataDir, id) {
  const blocksDir = pathJoin(dataDir, 'blocks');
  const blockPath = pathJoin(blocksDir, id);
  const blockData = await fs.readFile(blockPath);
  return JSON.parse(blockData);
}

async function hasFSBlock(dataDir, id) {
  if (id == null) {
    return false;
  }
  const blocksDir = pathJoin(dataDir, 'blocks');
  const blockPath = pathJoin(blocksDir, id);
  const hasBlock = await fs.exists(blockPath);
  return hasBlock;
}

async function readFSBlockList(dataDir) {
  const blocksDir = pathJoin(dataDir, 'blocks');
  return await fs.readdir(blocksDir);
}

async function writeFSDoc(dataDir, name, id) {
  const docsDir = pathJoin(dataDir, 'docs');
  const docPath = pathJoin(docsDir, name);
  await fs.mkdirp(docPath);
  const docFilePath = pathJoin(docPath, '__document.json');
  await fs.writeFile(docFilePath, JSON.stringify({ id }));
}

async function destroyFSDoc(dataDir, name) {
  const docsDir = pathJoin(dataDir, 'docs');
  const docPath = pathJoin(docsDir, name);
  await fs.remove(docPath);
}

async function moveFSDoc(dataDir, prevName, newName) {
  const docsDir = pathJoin(dataDir, 'docs');
  const sourcePath = pathJoin(docsDir, prevName);
  const destPath = pathJoin(docsDir, newName);
  await fs.move(sourcePath, destPath);
}

export default async function startFSDataSource(opts = {}) {
  const dataSourceDomain = opts.domain;
  let dataDir = opts.dataDir;

  if (!dataDir) {
    throw new Error(
      'Cannot start a FS data source without specifying a dataDir to store data files'
    );
  }

  if (!dataSourceDomain) {
    throw new Error(
      'Cannot start a FS data source without specifying a domain'
    );
  }

  const blocksDir = pathJoin(dataDir, 'blocks');
  const docsDir = pathJoin(dataDir, 'docs');

  await fs.mkdirp(blocksDir);
  await fs.mkdirp(docsDir);

  // FS data source needs sync access to docs, and will handle blocks on a file-by-file basis. we start by reading all docs:
  const docState = await readFSDoc(dataDir, '');

  const isConnected = new BehaviorSubject(true);

  async function getBlock(blockId) {
    return await readFSBlock(dataDir, blockId);
  }

  async function getAllBlockIds() {
    return await readFSBlockList(dataDir);
  }

  async function commitBlock(value) {
    return await writeFSBlock(dataDir, value);
  }

  async function commitBlockId(id) {
    // we just need to make sure we have this block.
    if (!(await hasFSBlock(dataDir, id))) {
      throw new Error(`Cannot find block with id "${id}"`);
    }
  }

  async function commitDoc(name, id) {
    await writeFSDoc(dataDir, name, id);
  }

  async function commitDocDestroy(name) {
    await destroyFSDoc(dataDir, name);
  }

  async function commitDocMove(name, newName) {
    await moveFSDoc(dataDir, name, newName);
  }

  return createGenericDataSource({
    id: opts.id,

    domain: dataSourceDomain,
    docState,

    getBlock,
    getAllBlockIds,

    commitBlock,
    commitBlockId,
    commitDoc,
    commitDocDestroy,
    commitDocMove,

    isConnected,
  });
}
