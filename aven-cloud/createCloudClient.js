import { default as withObs } from '@nozbe/with-observables';
import createDispatcher from '../aven-cloud-utils/createDispatcher';
import { Observable, BehaviorSubject } from 'rxjs-compat';

import createCloudRef from './createCloudRef';

export const withObservables = withObs;

const uniqueOrdered = items =>
  Array.from(new Set(items.sort((a, b) => a.name - b.name)));

export default function createCloudClient({
  dataSource,
  domain,
  initialSession,
}) {
  const _refs = {};
  const _objects = {};

  if (domain == null) {
    throw new Error(`domain must be provided to createCloudClient!`);
  }

  const knownRefs = new BehaviorSubject([]);

  const session = new BehaviorSubject(initialSession || null);

  const dataSourceWithSession = {
    ...dataSource,
    dispatch: async action => {
      return await dataSource.dispatch({
        ...action,
        auth: session.value,
      });
    },
  };

  function updateRefsList() {
    dataSourceWithSession
      .dispatch({
        type: 'ListRefs',
        domain,
      })
      .then(refNames => {
        const refs = refNames.map(getRef);
        const mergedRefs = uniqueOrdered([...refs, ...knownRefs.value]);
        knownRefs.next(mergedRefs);
      })
      .catch(console.error);
  }

  let isObservingRefs = false;

  function updateRefsListIfObserving() {
    if (isObservingRefs) {
      updateRefsList();
    }
  }

  const observeRefs = Observable.create(() => {
    isObservingRefs = true;
    updateRefsList();
    return () => {
      isObservingRefs = false;
    };
  })
    .multicast(() => knownRefs)
    .refCount();

  function getRef(name) {
    if (_refs[name]) {
      return _refs[name];
    }
    _refs[name] = createCloudRef({
      dataSource: dataSourceWithSession,
      domain,
      name,
      objectCache: _objects,
    });
    knownRefs.next(uniqueOrdered([...knownRefs.value, _refs[name]]));
    return _refs[name];
  }

  async function destroyRef(ref) {
    await ref.destroy();
    knownRefs.next(knownRefs.value.filter(r => r.name !== ref.name));
  }

  async function CreateSession({
    verificationInfo,
    verificationResponse,
    accountId,
  }) {
    if (session.value) {
      throw new Error('session already is set!');
    }
    const created = await dataSource.dispatch({
      type: 'CreateSession',
      domain,
      accountId,
      verificationResponse,
      verificationInfo,
    });
    if (created && created.session) {
      session.next(created.session);
      updateRefsListIfObserving();
    }
    return created;
  }

  async function DestroySession() {
    if (!session.value) {
      throw new Error('no session found!');
    }
    session.next(null);
    await dataSource.dispatch({
      type: 'DestroySession',
      domain,
      auth: session.value,
    });
  }

  const actions = {
    CreateSession,
  };

  const dispatch = createDispatcher(actions, dataSource.dispatch);

  return {
    ...dataSource,
    observeSession: session,
    CreateSession,
    DestroySession,
    dispatch,
    domain,
    destroyRef,
    getRef,
    observeRefs,
  };
}
