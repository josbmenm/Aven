import { BehaviorSubject } from 'rxjs-compat';
import createGenericDataSource from './createGenericDataSource';

const crypto = require('crypto');
const stringify = require('json-stable-stringify');

export default function startMemoryDataSource(opts = {}) {
  const dataSourceDomain = opts.domain;

  if (!dataSourceDomain) {
    throw new Error(
      'Cannot start a memory data source without specifying a domain'
    );
  }

  const _blocks = {};

  const docState = { children: {}, childrenSet: new Set() };

  const isConnected = new BehaviorSubject(true);

  async function getBlock(blockId) {
    if (_blocks[blockId] === undefined) {
      throw new Error(`Block ID "${blockId}" was not found`);
    }
    return _blocks[blockId];
  }

  async function getAllBlockIds() {
    return Object.keys(_blocks);
  }

  async function commitBlock(value) {
    const blockData = stringify(value);
    const sha = crypto.createHash('sha1');
    sha.update(blockData);
    const id = sha.digest('hex');
    if (!_blocks[id]) {
      _blocks[id] = value;
    }
    return { id };
  }

  async function commitDoc(name, id) {}

  async function commitDocDestroy(name) {}

  async function commitDocMove(name, newName) {}

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
