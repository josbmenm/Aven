import { uuid, checksum } from '../aven-cloud-utils/Crypto';
import createDispatcher from '../aven-cloud-utils/createDispatcher';
import { getAuthDocName } from '../aven-cloud-utils/MetaDocNames';

function thanksVeryMuch(dispatch) {
  return async action => {
    const resp = await dispatch(action);
    // console.log("thanks ", action, "very much", resp);
    return resp;
  };
}
async function writeDocValue(dataSource, domain, name, value) {
  await thanksVeryMuch(dataSource.dispatch)({
    type: 'PutDocValue',
    domain,
    value,
    name,
  });
}

async function getDocValue(dataSource, domain, name) {
  const r = await thanksVeryMuch(dataSource.dispatch)({
    domain,
    type: 'GetDoc',
    name,
  });
  if (!r || !r.id) {
    return null;
  }

  const o = await thanksVeryMuch(dataSource.dispatch)({
    type: 'GetBlock',
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

    const savedSession = await getDocValue(
      dataSource,
      domain,
      `auth/account/${accountId}/session/${sessionId}`
    );

    if (!savedSession || savedSession.token !== token) {
      return { accountId: null };
    }

    return { ...savedSession, accountId };
  }

  async function GetAccountIdForAuthMethod({ methodId, domain, accountId }) {
    const methodAccountLookupName = `auth/method/${methodId}`;
    const accountLookup = await getDocValue(
      dataSource,
      domain,
      methodAccountLookupName
    );
    if (accountLookup) {
      if (accountId && accountId !== accountLookup.accountId) {
        throw new Error('Auth method in use by another account!');
      }
      return accountLookup.accountId;
    }
    let newAuthMethodAccountId = accountId;
    if (!newAuthMethodAccountId) {
      newAuthMethodAccountId = await CreateAnonymousAccount({ domain });
    }
    await writeDocValue(dataSource, domain, methodAccountLookupName, {
      accountId: newAuthMethodAccountId,
      creationTime: Date.now(),
    });
    return newAuthMethodAccountId;
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

        const authenticatingAccountId = await GetAccountIdForAuthMethod({
          methodId,
          accountId,
          domain,
        });

        const methodStateDocName = `auth/account/${authenticatingAccountId}/method/${methodId}`;

        const methodState = await getDocValue(
          dataSource,
          domain,
          methodStateDocName
        );

        const requestedVerification = await methodToValidate.requestVerification(
          { verificationInfo, methodState }
        );

        await writeDocValue(
          dataSource,
          domain,
          methodStateDocName,
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
    let authenticatingAccountId = null;
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

      authenticatingAccountId = await GetAccountIdForAuthMethod({
        domain,
        methodId,
        accountId,
      });

      const methodStateDocName = `auth/account/${authenticatingAccountId}/method/${methodId}`;
      const methodState = await getDocValue(
        dataSource,
        domain,
        methodStateDocName
      );

      let nextMethodState = methodState;

      nextMethodState = await methodToValidate.performVerification({
        accountId: authenticatingAccountId,
        verificationInfo,
        methodState,
        verificationResponse,
      });
      verifiedMethodId = methodId;
      verifiedMethodName = methodToValidate.name;
      verifiedAccountId = authenticatingAccountId;

      if (nextMethodState !== methodState) {
        await writeDocValue(
          dataSource,
          domain,
          methodStateDocName,
          nextMethodState
        );
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
    await writeDocValue(
      dataSource,
      domain,
      `auth/account/${verification.accountId}/session/${sessionId}`,
      session
    );
    return {
      session,
    };
  }

  async function CreateAnonymousAccount({ domain }) {
    const accountId = uuid();
    const account = {
      timeCreated: Date.now(),
    };
    await writeDocValue(
      dataSource,
      domain,
      `auth/account/${accountId}`,
      account
    );
    return accountId;
  }

  async function CreateAnonymousSession({ domain }) {
    const accountId = await CreateAnonymousAccount({ domain });
    const sessionId = uuid();
    const token = uuid();

    const session = {
      timeCreated: Date.now(),
      methodId: 'anonymous',
      accountId,
      sessionId,
      token,
    };

    await writeDocValue(
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

  function pathApartName(name) {
    if (!name) {
      return [];
    }
    const parts = name.split('/');
    return parts.map((p, index) => {
      return parts.slice(0, index + 1).join('/');
    });
  }

  function nameToAuthDocName(name) {
    const docName = `${name}/_auth`;
    return docName;
  }

  async function GetPermissions({ auth, name, domain }) {
    const validatedAuth = await VerifyAuth({ auth, domain });

    const isRootAccount =
      validatedAuth.method === 'root' && validatedAuth.accountId === 'root';

    const permissionBlocks = await Promise.all(
      pathApartName(name)
        .map(nameToAuthDocName)
        .map(async docName => {
          return await getDocValue(dataSource, domain, docName);
        })
    );

    let owner = null;
    let userDoesOwn = false;

    const interpretedRule = {};

    function applyRule(permissionRule) {
      PermissionNames.forEach(permissionName => {
        const p = permissionRule[permissionName];
        if (interpretedRule[permissionName] == null) {
          interpretedRule[permissionName] = p;
        }
      });
    }
    permissionBlocks.forEach(permissions => {
      if (!permissions) return;
      if (permissions.owner) {
        owner = permissions.owner;
        if (permissions.owner === auth.accountId) {
          userDoesOwn = true;
        }
      }
      permissions.defaultRule && applyRule(permissions.defaultRule);

      permissions.accountRules &&
        permissions.accountRules[validatedAuth.accountId] &&
        applyRule(permissions.accountRules[validatedAuth.accountId]);
    });

    if (isRootAccount || userDoesOwn) {
      return { ...Permissions.admin, owner };
    }

    const finalPermissions = {
      owner,
      canRead:
        interpretedRule.canRead ||
        interpretedRule.canWrite ||
        interpretedRule.canAdmin ||
        false,
      canWrite: interpretedRule.canWrite || interpretedRule.canAdmin || false,
      canPost: interpretedRule.canPost || interpretedRule.canAdmin || false,
      canAdmin: interpretedRule.canAdmin || false,
    };

    if (finalPermissions.canRead || finalPermissions.canPost) {
      return finalPermissions;
    } else {
      // avoid sending the 'owner' if the user is not even allowed to read or post
      return Permissions.none;
    }
  }

  async function SetAccountName({ name, auth, domain }) {
    const validated = await VerifySession({ auth, domain });
    console.log('setting account name!', { name, auth, domain, validated });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      throw new Error('Invalid authentication!');
    }

    await dataSource.dispatch({
      type: 'MoveDoc',
      from: `auth/account/${validated.accountId}`,
      to: `auth/account/${name}`,
      domain,
    });
  }

  async function DestroySession({ auth, domain }) {
    const validated = await VerifySession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return false;
    }

    await dataSource.dispatch({
      type: 'DestroyDoc',
      domain,
      name: `auth/account/${auth.accountId}/session/${auth.sessionId}`,
    });
  }

  async function DestroyAllSessions({ auth, domain }) {
    const validated = await VerifySession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return false;
    }

    await dataSource.dispatch({
      type: 'DestroyDoc',
      domain,
      name: `auth/account/${auth.accountId}/session`,
    });
  }

  async function DestroyAccount({ auth, domain }) {
    const validated = await VerifySession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return false;
    }

    await dataSource.dispatch({
      type: 'DestroyDoc',
      domain,
      name: `auth/account/${auth.accountId}`,
    });
  }

  async function PutPermissionRules({
    auth,
    domain,
    name,
    accountRules,
    defaultRule,
  }) {
    const authDocName = name ? `${name}/_auth` : '_auth';

    const lastPermissions = await getDocValue(dataSource, domain, authDocName);
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

    await writeDocValue(dataSource, domain, authDocName, permissions);
  }

  async function GetPermissionRules({ domain, name }) {
    const authDocName = `${name}/_auth`;
    const lastPermissions = await getDocValue(dataSource, domain, authDocName);
    return lastPermissions;
  }

  const guardedActions = {};

  const readActions = ['GetBlock', 'GetDoc', 'GetDocValue', 'ListDocs'];
  const postActions = ['PostDoc'];
  const writeActions = ['PutDoc', 'PutDocValue'];
  const adminActions = ['DestroyDoc'];

  function guardAction(dispatch, actionType, permissionLevel) {
    return async action => {
      if (action.type !== actionType) {
        return await dispatch(action);
      }
      let docName = action.name;
      let realPermissionLevelRequired = null;
      const authDocName = getAuthDocName(action.name);
      if (typeof authDocName === 'string') {
        docName = authDocName;
        realPermissionLevelRequired = 'canAdmin';
      }
      const p = await GetPermissions({
        auth: action.auth,
        name: docName,
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
      const result = await dispatch(action);
      if (action.type === 'PostDoc' && result) {
        const authDocName = `${result.name}/_auth`;
        await writeDocValue(dataSource, action.domain, authDocName, {
          owner: action.auth.accountId,
        });
      }
      return result;
    };
  }

  readActions.forEach(aName => {
    guardedActions[aName] = guardAction(dataSource.dispatch, aName, 'canRead');
  });
  postActions.forEach(aName => {
    guardedActions[aName] = guardAction(dataSource.dispatch, aName, 'canPost');
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
    DestroySession,
    // DestroyAllSessions, // implemented but not tested or used yet
    // DestroyAccount, // implemented but not tested or used yet
    VerifySession,
    VerifyAuth,
    SetAccountName,
    PutAuthMethod, // todo, guard
    GetPermissions,
  };

  const dispatch = createDispatcher(actions, dataSource.dispatch);
  async function observeDoc(domain, name, auth) {
    const permissions = await GetPermissions({ name, auth, domain });
    if (!permissions.canRead) {
      throw new Error('Not authorized to subscribe here');
    }
    return await dataSource.observeDoc(domain, name);
  }
  return {
    ...dataSource,
    observeDoc,
    dispatch,
    close: () => {},
  };
}
