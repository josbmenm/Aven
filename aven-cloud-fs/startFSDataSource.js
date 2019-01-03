import { BehaviorSubject } from 'rxjs-compat';
import uuid from 'uuid/v1';

import createDispatcher from '../aven-cloud-utils/createDispatcher';
import {
  getListBlocksName,
  getListDocName,
} from '../aven-cloud-utils/MetaDocNames';

const fs = require('fs-extra');
const crypto = require('crypto');
const stringify = require('json-stable-stringify');
const pathJoin = require('path').join;

function getTerms(name) {
  if (!name) {
    return [];
  }
  return name.split('/');
}

function isDocNameValid(name) {
  return getTerms(name).reduce((prev, now, i) => {
    return prev && now !== '_children';
  }, true);
}

function getDocsListName(name) {
  const terms = getTerms(name);
  const parentTerms = terms.slice(0, terms.length - 1);
  const docsListName =
    parentTerms.length === 0
      ? '_children'
      : parentTerms.join('/') + '/_children';
  return docsListName;
}

function getParentDocName(name) {
  const terms = getTerms(name);
  const parentTerms = terms.slice(0, terms.length - 1);
  return parentTerms.join('/');
}

function getMainTerm(name) {
  const terms = getTerms(name);
  return terms[terms.length - 1];
}

function getRootTerm(name) {
  const terms = getTerms(name);
  return terms[0];
}

function getChildName(name) {
  const terms = getTerms(name);
  const childTerms = terms.slice(1);
  const childName = childTerms.join('/');
  return childName;
}

function _renderDoc({ id }) {
  // this strips out hidden features of the doc and snapshots the referenced values
  return {
    id,
  };
}

function verifyDomain(inputDomain, dataSourceDomain) {
  if (inputDomain !== dataSourceDomain) {
    throw new Error(
      `Invalid domain for this data source. Expecting "${dataSourceDomain}", but "${inputDomain}" was provided as the domain`
    );
  }
}

