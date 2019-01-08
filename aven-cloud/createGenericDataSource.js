import { BehaviorSubject } from 'rxjs-compat';
import uuid from 'uuid/v1';

import createDispatcher from '../aven-cloud-utils/createDispatcher';
import { getListDocName } from '../aven-cloud-utils/MetaDocNames';

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

export default function createGenericDataSource({
  getBlock,
  getAllBlockIds,
  commitBlock,
  commitBlockId,
  commitDoc,
  commitDocDestroy,
  commitDocMove,
  isConnected,
  docState,
  domain: dataSourceDomain,
  id,
}) {
  const dataSourceId = id || uuid();
  function getMemoryNode(name, ensureExistence, context) {
    let currentNode = context || docState;
    if (!currentNode.children) {
      currentNode.children = {};
    }
    if (!currentNode.childrenSet) {
      currentNode.childrenSet = new Set();
    }
    if (name === '') {
      return currentNode;
    }
    let rootTerm = getRootTerm(name);
    let { children, childrenSet, childrenSetBehavior } = currentNode;
    if (!children[rootTerm]) {
      children[rootTerm] = {};
    }
    if (ensureExistence && !childrenSet.has(rootTerm)) {
      childrenSet.add(rootTerm);
      childrenSetBehavior &&
        childrenSetBehavior.next({
          value: [...childrenSet],
        });
    }
    const childNode = children[rootTerm];
    if (name === rootTerm) {
      return getMemoryNode('', ensureExistence, childNode);
    }
    const childPath = getChildName(name);
    return getMemoryNode(childPath, ensureExistence, childNode);
  }

  async function PutDoc({ domain, name, id }) {
    verifyDomain(domain, dataSourceDomain);
    if (id !== null) {
      await commitBlockId(id);
    }
    await commitDoc(name, id);
    const memoryDoc = getMemoryNode(name, true);
    memoryDoc.id = id;
    if (memoryDoc.behavior) {
      memoryDoc.behavior.next(_renderDoc(memoryDoc));
    } else {
      memoryDoc.behavior = new BehaviorSubject(_renderDoc(memoryDoc));
    }
  }

  async function PutDocValue({ domain, name, value }) {
    verifyDomain(domain, dataSourceDomain);
    const blk = await commitBlock(value);
    const id = blk.id;
    await commitDoc(name, id);
    const memoryDoc = getMemoryNode(name, true);
    memoryDoc.id = id;
    if (memoryDoc.behavior) {
      memoryDoc.behavior.next(_renderDoc(memoryDoc));
    } else {
      memoryDoc.behavior = new BehaviorSubject(_renderDoc(memoryDoc));
    }
  }

  function publishChildrenBehavior(memoryDoc) {
    memoryDoc.childrenSetBehavior &&
      memoryDoc.childrenSetBehavior.next({ value: [...memoryDoc.childrenSet] });
  }
  async function MoveDoc({ domain, from, to }) {
    verifyDomain(domain, dataSourceDomain);
    await commitDocMove(from, to);
    const fromParentName = getParentDocName(from);
    const fromChildName = getMainTerm(from);
    const toParentName = getParentDocName(to);
    const toChildName = getMainTerm(to);
    const fromParent = getMemoryNode(fromParentName, false);
    const toParent = getMemoryNode(toParentName, true);
    const docToMove = fromParent.children[fromChildName];
    toParent.children[toChildName] = docToMove;
    toParent.childrenSet.add(toChildName);
    publishChildrenBehavior(toParent);
    delete fromParent.children[fromChildName];
    fromParent.childrenSet.delete(fromChildName);
    publishChildrenBehavior(fromParent);
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
    const parentMemoryDoc = getMemoryNode(getParentDocName(name), false);
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
    // if (!name) {
    //   throw new Error('Name must be provided while getting a block!');
    //   // and ACTUALLY, shouldn't we actually save this block under the context of this doc??
    // }
    verifyDomain(domain, dataSourceDomain);
    return await commitBlock(value);
  }

  async function GetDoc({ domain, name }) {
    verifyDomain(domain, dataSourceDomain);
    const memoryDoc = getMemoryNode(name, false);
    if (!memoryDoc) {
      return { id: undefined };
    }
    return { id: memoryDoc.id };
  }

  async function ListDocs({ domain, parentName }) {
    verifyDomain(domain, dataSourceDomain);
    const parentMemoryDoc = getMemoryNode(parentName || '', false);
    if (!parentMemoryDoc) {
      return [];
    }
    const children = [...parentMemoryDoc.childrenSet];
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
    const listDocName = getListDocName(name);
    if (typeof listDocName === 'string') {
      const memoryDoc = getMemoryNode(listDocName, false);
      if (memoryDoc.childrenSetBehavior) {
        return memoryDoc.childrenSetBehavior;
      } else {
        memoryDoc.childrenSetBehavior = new BehaviorSubject({
          value: [...memoryDoc.childrenSet],
        });
        return memoryDoc.childrenSetBehavior;
      }
    }
    const memoryDoc = getMemoryNode(name, false);
    if (memoryDoc === null) {
      throw new Error(`Cannot observe nonexistent doc "${name}"`);
    }
    if (memoryDoc && memoryDoc.behavior) {
      return memoryDoc.behavior;
    } else {
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
    if (!id) {
      return { id, value: undefined };
    }
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
      PutDocValue,
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
