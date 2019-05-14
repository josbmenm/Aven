import { Observable } from 'rxjs-compat';
import xs from 'xstream';
import createDispatcher from '../cloud-utils/createDispatcher';

export default function combineSources({
  fastSource,
  slowSource,
  fastSourceOnlyMapping,
}) {
  const isConnected = Observable.of(false);

  function isFastOnly(domain, name) {
    if (!fastSourceOnlyMapping[domain]) {
      return false;
    }
    const domainMap = fastSourceOnlyMapping[domain];
    let walkingMap = domainMap;
    if (!name) {
      return false;
    }
    name.split('/').forEach(localName => {
      if (!walkingMap) {
        return false;
      }
      if (typeof walkingMap === 'object') {
        return walkingMap[localName];
      }
      return true;
    });
    return !!walkingMap;
  }

  async function PutDoc({ domain, auth, name, id }) {
    async function dispatchPutDoc(source) {
      return await source.dispatch({
        type: 'PutDoc',
        domain,
        auth,
        name,
        id,
      });
    }
    if (isFastOnly(domain, name)) {
      return await dispatchPutDoc(fastSource);
    }
    dispatchPutDoc(fastSource);
    return await dispatchPutDoc(slowSource);
  }
  async function PutDocValue({ domain, auth, name, value }) {
    async function dispatchPutDocValue(source) {
      return await source.dispatch({
        type: 'PutDocValue',
        domain,
        auth,
        name,
        value,
      });
    }
    if (isFastOnly(domain, name)) {
      return await dispatchPutDocValue(fastSource);
    }
    dispatchPutDocValue(fastSource);
    return await dispatchPutDocValue(slowSource);
  }
  async function PutTransactionValue({ domain, auth, name, value }) {
    async function dispatchPutTransactionValue(source) {
      return await source.dispatch({
        type: 'PutTransactionValue',
        domain,
        auth,
        name,
        value,
      });
    }
    if (isFastOnly(domain, name)) {
      return await dispatchPutTransactionValue(fastSource);
    }
    dispatchPutTransactionValue(fastSource);
    return await dispatchPutTransactionValue(slowSource);
  }
  async function PostDoc({ domain, auth, name, id, value }) {
    async function dispatchPostDoc(source) {
      return await source.dispatch({
        type: 'PostDoc',
        domain,
        auth,
        name,
        value,
        id,
      });
    }
    if (isFastOnly(domain, name)) {
      return await dispatchPostDoc(fastSource);
    }
    dispatchPostDoc(fastSource);
    return await dispatchPostDoc(slowSource);
  }
  async function GetBlock({ domain, auth, name, id }) {
    async function dispatchGetBlock(source) {
      return await source.dispatch({
        type: 'GetBlock',
        domain,
        auth,
        name,
        id,
      });
    }
    const blockFast = await dispatchGetBlock(fastSource);
    if (blockFast) {
      return blockFast;
    }
    const blockSlow = await dispatchGetBlock(slowSource);
    console.log('has slow block! Should go save this to fast source now, todo');
    return blockSlow;
  }
  async function GetBlocks({ domain, auth, name, ids }) {
    // todo, batch properly? Or maybe this is desirable because it will fetch some from fast and some from slow:
    const results = await Promise.all(
      ids.map(async id => {
        return await GetBlock({ domain, auth, name, id });
      }),
    );
    return { results };
  }
  async function GetDoc({ domain, auth, name }) {
    async function dispatchGetDoc(source) {
      return await source.dispatch({
        type: 'GetDoc',
        domain,
        auth,
        name,
      });
    }
    if (isFastOnly(domain, name)) {
      return await dispatchGetDoc(fastSource);
    }
    const slowDoc = await dispatchGetDoc(slowSource);
    console.log('has slow doc!', slowDoc);
    return slowDoc;
  }

  async function GetDocs({ domain, auth, names }) {
    const results = await Promise.all(
      names.map(async name => {
        return await GetDoc({ domain, auth, name });
      }),
    );
    return { results };
  }

  async function GetDocValue({ domain, auth, name }) {
    // todo, check if currently subscribed to domain/name, and if so, respond immediately using the curernt id and GetBlock
    async function dispatchGetDocValue(source) {
      return await source.dispatch({
        type: 'GetDocValue',
        domain,
        auth,
        name,
      });
    }

    const blockSlow = await dispatchGetDocValue(slowSource);
    console.log('has slow block! Should go save this to fast source now, todo');
    return blockSlow;
  }

  async function GetDocValues({ domain, auth, names }) {
    // todo, batch properly? Or maybe this is desirable because it will fetch some from fast and some from slow:
    const results = await Promise.all(
      names.map(async name => {
        return await GetDocValue({ domain, auth, name });
      }),
    );
    return { results };
  }
  async function GetStatus() {
    // Who even uses GetStatus, really?
    const f = await fastSource.dispatch({ type: 'GetStatus' });
    const s = await fastSource.dispatch({ type: 'GetStatus' });
    return {
      ready: f.ready && s.ready,
      fastSourceReady: f.ready,
      slowSoruceReady: s.ready,
    };
  }
  async function ListDomains() {
    async function dispatchListDomains(source) {
      return await source.dispatch({
        type: 'ListDomains',
      });
    }
    const all = await Promise.all([
      await dispatchListDomains(fastSource),
      await dispatchListDomains(slowSource),
    ]);
    const domainsWithDuplicates = all.flat();
    const domains = domainsWithDuplicates.filter(
      (v, i, self) => self.indexOf(v) === i,
    );
    return domains;
  }
  async function ListDocs({ domain, auth, parentName, afterName }) {
    async function dispatchList(source) {
      return await source.dispatch({
        type: 'ListDocs',
        domain,
        auth,
        parentName,
        afterName,
      });
    }
    // todo, list of slow source should surface fast-only-mapped items
    if (isFastOnly(domain, parentName)) {
      return await dispatchList(fastSource);
    }
    return await dispatchList(slowSource);
  }
  async function DestroyDoc({ domain, auth, name }) {
    async function dispatchDestroy(source) {
      return await source.dispatch({
        type: 'DestroyDoc',
        domain,
        auth,
        name,
      });
    }
    if (isFastOnly(domain, name)) {
      return await dispatchDestroy(fastSource);
    }
    await Promise.all([
      dispatchDestroy(fastSource),
      dispatchDestroy(slowSource),
    ]);
  }
  async function CollectGarbage() {
    async function dispatchCollectGarbage(source) {
      return await source.dispatch({
        type: 'CollectGarbage',
      });
    }
    await Promise.all([
      dispatchCollectGarbage(fastSource),
      dispatchCollectGarbage(slowSource),
    ]);
  }
  async function MoveDoc({ domain, auth, from, to }) {
    const isFromFastStorage = isFastOnly(domain, from);
    const isToFastStorage = isFastOnly(domain, to);
    if (isFromFastStorage !== isToFastStorage) {
      throw new Error(
        'combineSources is attempting to copy data between the fast source and slow source. Not yet supported',
      );
    }
    async function dispatchMoveDoc(source) {
      return await source.dispatch({
        type: 'MoveDoc',
        domain,
        auth,
        from,
        to,
      });
    }
    if (isFromFastStorage && isToFastStorage) {
      return await dispatchMoveDoc(fastSource);
    }
    await Promise.all([
      dispatchMoveDoc(fastSource),
      dispatchMoveDoc(slowSource),
    ]);
  }

  const sourceId = `combined(fast:${fastSource.id})(slow:${slowSource.id})`;

  async function close() {
    await fastSource.close();
    await slowSource.close();
  }

  function observeDoc(domain, name, auth) {
    if (isFastOnly(domain, name)) {
      return fastSource.observeDoc(domain, name, auth);
    }
    return slowSource.observeDoc(domain, name, auth);
  }

  function observeDocChildren(domain, name, auth) {
    if (isFastOnly(domain, name)) {
      return fastSource.observeDocChildren(domain, name, auth);
    }
    return slowSource.observeDocChildren(domain, name, auth);
  }

  function getDocStream() {}

  function getDocChildrenEventStream() {}

  const isConnectedStream = xs.createWithMemory(false);

  async function combinedDispatch(action) {
    return await slowSource.dispatch(action);
  }

  const combinedSource = {
    isConnected,
    close,
    observeDoc,
    observeDocChildren,
    getDocStream,
    getDocChildrenEventStream,
    isConnectedStream,
    dispatch: createDispatcher(
      {
        PutDoc,
        PutDocValue,
        PutTransactionValue,
        PostDoc,
        GetBlock,
        GetBlocks,
        GetDoc,
        GetDocs,
        GetDocValue,
        GetDocValues,
        GetStatus,
        ListDomains,
        ListDocs,
        DestroyDoc,
        CollectGarbage,
        MoveDoc,
      },
      combinedDispatch,
      null,
      sourceId,
    ),
    id: sourceId,
  };
  return combinedSource;
}
