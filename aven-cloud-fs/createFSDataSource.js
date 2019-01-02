import { BehaviorSubject } from 'rxjs-compat';
import uuid from 'uuid/v1';

import createDispatcher from '../aven-cloud-utils/createDispatcher';
import {
  getListBlocksName,
  getListDocName,
} from '../aven-cloud-utils/MetaDocNames';

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
    return prev && (now !== '_children' && now !== '_blocks');
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

function getParentDoc(name) {
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

function _renderDoc({ id }) {
  // this strips out hidden features of the doc and snapshots the referenced values
  return {
    id,
  };
}

export default async function startFSDataSource(opts = {}) {
  const id = uuid();
  const dataSourceDomain = opts.domain;
  let _blocks = {};
  let _blocksSize = {};
  let _docs = {};
  let dataDir = opts.dataDir || process.cwd();

  // FS data source needs sync access to docs, and will handle blocks on a file-by-file basis. we start by reading all docs:

  function _getDoc(name) {
    const r = _docs[name] || (_docs[name] = {});
    r.blocks = r.blocks || {};
    return r;
  }

  const isConnected = new BehaviorSubject(true);

  if (dataSourceDomain == null) {
    throw new Error(`Empty domain passed to startFSDataSource`);
  }

  function putDocInList(docName) {
    const listR = _getDoc(getDocsListName(docName));
    if (listR.behavior) {
      const last = listR.behavior.value;
      const docSet = new Set(last.value || []);
      docSet.add(getMainTerm(docName));
      listR.behavior.next({
        ...(last || {}),
        value: Array.from(docSet),
      });
    }
    if (getMainTerm(docName) !== docName) {
      // this is a child doc. also make sure the parent doc has been added to lists
      putDocInList(getParentDoc(docName));
    }
  }

  function removeDocFromList(docName) {
    const listR = _getDoc(getDocsListName(docName));
    if (listR.behavior) {
      const last = listR.behavior.value;
      const docSet = new Set(last.value || []);
      docSet.delete(getMainTerm(docName));
      const muchNext = {
        ...(last || {}),
        value: Array.from(docSet),
      };
      listR.behavior.next(muchNext);
    }
  }

  async function PutDoc({ domain, name, id }) {
    if (!isDocNameValid(name)) {
      throw new Error(`Invalid Doc name "${name}"`);
    }
    if (domain === undefined || name === undefined) {
      throw new Error('Invalid use. ', { domain, name, id });
    }
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`,
      );
    }
    const r = _getDoc(name);
    const prevId = r.id;
    r.blocks[id] = true;
    r.id = id;
    if (r.behavior) {
      r.behavior.next(_renderDoc(r));
    } else {
      r.behavior = new BehaviorSubject(_renderDoc(r));
    }

    putDocInList(name);
  }

  async function MoveDoc({ domain, from, to }) {
    if (!isDocNameValid(from)) {
      throw new Error(`Invalid from Doc name "${from}"`);
    }
    if (!isDocNameValid(to)) {
      throw new Error(`Invalid to Doc name "${to}"`);
    }
    if (domain === undefined || from === undefined || to === undefined) {
      throw new Error('Invalid use. ', { domain, from, to });
    }
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`,
      );
    }
    const re = new RegExp('^' + from + '(.*)$');
    Object.keys(_docs).forEach(docName => {
      const match = docName.match(re);
      if (match) {
        const toName = to + match[1];
        _docs[toName] = _docs[docName];
        delete _docs[docName];
      }
    });
    removeDocFromList(from);
    putDocInList(to);
  }

  async function PostDoc({ domain, name, id, value }) {
    if (!isDocNameValid(name)) {
      throw new Error(`Invalid Doc name "${name}"`);
    }
    if (domain === undefined) {
      throw new Error('Invalid use. ', { domain, name, id });
    }
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`,
      );
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
    if (domain === undefined || name === undefined) {
      throw new Error('Invalid use. ', { domain, name, id });
    }
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`,
      );
    }
    Object.keys(_docs)
      .filter(docName => {
        const m = docName.match(RegExp(`^${name}/?(.*)`));
        return !!m;
      })
      .forEach(docName => {
        const r = _getDoc(docName);
        r.blocks = {};
        r.id = null;
        if (r.behavior) {
          r.behavior.next(_renderDoc(r));
        } else {
          r.behavior = new BehaviorSubject(_renderDoc(r));
        }
        delete _docs[name];
      });

    const listR = _getDoc(getDocsListName(name));
    if (listR.behavior) {
      const last = listR.behavior.value;
      const docSet = new Set(last.value || []);
      const thisTermName = getMainTerm(name);
      if (!docSet.has(thisTermName)) {
        return;
      }
      docSet.delete(thisTermName);
      listR.behavior.next({
        ...(last || {}),
        value: Array.from(docSet),
      });
    }
  }

  async function GetBlock({ domain, name, id }) {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`,
      );
    }
    const r = _getDoc(name);

    if (r.blocks[id] && _blocks[id] !== undefined) {
      return {
        id,
        value: _blocks[id],
      };
    }
    return {
      id,
      value: undefined,
    };
  }
  function _isValidName(name) {
    return typeof name === 'string' && name.length > 0;
  }

  async function PutBlock({ value, name, domain }) {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`,
      );
    }
    if (!_isValidName(name)) {
      throw new Error(
        `Invalid doc name "${name}", must be provided with PutBlock`,
      );
    }
    const blockData = stringify(value);
    const size = blockData.length;
    const sha = crypto.createHash('sha1');
    sha.update(blockData);
    const id = sha.digest('hex');
    if (_blocks == null) {
      throw new Error(`Memory source "${id}" has been closed!`);
    }
    if (_blocks[id] === undefined) {
      _blocks[id] = value;
    }
    if (_blocksSize[id] === undefined) {
      _blocksSize[id] = size;
    }
    const r = _getDoc(name);
    r.blocks[id] = true;
    return { id };
  }

  async function GetDoc({ domain, name }) {
    if (domain !== dataSourceDomain) {
      return null;
    }
    const r = _docs[name];
    return _renderDoc(r || {});
  }

  async function ListDocs({ domain, parentName }) {
    if (domain !== dataSourceDomain) {
      return [];
    }
    const results = Object.keys(_docs)
      .map(docName => {
        if (parentName == null || parentName === '') {
          return docName;
        }
        const m = docName.match(RegExp(`^${parentName}/(.*)`));
        if (!m || m[1] === '') {
          return null;
        }
        return m[1];
      })
      .map(name => {
        if (!name) {
          return null;
        }
        return getRootTerm(name);
      })
      .filter(n => !!n)
      .filter(n => n !== '_children' && n !== '_blocks' && n !== '_auth');
    const uniqueResults = Array.from(new Set(results));
    return uniqueResults;
  }

  async function ListDomains() {
    return [dataSourceDomain];
  }

  async function CollectGarbage() {
    // create list of all blocks
    // for each doc
    //   remove all of Object.keys(r.blocks) from list of blocks
    // delete each block in the list
  }

  const GetStatus = () => ({
    ready: true,
    connected: true,
    migrated: true,
  });

  const close = () => {
    if (_blocks === null) {
      throw new Error(
        `Cannot close fs source "${id}" because it is already closed!`,
      );
    }
    console.log('Closing fs data source ' + id);
    _blocks = null;
    _blocksSize = null;
    _docs = null;
  };
  const observeDoc = async (domain, name) => {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`,
      );
    }
    const r = _getDoc(name);
    if (r.behavior) {
      return r.behavior;
    } else {
      const listDocName = getListDocName(name);
      if (typeof listDocName === 'string') {
        r.behavior = new BehaviorSubject({ value: undefined });
        ListDocs({ domain, parentName: listDocName })
          .then(docList => {
            r.behavior.next({ value: docList });
          })
          .catch(e => {
            console.error(e);
          });
        return r.behavior;
      }
      return (r.behavior = new BehaviorSubject(_renderDoc(r)));
    }
  };

  async function GetDocValue({ domain, name }) {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`,
      );
    }
    const listDocName = getListDocName(name);
    if (typeof listDocName === 'string') {
      const docNames = await ListDocs({ domain, parentName: listDocName });
      return { id: undefined, value: docNames };
    }

    const r = _getDoc(name);

    if (r.blocks[r.id] && _blocks[r.id] !== undefined) {
      return {
        id: r.id,
        value: _blocks[r.id],
      };
    }
    return {
      id: r.id,
      value: null,
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
    id,
  };
}
