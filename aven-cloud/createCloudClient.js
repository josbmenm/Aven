import { default as withObs } from "@nozbe/with-observables";

import createCloudRef from "./createCloudRef";

export const withObservables = withObs;

export default function createCloudClient({ dataSource, domain }) {
  const _refs = {};
  const _objects = {};

  if (domain == null) {
    throw new Error(`domain must be provided to createCloudClient!`);
  }

  function getRef(name) {
    if (_refs[name]) {
      return _refs[name];
    }
    return (_refs[name] = createCloudRef({
      dataSource,
      domain,
      name,
      objectCache: _objects
    }));
  }

  return {
    ...dataSource,
    domain,
    getRef
  };
}
