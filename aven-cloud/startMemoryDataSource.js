import { BehaviorSubject } from 'rxjs-compat';
import createGenericDataSource from './createGenericDataSource';
import getIdOfValue from '../aven-cloud-utils/getIdOfValue';

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
    if (typeof blockId !== 'string') {
      console.error(blockId);
      throw new Error(`Block ID is not valid ${blockId}`);
    }
    if (_blocks[blockId] === undefined) {
      throw new Error(`Block ID "${blockId}" was not found`);
    }
    return _blocks[blockId];
  }

  async function getAllBlockIds() {
    return Object.keys(_blocks);
  }

  async function commitBlock(value) {
    const id = getIdOfValue(value);
    if (!_blocks[id]) {
      _blocks[id] = value;
    }
    return { id };
  }

  async function commitBlockId(id) {
    if (id == null || _blocks[id] === undefined) {
      throw new Error(`Cannot find block with id "${id}"`);
    }
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
    commitBlockId,
    commitDoc,
    commitDocDestroy,
    commitDocMove,

    isConnected,
  });
}
