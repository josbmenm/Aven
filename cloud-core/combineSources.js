import { Observable } from 'rxjs-compat';
import xs from 'xstream';
import createDispatcher from '../cloud-utils/createDispatcher';
import Err from '../utils/Err';

async function getStreamValue(obs) {
  await new Promise((resolve, reject) => {
    let hasResolved = false;
    setTimeout(() => {
      if (!hasResolved) {
        console.error('Timeout on stream value');
        reject(new Error('Observable timeout'));
      }
    }, 5000);
    let subs = obs.subscribe({
      next: val => {
        if (val === undefined) {
          return;
        }
        hasResolved = true;
        resolve(val);
        subs && subs.unsubscribe();
      },
      error: err => {
        reject(err);
        subs && subs.unsubscribe();
      },
      complete: () => {
        if (!hasResolved) {
          reject(new Error('Completed without resolution'));
        }
      },
    });
  });
}

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
        walkingMap = false;
        return;
      }
      if (typeof walkingMap === 'object') {
        walkingMap = walkingMap[localName];
        return;
      }
      walkingMap = true;
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
      const resp = await dispatchPutDocValue(fastSource);
      const { notifyDocWrite } = performObservation(domain, name);
      notifyDocWrite(resp.id, value);
      return resp;
    }
    dispatchPutDocValue(fastSource);
    const resp = await dispatchPutDocValue(slowSource);
    const { notifyDocWrite } = performObservation(domain, name);
    notifyDocWrite(resp.id, value);
    return resp;
  }

  async function PutBlock({ domain, auth, name, value, id }) {
    async function dispatchPutBlock(source) {
      return await source.dispatch({
        type: 'PutBlock',
        domain,
        auth,
        name,
        value,
        id,
      });
    }
    if (isFastOnly(domain, name)) {
      return await dispatchPutBlock(fastSource);
    }
    dispatchPutBlock(fastSource);
    return await dispatchPutBlock(slowSource);
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
    if (!id) {
      throw new Err('Invalid block id for "GetBlock"', 'InvalidBlockId', {
        domain,
        name,
        id,
      });
    }
    async function dispatchGetBlock(source) {
      return await source.dispatch({
        type: 'GetBlock',
        domain,
        auth,
        name,
        id,
      });
    }
    let blockFast = null;
    try {
      blockFast = await dispatchGetBlock(fastSource);
    } catch (e) {
      // block not available from the fast source..
    }
    if (blockFast) {
      return blockFast;
    }
    const blockSlow = await dispatchGetBlock(slowSource);

    fastSource
      .dispatch({
        type: 'PutBlock',
        domain,
        auth,
        name,
        id,
        value: blockSlow.value,
      })
      .catch(error => {
        console.error(
          `Failed to re-upload block ${id} of "${name}" from slow source to fast source`,
        );
        console.error(error);
      });

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
    // todo, check if currently subscribed to domain/name, and if so, respond immediately using the curernt id
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

  async function GetDocValue({ domain, name }) {
    // const obs = performObservation(domain, name).docObservable;
    // if (!obs) {
    //   throw new Error('cannot perform observation', domain, name, obs);
    // }
    // const val = await getStreamValue(obs);

    // todo, check if currently subscribed to domain/name, and if so, respond immediately using the curernt id and GetBlock
    const blockSlow = await slowSource.dispatch({
      type: 'GetDocValue',
      domain,
      name,
    });
    if (blockSlow.value !== undefined) {
      fastSource
        .dispatch({
          type: 'PutBlock',
          domain,
          name,
          id: blockSlow.id,
          value: blockSlow.value,
        })
        .catch(error => {
          console.error('Error uploading block to slow source.', error);
        });
    }
    return blockSlow;
  }

  async function GetDocValues({ domain, names }) {
    // todo, batch properly? Or maybe this is desirable because it will fetch some from fast and some from slow:
    const results = await Promise.all(
      names.map(async name => {
        return await GetDocValue({ domain, name });
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

  async function ListDocs({ domain, parentName, afterName }) {
    async function dispatchList(source) {
      return await source.dispatch({
        type: 'ListDocs',
        domain,
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

  async function DestroyDoc({ domain, name }) {
    async function dispatchDestroy(source) {
      return await source.dispatch({
        type: 'DestroyDoc',
        domain,
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

  async function MoveDoc({ domain, from, to }) {
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

  async function observeDoc(domain, name) {
    if (isFastOnly(domain, name)) {
      return fastSource.observeDoc(domain, name);
    }
    return performObservation(domain, name).docObservable;
  }

  const theCache = new Map();
  function getFromCache(args, onCacheFail) {
    let cachedValue = theCache;
    args.forEach(arg => {
      cachedValue = cachedValue && cachedValue.get(arg);
    });
    if (cachedValue) {
      return cachedValue;
    }
    const newValue = onCacheFail();
    let cache = theCache;
    args.forEach((arg, argIndex) => {
      const isLastArg = argIndex === args.length - 1;
      if (isLastArg) {
        cache.set(arg, newValue);
        return;
      }
      if (cache.has(arg)) {
        cache = cache.get(arg);
      } else {
        cache.set(arg, new Map());
        cache = cache.get(arg);
      }
    });
    return newValue;
  }

  function performObservation(domain, name) {
    return getFromCache([domain, name], () => {
      const performedObservation = {
        notifyDocWrite: (id, value) => {},
      };

      performedObservation.docObservable = new Observable(observer => {
        let lastSent = null;
        function notifyDocWrite(id, value) {
          if (lastSent === id) {
            return;
          }
          lastSent = id;
          observer.next({ id, value });
        }
        performedObservation.notifyDocWrite = notifyDocWrite;

        let fastSubs = null;
        let slowSubs = null;
        fastSource.observeDoc(domain, name).then(observable => {
          fastSubs = observable.subscribe({
            next: update => {
              notifyDocWrite(update.id, update.value);
            },
            error: () => {
              // should retry slowSource periodically, falling back to fast source
              console.error('Unhandled case 468');
            },
            complete: () => {
              // should retry slowSource periodically, falling back to fast source
              console.error('Unhandled case 469');
            },
          });
        });

        slowSource.observeDoc(domain, name).then(observable => {
          slowSubs = observable.subscribe({
            next: update => {
              notifyDocWrite(update.id, update.value);
            },
            error: () => {
              // should retry slowSource periodically, falling back to fast source
              console.error('Unhandled case 478');
            },
            complete: () => {
              // should retry slowSource periodically, falling back to fast source
              console.error('Unhandled case 479');
            },
          });
        });

        return () => {
          slowSubs && slowSubs.unsubscribe();
          fastSubs && fastSubs.unsubscribe();
        };
      }).shareReplay(1);

      return performedObservation;
    });
  }

  function observeDocChildren(domain, name) {
    if (isFastOnly(domain, name)) {
      return fastSource.observeDocChildren(domain, name);
    }
    return slowSource.observeDocChildren(domain, name);
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
        PutBlock,
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
