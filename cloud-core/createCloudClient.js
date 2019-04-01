import { default as withObs } from '@nozbe/with-observables';
import createDispatcher from '../cloud-utils/createDispatcher';
import mapBehaviorSubject from '../cloud-utils/mapBehaviorSubject';
import getIdOfValue from '../cloud-utils/getIdOfValue';
import { BehaviorSubject } from 'rxjs-compat';

import { createDocPool } from './createCloudDoc';

export const withObservables = withObs;

export default function createCloudClient({
  source,
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
    return await source.dispatch({
      ...action,
      domain,
      auth: session.value,
    });
  }

  async function sessionObserveDoc(domain, name) {
    return await source.observeDoc(domain, name, session.value);
  }

  const sourceWithSession = {
    ...source,
    observeDoc: sessionObserveDoc,
    dispatch: sessionDispatch,
  };

  async function destroyDoc(doc) {
    await doc.destroy();
  }

  async function createSession({
    verificationInfo,
    verificationResponse,
    accountId,
  }) {
    if (session.value) {
      throw new Error('session already is set!');
    }
    const created = await source.dispatch({
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

  async function createAnonymousSession() {
    if (session.value) {
      throw new Error('session already is set!');
    }
    const created = await source.dispatch({
      type: 'CreateAnonymousSession',
      domain,
    });
    if (created && created.session) {
      session.next(created.session);
      onSession && onSession(created.session);
    }
    return created;
  }

  async function destroySession() {
    if (!session.value) {
      throw new Error('no session found!');
    }
    session.next(null);
    onSession && onSession(null);
    await source.dispatch({
      type: 'DestroySession',
      domain,
      auth: session.value,
    });
  }

  async function GetBlock({ domain: actionDomain, name, id }) {
    const defaultAction = () =>
      source.dispatch({
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
    await block.fetchValue();
    return block && block.serialize();
  }

  async function GetDoc({ domain: actionDomain, name }) {
    const defaultAction = () =>
      source.dispatch({
        type: 'GetDoc',
        actionDomain,
        name,
      });
    if (actionDomain !== domain) {
      return await defaultAction();
    }
    const doc = docs.get(name);
    const value = await doc.fetchValue();
    return {
      id: value === undefined ? undefined : getIdOfValue(value),
      domain,
      name,
    };
  }
  async function GetDocValue({ domain: actionDomain, name }) {
    const defaultAction = () =>
      source.dispatch({
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
    const id = doc.getId();
    return { value, id };
  }

  const actions = {
    CreateSession: createSession,
    CreateAnonymousSession: createAnonymousSession,
    DestroySession: destroySession,
    GetBlock,
    GetDoc,
    GetDocValue,
  };

  const dispatch = createDispatcher(actions, sessionDispatch, domain);

  const setLambda = (name, fn) => {
    docs.get(name).$setOverrideFunction(fn);
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
    ...source,
    setLambda,
    observeSession: session,
    createSession,
    createAnonymousSession,
    destroySession,
    dispatch,
    domain,
    destroyDoc,
    setAccountName,
  };

  const docs = createDocPool({
    parentName: new BehaviorSubject(null),
    blockValueCache: _blockValues,
    source: sourceWithSession,
    domain,
    cloudClient,
    onGetSelf: () => cloudClient,
  });
  cloudClient.get = docs.get;
  cloudClient.observeDocChildren = source.observeDocChildren;

  cloudClient.observeChildren = docs.observeChildren;
  // cloudClient.observeChildren = (observeDomain, name) => {
  //   if (observeDomain !== undefined && observeDomain !== domain) {
  //     throw new Error('Cannot observe different domain on a client');
  //   }
  //   let listener = docs.observeDocChildren;
  //   if (name != null) {
  //     listener = docs.get(name).observeDocChildren;
  //   }
  //   return listener;
  // };

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
