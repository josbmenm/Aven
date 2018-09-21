const HOST = 'http://localhost:3000';

const getWatchable = initialData => {
  const watchers = new Set();
  const watch = handler => {
    watchers.add(handler);
    const close = () => {
      watchers.delete(handler);
    };
    return { close };
  };
  const watchable = {
    value: initialData || {},
    watch,
  };
  const update = newVal => {
    if (newVal !== value) {
      watchable.value = newVal;
    }
    watchers.forEach(watcher => watcher(watchable.newVal));
  };
  return { update, watchable };
};

const createClientRefObject = (client, domain, ref, objectId) => {
  if (client.objects[objectId]) {
    return client.objects[objectId];
  }
  const defaultValue = {
    hasFetched: false,
    id: objectId,
    value: null,
  };
  const { update, watchable } = getWatchable(defaultValue);
  client.objects[objectId] = watchable;
  watchable.fetch = async () => {
    try {
      const result = await client.dispatch({
        type: 'getObject',
        domain,
        id: objectId,
      });
      update({
        ...watchable.value,
        id: result.id,
        hasFetched: true,
      });
    } catch (e) {
      console.error('Could not fetch object ' + objectId, e);
    }
    return watchable;
  };
  return watchable;
};

const createClientRef = (client, domain, ref) => {
  if (client.refs[ref]) {
    return client.refs[ref];
  }
  const defaultValue = {
    lastFetchTime: null,
    id: null,
    isListening: false, // can become true once we do websockets
  }
  const { update, watchable } = getWatchable(defaultValue);

  client.refs[ref] = watchable;
  watchable.fetch = async () => {
    try {
      const result = await client.dispatch({
        type: 'getRef',
        domain,
        ref,
      });
      update({
        ...watchable.value,
        id: result.id,
        lastFetchTime: Date.now()
      })
    } catch (e) {
      console.error('Could not fetch ref ' + ref, e);
      update({
        ...watchable.value,
        lastFetchTime = Date.now(),
      })
    }
    return watchable;
  };

  watchable.getObject = async () => {
    if (!watchable.value.id) {
      return null;
    }
    return createClientRefObject(client, domain, ref, watchable.value.id);
  };
  watchable.fetchObject = async () => {
    await watchable.fetch();
    if (!watchable.value.id) {
      return null;
    }
    const object = createClientRefObject(client, domain, ref, watchable.value.id);
    await object.fetch();
  };
  watchable.listen = async () => {
    if (!watchable.value.id && !watchable.value.lastFetchTime) {
      await watchable.fetchObject();
    }
    const remove = () => {}; // todo, actually do subscription
    return { remove };
  };
  return watchable;
};

const createDataClient = opts => {
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
    return await res.json();
  };
  const client = {
    refs: {},
    objects: {},
    dispatch,
  };
  return {
    getRef: ref => createClientRef(client, opts.domain, ref),
    getRefObject: (ref, objectId) =>
      createClientRefObject(client, opts.domain, ref, objectId),
  };
};

const DataClient = createDataClient({ host: HOST, domain: 'onofood.co' });

export const AirtableData = DataClient.getRef('airtable');