function createGenericDataSource({
  getBlock,
  getAllBlockIds,
  commitBlock,
  commitDoc,
  commitDocDestroy,
  commitDocMove,
  isConnected,
  docState,
  domain: dataSourceDomain,
  id,
}) {
  const dataSourceId = id || uuid();
  function getWriteNode(name, context) {
    let currentNode = context || docState;
    if (name === '') {
      return currentNode;
    }
    let rootTerm = getRootTerm(name);
    if (!currentNode.children) {
      currentNode.children = {};
    }
    const { children, childrenSet, childrenSetBehavior } = currentNode;
    if (!children[rootTerm]) {
      children[rootTerm] = {};
      if (childrenSet && !childrenSet.has(rootTerm)) {
        childrenSet.add(rootTerm);
        childrenSetBehavior &&
          childrenSetBehavior.next({
            value: [...childrenSet],
          });
      }
    }
    const childNode = children[rootTerm];
    if (name === rootTerm) {
      return childNode;
    }
    const childPath = getChildName(name);
    return getWriteNode(childPath, childNode);
  }

  function getReadNode(name, context) {
    let currentNode = context || docState;
    if (name === '') {
      return currentNode;
    }
    let rootTerm = getRootTerm(name);
    if (!currentNode.children) {
      return null;
    }
    const { children } = currentNode;
    if (!children[rootTerm]) {
      return null;
    }
    const childNode = children[rootTerm];
    if (name === rootTerm) {
      return childNode;
    }
    const childPath = getChildName(name);
    return getReadNode(childPath, childNode);
  }

  async function PutDoc({ domain, name, id }) {
    verifyDomain(domain, dataSourceDomain);
    await commitDoc(name, id);
    const memoryDoc = getWriteNode(name);
    memoryDoc.id = id;
    if (memoryDoc.behavior) {
      memoryDoc.behavior.next(_renderDoc(memoryDoc));
    } else {
      memoryDoc.behavior = new BehaviorSubject(_renderDoc(memoryDoc));
    }
  }

  async function MoveDoc({ domain, from, to }) {
    verifyDomain(domain, dataSourceDomain);
    await commitDocMove(from, to);
    const fromParentName = getParentDocName(from);
    const fromChildName = getMainTerm(from);
    const toParentName = getParentDocName(to);
    const toChildName = getMainTerm(to);
    const fromParent = getReadNode(fromParentName);
    const toParent = getWriteNode(toParentName);
    const docToMove = fromParent.children[fromChildName];
    toParent.children[toChildName] = docToMove;
    delete fromParent.children[fromChildName];
  }

  async function PostDoc({ domain, name, id, value }) {
    verifyDomain(domain, dataSourceDomain);

    if (!isDocNameValid(name)) {
      throw new Error(`Invalid Doc name "${name}"`);
    }
    if (domain === undefined) {
      throw new Error('Invalid use. ', { domain, name, id });
    }
    const postedName = name ? pathJoin(name, uuid()) : uuid();
    if (!id && value !== undefined) {
      const block = await PutBlock({ domain, name: postedName, value });
      await PutDoc({ domain, name: postedName, id: block.id });
      return { name: postedName, id: block.id };
    } else {
      await PutDoc({ domain, name: postedName, id });
      return { name: postedName, id };
    }
  }

  async function DestroyDoc({ domain, name }) {
    verifyDomain(domain, dataSourceDomain);
    await commitDocDestroy(name);
    const parentMemoryDoc = getReadNode(getParentDocName(name));
    const destroyChildName = getMainTerm(name);
    if (!parentMemoryDoc || !parentMemoryDoc.children[destroyChildName]) {
      throw new Error('Cannot destroy doc that does not exist');
    }
    const { children, childrenSet, childrenSetBehavior } = parentMemoryDoc;
    delete children[destroyChildName];
    if (childrenSet) {
      childrenSet.delete(destroyChildName);
    }
    if (childrenSetBehavior) {
      childrenSetBehavior.next({ value: [...childrenSet] });
    }
  }

  async function GetBlock({ domain, name, id }) {
    if (!name) {
      throw new Error('Name must be provided while getting a block!');
      // and theoretically, shouldn't we actually verify that the block actually belongs to this doc??
    }
    verifyDomain(domain, dataSourceDomain);
    const value = await getBlock(id);
    return { id, value };
  }

  async function PutBlock({ value, name, domain }) {
    if (!name) {
      throw new Error('Name must be provided while getting a block!');
      // and theoretically, shouldn't we actually save this block under the context of this doc??
    }
    verifyDomain(domain, dataSourceDomain);
    return await commitBlock(value);
  }

  async function GetDoc({ domain, name }) {
    verifyDomain(domain, dataSourceDomain);
    const memoryDoc = getReadNode(name);
    if (!memoryDoc) {
      return { id: undefined };
    }
    return { id: memoryDoc.id };
  }

  async function ListDocs({ domain, parentName }) {
    verifyDomain(domain, dataSourceDomain);
    const parentMemoryDoc = getReadNode(parentName || '');
    if (!parentMemoryDoc) {
      return [];
    }
    const children = Object.keys(parentMemoryDoc.children || {});
    return children;
  }

  async function ListDomains() {
    return [dataSourceDomain];
  }

  async function CollectGarbage() {}

  const GetStatus = () => ({
    ready: true,
    connected: true,
    migrated: true,
  });

  const close = () => {
    docState = null;
  };
  const observeDoc = async (domain, name) => {
    verifyDomain(domain, dataSourceDomain);
    const memoryDoc = getReadNode(name);
    if (memoryDoc && memoryDoc.behavior) {
      return memoryDoc.behavior;
    } else {
      const listDocName = getListDocName(name);
      if (typeof listDocName === 'string') {
        const memoryDoc = getReadNode(listDocName);
        if (memoryDoc.childrenSetBehavior) {
          return memoryDoc.childrenSetBehavior;
        } else {
          const childrenNames = Object.keys(memoryDoc.children || {});
          memoryDoc.childrenSetBehavior = new BehaviorSubject({
            value: childrenNames,
          });
          memoryDoc.childrenSet = new Set(childrenNames);
          return memoryDoc.childrenSetBehavior;
        }
      }
      return (memoryDoc.behavior = new BehaviorSubject(_renderDoc(memoryDoc)));
    }
  };

  async function GetDocValue({ domain, name }) {
    verifyDomain(domain, dataSourceDomain);

    const listDocName = getListDocName(name);
    if (typeof listDocName === 'string') {
      const docNames = await ListDocs({ domain, parentName: listDocName });
      return { id: undefined, value: docNames };
    }
    const doc = await GetDoc({ domain, name });
    const id = doc && doc.id;
    const block = await GetBlock({ domain, name, id });
    return {
      id,
      value: block.value,
    };
  }

  return {
    isConnected,
    close,
    observeDoc,
    dispatch: createDispatcher({
      PutDoc,
      PostDoc,
      PutBlock,
      GetBlock,
      GetDoc,
      GetDocValue,
      GetStatus,
      ListDomains,
      ListDocs,
      DestroyDoc,
      CollectGarbage,
      MoveDoc,
    }),
    id: dataSourceId,
  };
}

async function readFSDoc(dataDir, name) {
  const docsDir = pathJoin(dataDir, 'docs');
  const docPath = pathJoin(docsDir, name);
  const childList = await fs.readdir(docPath);
  const children = {};
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
    })
  );
  return {
    children,
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
    commitDoc,
    commitDocDestroy,
    commitDocMove,

    isConnected,
  });
}
