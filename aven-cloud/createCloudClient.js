import { default as withObs } from '@nozbe/with-observables';
import createDispatcher from '../aven-cloud-utils/createDispatcher';
import getIdOfValue from '../aven-cloud-utils/getIdOfValue';
import { Observable, BehaviorSubject } from 'rxjs-compat';

import { createDocPool } from './createCloudDoc';

export const withObservables = withObs;

const uniqueOrdered = items =>
  Array.from(new Set(items.sort((a, b) => a.name - b.name)));

export default function createCloudClient({
  dataSource,
  domain,
  initialSession,
  onDocMiss,
}) {
  const _blocks = {};

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

  async function sessionObserveDoc(domain, name) {
    return await dataSource.observeDoc(domain, name, session.value);
  }

  const dataSourceWithSession = {
    ...dataSource,
    observeDoc: sessionObserveDoc,
    dispatch: sessionDispatch,
  };

  async function destroyDoc(doc) {
    await doc.destroy();
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

  async function GetBlock({ domain: actionDomain, name, id }) {
    const defaultAction = () =>
      dataSource.dispatch({
        type: 'GetBlock',
        actionDomain,
        name,
        id,
      });
    if (actionDomain !== domain) {
      return await defaultAction();
    }
    if (_blocks[id]) {
      try {
        return _blocks[id].getReference();
      } catch (e) {
        return await defaultAction;
      }
    }
    return await defaultAction();
  }
  async function GetDoc({ domain: actionDomain, name }) {
    const defaultAction = () =>
      dataSource.dispatch({
        type: 'GetDoc',
        actionDomain,
        name,
      });
    if (actionDomain !== domain) {
      return await defaultAction();
    }
    const doc = docs.get(name);
    await doc.fetch();
    return { id: doc.getBlock().id, domain, name };
  }
  async function GetDocValue({ domain: actionDomain, name }) {
    const defaultAction = () =>
      dataSource.dispatch({
        type: 'GetDocValue',
        actionDomain,
        name,
      });
    if (actionDomain !== domain) {
      return await defaultAction();
    }
    const doc = docs.get(name);
    console.log('GEtting doc value!', name);
    await doc.fetchValue();
    const value = doc.getValue();
    const id = getIdOfValue(value);
    return { value, id };
  }

  const actions = {
    CreateSession,
    CreateAnonymousSession,
    DestroySession,
    GetBlock,
    GetDoc,
    GetDocValue,
  };

  const dispatch = createDispatcher(actions, sessionDispatch, domain);

  const cloudClient = {
    ...dataSource,
    observeSession: session,
    CreateSession,
    CreateAnonymousSession,
    DestroySession,
    dispatch,
    domain,
    destroyDoc,
  };

  const docs = createDocPool({
    onGetParentName: () => null,
    blockCache: _blocks,
    dataSource: dataSourceWithSession,
    onDocMiss,
    domain,
    cloudClient,
    onGetSelf: () => cloudClient,
  });
  cloudClient.get = docs.get;

  return cloudClient;
}
