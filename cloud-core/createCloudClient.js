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

  async function sessionObserveDoc(obsDomain, name) {
    return await source.observeDoc(obsDomain, name, session.value);
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

  async function establishAnonymousSession() {
    if (session.value) {
      return;
    }
    return await createAnonymousSession();
  }

  async function destroySession() {
    if (!session.value) {
      throw new Error('no session found!');
    }
    await source.dispatch({
      type: 'DestroySession',
      domain,
      auth: session.value,
    });
    session.next(null);
    onSession && onSession(null);
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
    const context = doc.getContext();
    const id = await doc.getId();
    return { value, id, context };
  }

  async function PutDocValue({ domain: actionDomain, name, value }) {
    const defaultAction = () =>
      source.dispatch({
        type: 'PutDocValue',
        domain: actionDomain,
        name,
        value,
      });
    if (actionDomain !== domain) {
      return await defaultAction();
    }
    const doc = docs.get(name);
    await doc.put(value);
    const id = await doc.getId();
    return { id, name, domain };
  }

  const actions = {
    CreateSession: createSession,
    CreateAnonymousSession: createAnonymousSession,
    DestroySession: destroySession,
    GetBlock,
    GetDoc,
    GetDocValue,
    PutDocValue,
  };

  const dispatch = createDispatcher(actions, sessionDispatch, domain);

  // #deprecate-old-lambda
  const setLambda = (name, fn) => {
    docs.get(name).$setOverrideFunction(fn);
  };

  function lazyDefineCloudFunction(cloudFn) {
    if (cloudFn.type !== 'CloudFunction') {
      throw new Error(
        'Invalid function provided to lazyDefineCloudFunction. Create it with defineCloudFunction',
      );
    }
    docs.get(cloudFn.name)._defineCloudFunction(cloudFn);
  }

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

  async function internalObserveDoc(obsDomain, name, auth) {
    if (obsDomain !== domain) {
      return await source.observeDoc(obsDomain, name, session.value);
    }

    const doc = docs.get(name);
    return doc.observeValueAndId.map(r => {
      return { id: r.getId(), value: r.value };
    });
  }

  async function internalObserveDocChildren(obsDomain, name, auth) {
    if (obsDomain !== domain) {
      return await source.observeDocChildren(obsDomain, name, session.value);
    }

    throw new Error('Not ready for this!');
    // const doc = docs.get(name);
    // return doc.observeChildren;
  }

  const cloudClient = {
    ...source,
    observeDoc: internalObserveDoc,
    observeDocChildren: internalObserveDocChildren,
    setLambda,
    observeSession: session,
    createSession,
    createAnonymousSession,
    establishAnonymousSession,
    destroySession,
    dispatch,
    domain,
    destroyDoc,
    setAccountName,
    lazyDefineCloudFunction,
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
