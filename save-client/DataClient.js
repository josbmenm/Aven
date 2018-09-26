import React from 'react';
import { Buffer } from 'buffer';

const tryAsync = promise => (...args) => {
  promise(...args)
    .then(() => {})
    .catch(err => {
      console.error(err);
    });
};

export const connectComponent = DataComponent => {
  const dataComponentName = DataComponent.displayName || 'Component';
  class DataConnectedComponent extends React.Component {
    static displayName = `Connected(${dataComponentName})`;
    _subscriptions = {};
    _subscriptionUpdate = () => {
      this.forceUpdate();
    };
    _updateSubscription = async (propName, prop, lastProp) => {
      if (prop === lastProp) {
        return;
      }
      this._unsubscribe(propName);
      if (!prop || !prop.watch) {
        return;
      }
      this._subscriptions[propName] = prop.watch(this._subscriptionUpdate);
    };
    _unsubscribe = propName => {
      const subscriptions = this._subscriptions;
      if (subscriptions[propName]) {
        subscriptions[propName].close();
        subscriptions[propName] = null;
      }
    };
    componentDidMount() {
      Object.keys(this.props).forEach(propName => {
        const prop = this.props[propName];
        this._updateSubscription(propName, prop)
          .then(() => {})
          .catch(err => {
            console.error('Error subscribing to "' + propName + '":', err);
          });
      });
    }
    componentDidUpdate(lastProps) {
      const allPropNames = new Set();
      Object.keys(this.props).forEach(propName => allPropNames.add(propName));
      Object.keys(lastProps).forEach(propName => allPropNames.add(propName));
      allPropNames.forEach(propName => {
        const prop = this.props[propName];
        const lastProp = lastProps[propName];
        this._updateSubscription(propName, prop, lastProp)
          .then(() => {})
          .catch(err => {
            console.error('Error subscribing to "' + propName + '":');
            console.error(err);
          });
      });
    }
    componentWillUnmount() {
      Object.keys(this._subscriptions).forEach(subName =>
        this._unsubscribe(subName),
      );
    }
    render() {
      return <DataComponent {...this.props} />;
    }
  }
  return DataConnectedComponent;
};

const getWatchable = initialData => {
  const watchers = new Set();
  const watch = handler => {
    watchers.add(handler);
    const close = () => {
      watchers.delete(handler);
    };
    return { close };
  };
  let value = initialData;
  const watchable = {
    getValue: () => value,
    watch,
  };
  const update = newVal => {
    if (newVal !== value) {
      value = newVal;
    }
    watchers.forEach(watcher => watcher());
  };
  const getSubscriberCount = () => watchers.size;
  return { update, watchable, getSubscriberCount };
};

const DC = {};

DC.createClientRefObject = (client, domain, ref, objectId) => {
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

DC.createClientRef = (client, domain, refName) => {
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
    return DC.createClientRefObject(client, domain, refName, id);
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

DC.putObject = async (client, domain, objVal) => {
  const res = await client.dispatch({
    type: 'putObject',
    value: objVal,
  });
  return res;
};

DC.createDataClient = opts => {
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

    if (res.status === 500) {
      console.log(await res.text());
    }
    console.log(res.status, res);
    const result = await res.json();
    console.log('Successful Network Dispatch:', action, result);
    return result;
  };
  const client = {
    refs: {},
    objects: {},
    dispatch,
  };
  return {
    dispatch,
    getRef: ref => DC.createClientRef(client, opts.domain, ref),
    getRefObject: (ref, objectId) =>
      DC.createClientRefObject(client, opts.domain, ref, objectId),
    putObject: objVal => DC.putObject(client, opts.domain, objVal),
  };
};

const HOST = 'https://api.onofood.co';
// const HOST = 'http://localhost:3000';

export const OnoClient = DC.createDataClient({
  host: HOST,
  domain: 'onofood.co',
});

const watchAirtableData = getWatchable(null);

const getAirtableData = async () => {
  const atRef = OnoClient.getRef('airtable');
  await atRef.fetchObject();
  const folderObj = atRef.getObjectValue();
  const dbId = folderObj.value.files['db.json'].id;
  const dbObj = OnoClient.getRefObject('airtable', dbId);
  await dbObj.fetch();
  const atData = JSON.parse(Buffer.from(dbObj.getValue().value.data, 'hex'));
  return atData;
};
getAirtableData()
  .then(data => {
    watchAirtableData.update(data);
  })
  .catch(console.error);

export const AirtableData = watchAirtableData.watchable;

export const writeRef = async (refName, transactionFn) => {
  const ref = OnoClient.getRef(refName);
  await ref.fetchObject();
  const prevObject = ref.getObjectValue();
  const nextVal = transactionFn(prevObject.value);
  const putResult = await OnoClient.putObject(nextVal);
  const nextId = putResult.id;
  await ref.putObjectId(nextId);
  await ref.fetchObject();
  console.log('writeRef done:', ref.getObjectValue());
};
