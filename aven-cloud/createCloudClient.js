import { default as withObs } from '@nozbe/with-observables';
import createDispatcher from '../aven-cloud-utils/createDispatcher';
import { Observable, BehaviorSubject } from 'rxjs-compat';

import { createRefPool } from './createCloudRef';

export const withObservables = withObs;

const uniqueOrdered = items =>
  Array.from(new Set(items.sort((a, b) => a.name - b.name)));

export default function createCloudClient({
  dataSource,
  domain,
  initialSession,
}) {
  const _objects = {};

  if (domain == null) {
    throw new Error(`domain must be provided to createCloudClient!`);
  }

  const session = new BehaviorSubject(initialSession || null);

  async function sessionDispatch(action) {
    return await dataSource.dispatch({
      ...action,
      domain,
      auth: session.value,
    });
  }

  async function sessionObserveRef(domain, name) {
    return await dataSource.observeRef(domain, name, session.value);
  }

  const dataSourceWithSession = {
    ...dataSource,
    observeRef: sessionObserveRef,
    dispatch: sessionDispatch,
  };

  const refs = createRefPool({
    onGetParentName: () => null,
    objectCache: _objects,
    dataSource: dataSourceWithSession,
    domain,
  });

  async function destroyRef(ref) {
    await ref.destroy();
    // knownRefs.next(knownRefs.value.filter(r => r.getName() !== ref.getName()));
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
    }
    return created;
  }

  async function CreateAnonymousSession() {
    if (session.value) {
      throw new Error('session already is set!');
    }
    const created = await dataSource.dispatch({
      type: 'CreateAnonymousSession',
      domain,
    });
    if (created && created.session) {
      session.next(created.session);
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

  const dispatch = createDispatcher(actions, sessionDispatch);

  return {
    ...dataSource,
    observeSession: session,
    CreateSession,
    CreateAnonymousSession,
    DestroySession,
    dispatch,
    domain,
    destroyRef,
    get: refs.get,
  };
}
