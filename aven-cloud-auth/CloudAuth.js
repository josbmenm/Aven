import { uuid, checksum } from '../aven-cloud-utils/Crypto';
import createDispatcher from '../aven-cloud-utils/createDispatcher';
import { getAuthRefName } from '../aven-cloud-utils/RefNaming';
function thanksVeryMuch(dispatch) {
  return async action => {
    const resp = await dispatch(action);
    // console.log("thanks ", action, "very much", resp);
    return resp;
  };
}
async function writeObj(dataSource, domain, name, value) {
  const obj = await thanksVeryMuch(dataSource.dispatch)({
    type: 'PutObject',
    domain,
    value,
    name,
  });
  await thanksVeryMuch(dataSource.dispatch)({
    type: 'PutRef',
    domain,
    id: obj.id,
    name,
  });
}

async function getObj(dataSource, domain, name) {
  const r = await thanksVeryMuch(dataSource.dispatch)({
    domain,
    type: 'GetRef',
    name,
  });
  if (!r || !r.id) {
    return null;
  }

  const o = await thanksVeryMuch(dataSource.dispatch)({
    type: 'GetObject',
    name,
    domain,
    id: r.id,
  });
  if (!o) {
    return o;
  }
  return o.value;
}

export default function CloudAuth({ dataSource, methods }) {
  async function VerifyAuth({ auth, domain }) {
    if (!auth) {
      return {};
    }
    if (auth.sessionId) {
      return await VerifySession({ auth, domain });
    }

    if (auth.accountId) {
      const v = await VerifyAuthMethod({
        verificationInfo: auth.verificationInfo,
        domain,
        accountId: auth.accountId,
        verificationResponse: auth.verificationResponse,
      });

      if (
        !v.accountId ||
        !v.verifiedMethodId ||
        !v.verifiedMethodName ||
        v.accountId !== auth.accountId
      ) {
        throw new Error('Cannot validate authentication');
      }
      return {
        accountId: v.accountId,
        method: v.verifiedMethodName,
      };
    }

    return {};
  }

  async function VerifySession({ auth, domain }) {
    if (!auth) {
      return { accountId: null };
    }
    const { accountId, sessionId, token } = auth;

    const savedSession = await getObj(
      dataSource,
      domain,
      `auth/account/${accountId}/session/${sessionId}`
    );

    if (!savedSession || savedSession.token !== token) {
      return { accountId: null };
    }

    return { ...savedSession, accountId };
  }

  async function CreateVerificationRequest({
    domain,
    accountId,
    verificationInfo,
  }) {
    let methodsToValidate = [...methods];

    let validatedAccountId = null;

    while (methodsToValidate.length && !validatedAccountId) {
      const methodToValidate = methodsToValidate[0];
      methodsToValidate = methodsToValidate.slice(1);
      if (methodToValidate.canVerify(verificationInfo, accountId)) {
        const methodId = await methodToValidate.getMethodId(verificationInfo);
        const methodStateRefName = `auth/method/${methodId}`;

        const methodState = await getObj(
          dataSource,
          domain,
          methodStateRefName
        );

        const requestedVerification = await methodToValidate.requestVerification(
          { verificationInfo, methodState }
        );

        await writeObj(
          dataSource,
          domain,
          methodStateRefName,
          requestedVerification
        );
        return {
          verificationChallenge: requestedVerification.verificationChallenge,
          methodId,
        };
      }
    }
    throw new Error('No auth method matches this info and account!');
  }
  async function PutAuthMethod({
    domain,
    auth,
    verificationInfo,
    verificationResponse,
  }) {
    const verifiedSession = await VerifySession({ auth, domain });

    if (
      !verifiedSession ||
      !verifiedSession.accountId ||
      verifiedSession.accountId !== auth.accountId
    ) {
      throw new Error('not authenticated');
    }

    const authMethodVerification = await VerifyAuthMethod({
      accountId: verifiedSession.accountId,
      domain,
      verificationInfo,
      verificationResponse,
    });
    if (
      !authMethodVerification.accountId ||
      !authMethodVerification.verifiedMethodId ||
      !authMethodVerification.verifiedMethodName ||
      authMethodVerification.accountId !== verifiedSession.accountId
    ) {
      return authMethodVerification;
    }

    return authMethodVerification;
  }

  async function VerifyAuthMethod({
    domain,
    verificationInfo,
    verificationResponse,
    accountId,
  }) {
    if (!verificationResponse) {
      return CreateVerificationRequest({ domain, accountId, verificationInfo });
    }

    let methodsToValidate = [...methods];

    let verifiedMethodId = null;
    let verifiedMethodName = null;
    let verifiedAccountId = null;

    while (methodsToValidate.length && !verifiedMethodId) {
      const methodToValidate = methodsToValidate[0];
      methodsToValidate = methodsToValidate.slice(1);
      if (!methodToValidate.canVerify(verificationInfo, accountId)) {
        continue;
      }
      const methodId = await methodToValidate.getMethodId(verificationInfo);
      const methodStateRefName = `auth/method/${methodId}`;
      const methodState = await getObj(dataSource, domain, methodStateRefName);
      const methodStoredAccountId = methodState && methodState.accountId;
      const methodAccountId = methodStoredAccountId || accountId;

      if (
        methodStoredAccountId &&
        accountId &&
        methodStoredAccountId !== accountId
      ) {
        throw new Error('Auth method in use by another account!');
      }

      let nextMethodState = methodState;
      nextMethodState = await methodToValidate.performVerification({
        accountId: methodAccountId,
        verificationInfo,
        methodState,
        verificationResponse,
      });
      verifiedAccountId = verifiedMethodId = methodId;
      verifiedMethodName = methodToValidate.name;
      verifiedAccountId = methodAccountId;
      if (accountId && !nextMethodState.accountId) {
        nextMethodState = { ...nextMethodState, accountId };
      }

      if (nextMethodState !== methodState) {
        await writeObj(dataSource, domain, methodStateRefName, nextMethodState);
      }
    }

    if (!verifiedMethodId || !verifiedMethodName) {
      throw new Error('Cannot verify auth method');
    }
    return {
      verifiedMethodName,
      verifiedMethodId,
      accountId: verifiedAccountId,
    };
  }

  async function CreateSession({
    domain,
    accountId,
    verificationInfo,
    verificationResponse,
  }) {
    const verification = await VerifyAuthMethod({
      domain,
      accountId,
      verificationInfo,
      verificationResponse,
    });

    if (
      !verification.accountId ||
      !verification.verifiedMethodId ||
      !verification.verifiedMethodName ||
      (accountId && verification.accountId !== accountId)
    ) {
      return verification;
    }
    const sessionId = uuid();
    const token = await checksum(uuid());
    const session = {
      timeCreated: Date.now(),
      accountId: verification.accountId,
      sessionId,
      methodId: verification.verifiedMethodId,
      token,
      method: verification.verifiedMethodName,
    };
    await writeObj(
      dataSource,
      domain,
      `auth/account/${verification.accountId}/session/${sessionId}`,
      session
    );
    return {
      session,
    };
  }
  async function CreateAnonymousSession({ domain }) {
    const accountId = uuid();
    const sessionId = uuid();
    const token = uuid();

    const account = {
      timeCreated: Date.now(),
    };

    const session = {
      timeCreated: Date.now(),
      methodId: 'anonymous',
      accountId,
      sessionId,
      token,
    };

    await writeObj(dataSource, domain, `auth/account/${accountId}`, account);
    await writeObj(
      dataSource,
      domain,
      `auth/account/${accountId}/session/${sessionId}`,
      session
    );

    return { session };
  }

  const Permissions = {
    none: {
      canRead: false,
      canWrite: false,
      canPost: false,
      canAdmin: false,
    },
    admin: {
      canRead: true,
      canWrite: true,
      canPost: true,
      canAdmin: true,
    },
  };
  const Rules = {
    empty: {
      canRead: null,
      canWrite: null,
      canPost: null,
      canAdmin: null,
    },
  };
  const PermissionNames = ['canRead', 'canWrite', 'canPost', 'canAdmin'];

  async function GetPermissions({ auth, name, domain }) {
    const validatedAuth = await VerifyAuth({ auth, domain });

    if (validatedAuth.method === 'root' && validatedAuth.accountId === 'root') {
      return Permissions.admin;
    }

    const authObjName = `${name}/_auth`;

    const permissions = await getObj(dataSource, domain, authObjName);

    const interpretedRule = {};

    function applyRule(permissionRule) {
      PermissionNames.forEach(permissionName => {
        const p = permissionRule[permissionName];
        if (interpretedRule[permissionName] == null) {
          interpretedRule[permissionName] = p;
        }
      });
    }

    permissions &&
      permissions.defaultRule &&
      applyRule(permissions.defaultRule);

    permissions &&
      permissions.accountRules &&
      permissions.accountRules[validatedAuth.accountId] &&
      applyRule(permissions.accountRules[validatedAuth.accountId]);

    return {
      canRead:
        interpretedRule.canRead ||
        interpretedRule.canWrite ||
        interpretedRule.canAdmin ||
        false,
      canWrite: interpretedRule.canWrite || interpretedRule.canAdmin || false,
      canPost: interpretedRule.canPost || interpretedRule.canAdmin || false,
      canAdmin: interpretedRule.canAdmin || false,
    };
  }

  async function DestroySession({ auth, domain }) {
    const validated = await VerifySession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return false;
    }

    await dataSource.dispatch({
      type: 'DestroyRef',
      domain,
      name: `auth/account/${auth.accountId}/session/${auth.sessionId}`,
    });

    return true; // uh
  }

  async function DestroyAllSessions({ auth, domain }) {
    const validated = await VerifySession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return false;
    }

    await dataSource.dispatch({
      type: 'DestroyRef',
      domain,
      name: `auth/account/${auth.accountId}/session`,
    });
  }

  async function PutPermissionRules({
    auth,
    domain,
    name,
    accountRules,
    defaultRule,
  }) {
    const authObjName = name ? `${name}/_auth` : '_auth';

    const lastPermissions = await getObj(dataSource, domain, authObjName);
    const lastDefaultRule =
      (lastPermissions && lastPermissions.defaultRule) || Rules.empty;
    const lastAccountRules =
      (lastPermissions && lastPermissions.accountRules) || {};

    const permissions = {
      ...lastPermissions,
      accountRules: {
        ...lastAccountRules,
        ...accountRules,
      },
      defaultRule: defaultRule || lastDefaultRule,
      lastWriteTime: Date.now(),
    };

    await writeObj(dataSource, domain, authObjName, permissions);
  }

  async function GetPermissionRules({ domain, name }) {
    const authObjName = `${name}/_auth`;

    const lastPermissions = await getObj(dataSource, domain, authObjName);
    return lastPermissions;
  }

  const guardedActions = {};

  const readActions = [
    'GetObject',
    'GetRef',
    'GetRefValue',
    'ListRefs',
    'ListRefObjects',
  ];
  const writeActions = ['PutObject', 'PutRef'];
  const adminActions = ['DestroyRef'];

  function guardAction(dispatch, actionType, permissionLevel) {
    return async action => {
      if (action.type !== actionType) {
        return await dispatch(action);
      }
      let refName = action.name;
      let realPermissionLevelRequired = null;
      const authRefName = getAuthRefName(action.name);
      if (typeof authRefName === 'string') {
        refName = authRefName;
        realPermissionLevelRequired = 'canAdmin';
      }
      const p = await GetPermissions({
        auth: action.auth,
        name: refName,
        domain: action.domain,
      });
      if (
        !p[permissionLevel] ||
        (realPermissionLevelRequired && !p[realPermissionLevelRequired])
      ) {
        throw new Error(
          `Insufficient permissions for "${actionType}" on ${
            action.name
          }. Requires "${permissionLevel}"`
        );
      }
      return await dispatch(action);
    };
  }

  readActions.forEach(aName => {
    guardedActions[aName] = guardAction(dataSource.dispatch, aName, 'canRead');
  });
  writeActions.forEach(aName => {
    guardedActions[aName] = guardAction(dataSource.dispatch, aName, 'canWrite');
  });
  adminActions.forEach(aName => {
    guardedActions[aName] = guardAction(dataSource.dispatch, aName, 'canAdmin');
  });

  const actions = {
    ...guardedActions,
    PutPermissionRules: guardAction(
      PutPermissionRules,
      'PutPermissionRules',
      'canAdmin'
    ),
    GetPermissionRules: guardAction(
      GetPermissionRules,
      'GetPermissionRules',
      'canAdmin'
    ),
    CreateSession,
    CreateAnonymousSession,
    DestroySession, // todo, guard
    DestroyAllSessions, // todo, guard
    VerifySession,
    VerifyAuth,
    PutAuthMethod, // todo, guard
    GetPermissions,
  };

  const dispatch = createDispatcher(actions, dataSource.dispatch);
  return {
    ...dataSource,
    dispatch,
  };
}
