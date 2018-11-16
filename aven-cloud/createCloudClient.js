import { default as withObs } from "@nozbe/with-observables";
import { Observable, BehaviorSubject } from "rxjs-compat";

import createCloudRef from "./createCloudRef";

export const withObservables = withObs;

const uniqueOrdered = items =>
  Array.from(new Set(items.sort((a, b) => a.name - b.name)));

export default function createCloudClient({ dataSource, domain }) {
  const _refs = {};
  const _objects = {};

  if (domain == null) {
    throw new Error(`domain must be provided to createCloudClient!`);
  }

  const knownRefs = new BehaviorSubject([]);

  const observeRefs = Observable.create(observer => {
    dataSource
      .dispatch({
        type: "ListRefs",
        domain
      })
      .then(refNames => {
        const refs = refNames.map(getRef);
        const mergedRefs = uniqueOrdered([...refs, ...knownRefs.value]);
        knownRefs.next(mergedRefs);
      })
      .catch(console.error);

    return () => {};
  })
    .multicast(() => knownRefs)
    .refCount();

  function getRef(name) {
    if (_refs[name]) {
      return _refs[name];
    }
    _refs[name] = createCloudRef({
      dataSource,
      domain,
      name,
      objectCache: _objects
    });
    knownRefs.next(uniqueOrdered([...knownRefs.value, _refs[name]]));
    return _refs[name];
  }

  async function destroyRef(ref) {
    await ref.destroy();
    knownRefs.next(knownRefs.value.filter(r => r.name !== ref.name));
  }

  return {
    ...dataSource,
    domain,
    destroyRef,
    getRef,
    observeRefs
  };
}
