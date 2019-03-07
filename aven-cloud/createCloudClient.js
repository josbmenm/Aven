import { default as withObs } from '@nozbe/with-observables';
import createDispatcher from '../aven-cloud-utils/createDispatcher';
import mapBehaviorSubject from '../aven-cloud-utils/mapBehaviorSubject';
import getIdOfValue from '../aven-cloud-utils/getIdOfValue';
import { BehaviorSubject } from 'rxjs-compat';

import { createDocPool } from './createCloudDoc';

export const withObservables = withObs;

export default function createCloudClient({
  dataSource,
  domain,
  initialSession = null,
  onSession,
}) {
  const _blockValues = {};

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
      onSession && onSession(created.session);
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
      onSession && onSession(created.session);
    }
    return created;
  }

  async function DestroySession() {
    if (!session.value) {
      throw new Error('no session found!');
    }
    session.next(null);
    onSession && onSession(null);
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
        domain: actionDomain,
        name,
        id,
      });
    if (actionDomain !== domain) {
      return await defaultAction();
    }
    const doc = docs.get(name);
    const block = doc.getBlock(id);
    return block && block.serialize();
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
    const value = await doc.fetchValue();
    return { id: getIdOfValue(value), domain, name };
  }
  async function GetDocValue({ domain: actionDomain, name }) {
    const defaultAction = () =>
      dataSource.dispatch({
        type: 'GetDocValue',
        domain: actionDomain,
        name,
      });
    if (actionDomain !== domain) {
      return await defaultAction();
    }
    const doc = docs.get(name);
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

  const _lambdas = {};

  const getLambda = name => {
    return _lambdas[name];
  };
  const setLambda = (name, fn) => {
    _lambdas[name] = fn;
  };

  async function setAccountName(name) {
    if (!session.value) {
      throw new Error('Session is required to set account name.');
    }
    const response = await sessionDispatch({
      type: 'SetAccountName',
      name,
    });
    return response;
  }

  const cloudClient = {
    ...dataSource,
    getLambda,
    setLambda,
    observeSession: session,
    CreateSession,
    CreateAnonymousSession,
    DestroySession,
    dispatch,
    domain,
    destroyDoc,
    setAccountName,
  };

  const docs = createDocPool({
    parentName: new BehaviorSubject(null),
    blockValueCache: _blockValues,
    dataSource: dataSourceWithSession,
    domain,
    cloudClient,
    onGetSelf: () => cloudClient,
  });
  cloudClient.get = docs.get;

  cloudClient.observeUserDoc = mapBehaviorSubject(session, value => {
    if (value && value.accountId) {
      const doc = docs.get(`@${value.accountId}`);
      return doc;
    } else {
      return null;
    }
  });

  return cloudClient;
}
