import { getWatchable } from './Watchable';

const tryAsync = promise => (...args) => {
  promise(...args)
    .then(() => {})
    .catch(err => {
      console.error(err);
    });
};

const SaveClient = {};

SaveClient.createClientRefObject = (client, domain, ref, objectId) => {
  if (client.objects[objectId]) {
    return client.objects[objectId];
  }
  const defaultValue = {
    hasFetched: false,
    id: objectId,
    value: null,
    _name: `object-${objectId}`,
    _type: 'object',
  };
  const objWatchable = getWatchable(defaultValue);
  const obj = objWatchable.watchable;
  client.objects[objectId] = obj;
  obj.fetch = async () => {
    if (obj.getValue().value !== null) {
      // Objects are immutable. Once set, we believe it to be accurate and never change.
      return;
    }
    try {
      const result = await client.dispatch({
        type: 'getObject',
        domain,
        id: objectId,
      });
      objWatchable.update({
        ...obj.getValue(),
        value: result.object,
        id: result.id,
        hasFetched: true,
      });
    } catch (e) {
      console.error('Could not fetch object ' + objectId, e);
    }
    return;
  };
  return obj;
};

const rewatch = (ref, mapFn, runWatchedUpdate) => {
  let value = null;
  const rewatched = { getValue: () => value };
  rewatched.watch = handler => {
    (async () => {
      await runWatchedUpdate();
      value = mapFn();
    })()
      .then(() => {})
      .catch(console.error);
    return ref.watch(() => {
      (async () => {
        await runWatchedUpdate();
        value = mapFn();
        await handler();
      })()
        .then(() => {})
        .catch(console.error);
    });
  };
  return rewatched;
};

SaveClient.createClientRef = (client, domain, refName) => {
  if (client.refs[refName]) {
    return client.refs[refName];
  }
  const defaultValue = {
    name: refName,
    lastFetchTime: null,
    id: null,
    hasFetched: false,
    isPutting: false,
    _type: 'ref',
    isListening: false, // can become true once we do websockets
  };
  const refWatch = getWatchable(defaultValue);
  const ref = refWatch.watchable;
  ref._name = refName;

  const updateServerValue = tryAsync(async () => {
    const result = await client.dispatch({
      type: 'getRef',
      domain,
      ref: refName,
    });
    if (!ref.getValue() || ref.getValue().id !== result.id) {
      refWatch.update({
        ...ref.getValue(),
        lastFetchTime: Date.now(),
        hasFetched: true,
        id: result.id,
      });
    }
  });

  let pollingInterval = null;
  const startListening = () => {
    if (ref.getValue().isListening) {
      return;
    }
    refWatch.update({
      ...ref.getValue(),
      isListening: true,
    });
    updateServerValue();
    pollingInterval = setInterval(() => {
      updateServerValue();
    }, 20000);
  };
  const stopListening = () => {
    refWatch.update({
      ...ref.getValue(),
      isListening: false,
    });
    clearInterval(pollingInterval);
  };

  client.refs[refName] = ref;
  const watchUpstream = ref.watch;

  ref.fetch = async () => {
    if (ref.getValue().isListening && ref.getValue().lastFetchTime) {
      return ref;
    }
    startListening();
    return await new Promise((resolve, reject) => {
      let timeout = setTimeout(() => {
        reject(new Error('Ref fetch timeout!'));
      }, 3000);
      const subscription = ref.watch(() => {
        if (ref.getValue().lastFetchTime) {
          subscription.close();
          clearTimeout(timeout);
          resolve(ref);
        }
      });
    });
  };

  ref.getObject = () => {
    const refValue = ref.getValue();
    const id = refValue && refValue.id;
    if (!id) {
      return null;
    }
    return SaveClient.createClientRefObject(client, domain, refName, id);
  };

  ref.getObjectValue = () => {
    const obj = ref.getObject();
    if (!obj) {
      return null;
    }
    return obj.getValue();
  };

  ref.putObjectId = async id => {
    const lastId = ref.getValue().id;
    try {
      refWatch.update({
        ...ref.getValue(),
        id,
        isPutting: true,
      });
      await client.dispatch({
        type: 'putRef',
        domain,
        objectId: id,
        ref: refName,
      });
      refWatch.update({
        ...ref.getValue(),
        isPutting: false,
      });
    } catch (e) {
      refWatch.update({
        ...ref.getValue(),
        id: lastId,
        isPutting: false,
      });
      console.error(e);
    }
  };

  ref.fetchObject = async () => {
    await ref.fetch();
    if (!ref.getValue().id) {
      return;
    }
    const obj = await ref.getObject();
    await obj.fetch();
  };
  ref.watch = handler => {
    const upstreamHandler = data => {
      handler(data);
    };
    const upstreamSubscription = watchUpstream(upstreamHandler);
    startListening();
    const close = async () => {
      await upstreamSubscription.close();
      if (refWatch.getSubscriberCount() === 0) {
        stopListening();
      }
    };
    return { close };
  };
  ref.watchObject = () => {
    return rewatch(
      ref,
      () => {
        return ref.getObjectValue();
      },
      async () => {
        await ref.fetchObject();
      },
    );
  };
  return ref;
};

SaveClient.putObject = async (client, domain, objVal) => {
  const res = await client.dispatch({
    type: 'putObject',
    value: objVal,
  });
  return res;
};

SaveClient.createDataClient = opts => {
  const endpoint = `${opts.host}/dispatch`;
  const dispatch = async action => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action),
    });

    if (res.status >= 400) {
      throw new Error(await res.text());
    }
    const result = await res.json();
    // console.log('Successful Network Dispatch:', action, result);
    return result;
  };
  const client = {
    refs: {},
    objects: {},
    dispatch,
  };

  const getRef = ref => SaveClient.createClientRef(client, opts.domain, ref);

  const getRefObject = (ref, objectId) =>
    SaveClient.createClientRefObject(client, opts.domain, ref, objectId);

  const putObject = objVal => SaveClient.putObject(client, opts.domain, objVal);

  const writeRef = async (refName, transactionFn) => {
    const ref = getRef(refName);
    await ref.fetchObject();
    const prevObject = ref.getObjectValue();
    const nextVal = transactionFn(prevObject.value);
    const putResult = await putObject(nextVal);
    const nextId = putResult.id;
    await ref.putObjectId(nextId);
    await ref.fetchObject();
    console.log('writeRef done:', ref.getObjectValue());
  };

  return {
    dispatch,
    getRef,
    getRefObject,
    putObject,
    writeRef,
  };
};

export default SaveClient;
