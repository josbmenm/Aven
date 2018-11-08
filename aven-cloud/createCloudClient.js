import { default as withObs } from "@nozbe/with-observables";

import createCloudRef from "./createCloudRef";
import createCloudObject from "./createCloudObject";

export const withObservables = withObs;

export default function createCloudClient({ dataSource, domain }) {
  const _refs = {};
  const _objects = {};

  if (domain == null) {
    throw new Error(`domain must be provided to createCloudClient!`);
  }

  function getObject(objectId) {
    // todo pass in refName
    if (_objects[objectId]) {
      return _objects[objectId];
    }
    return (_objects[objectId] = createCloudObject({
      dataSource,
      objectId,
      domain
    }));
  }

  function createObject(value) {
    const o = createCloudObject({ domain, value });
    _objects[o.id] = o;
    return o;
  }

  function getRef(name) {
    if (_refs[name]) {
      return _refs[name];
    }
    return (_refs[name] = createCloudRef({ dataSource, domain, name }));
  }

  return {
    ...dataSource,
    domain,
    getRef,
    getObject,
    createObject
  };
}
