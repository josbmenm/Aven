const composeDataSources = sources => {
  async function putRef({ domain, ref, objectId, owner }) {}

  async function getObject({ id }) {
    // if (_objects[id]) {
    //   return {
    //     id,
    //     object: _objects[id]
    //   };
    // }
    return null;
  }
  async function putObject({ object }) {
    return { id };
  }
  async function getRef({ domain, ref }) {
    // if (r) {
    //   return { id: r.id, ref, domain, owner: r.owner, isPublic: r.isPublic };
    // }
    return null;
  }

  const close = async () => {
    await Promise.all(sources.map(async source => await source.close()));
  };

  const observeRef = (domain, refName) => {
    return Observable.create(observer => {});
  };

  const getStatus = () => ({
    ready: true,
    connected: true,
    migrated: true
  });
  const actions = {
    putRef,
    putObject,
    getObject,
    getRef,
    getStatus
  };

  return {
    close,
    observeRef,
    actions
  };
};

export default composeDataSources;
