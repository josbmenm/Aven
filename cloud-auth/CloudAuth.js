import { uuid, checksum } from '../cloud-utils/Crypto';
import createDispatcher from '../cloud-utils/createDispatcher';
import { getAuthDocName } from '../cloud-utils/MetaDocNames';
import Err from '../utils/Err';

function thanksVeryMuch(dispatch) {
  return async action => {
    const resp = await dispatch(action);
    // console.log("thanks ", action, "very much", resp);
    return resp;
  };
}
async function writeDocValue(source, domain, name, value) {
  await thanksVeryMuch(source.dispatch)({
    type: 'PutDocValue',
    domain,
    value,
    name,
  });
}

async function getDocValue(source, domain, name) {
  const r = await thanksVeryMuch(source.dispatch)({
    domain,
    type: 'GetDoc',
    name,
  });
  if (!r || !r.id) {
    return null;
  }

  const o = await thanksVeryMuch(source.dispatch)({
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

export default function CloudAuth({ source, providers }) {
  async function VerifyAuth({ auth, domain }) {
    if (!auth) {
      return {};
    }
    if (auth.sessionId) {
      return await VerifySession({ auth, domain });
    }

    if (auth.accountId) {
      const v = await VerifyAuthProvider({
        verificationInfo: auth.verificationInfo,
        domain,
        accountId: auth.accountId,
        verificationResponse: auth.verificationResponse,
      });

      if (
        !v.accountId ||
        !v.verifiedProviderId ||
        !v.verifiedProviderName ||
        v.accountId !== auth.accountId
      ) {
        throw new Err('Cannot validate authentication', 'AuthInvalid', {});
      }
      return {
        accountId: v.accountId,
        provider: v.verifiedProviderName,
      };
    }

    return {};
  }

  async function VerifySession({ auth, domain }) {
    if (!auth || !auth.sessionId) {
      return {};
    }
    const { accountId, sessionId, token } = auth;

    const savedSession = await getDocValue(
      source,
      domain,
      `auth/account/${accountId}/session/${sessionId}`,
    );

    if (!savedSession || savedSession.token !== token) {
      throw new Err('Cannot validate session', 'SessionInvalid', {});
    }

    return { ...savedSession, accountId };
  }

  async function GetAccountIdForAuthProvider({
    providerId,
    domain,
    accountId,
  }) {
    const providerAccountLookupName = `auth/provider/${providerId}`;
    const accountLookup = await getDocValue(
      source,
      domain,
      providerAccountLookupName,
    );
    if (accountLookup) {
      if (accountId && accountId !== accountLookup.accountId) {
        throw new Err(
          'Provided auth identity is already in use by another account.',
          'IdentityTaken',
          {},
        );
      }
      return accountLookup.accountId;
    }
    let newAuthProviderAccountId = accountId;
    if (!newAuthProviderAccountId) {
      newAuthProviderAccountId = await CreateAnonymousAccount({ domain });
    }
    await writeDocValue(source, domain, providerAccountLookupName, {
      accountId: newAuthProviderAccountId,
      creationTime: Date.now(),
    });
    return newAuthProviderAccountId;
  }

  async function CreateVerificationRequest({
    domain,
    accountId,
    verificationInfo,
  }) {
    let providersToValidate = [...providers];

    let validatedAccountId = null;

    while (providersToValidate.length && !validatedAccountId) {
      const providerToValidate = providersToValidate[0];
      providersToValidate = providersToValidate.slice(1);
      if (providerToValidate.canVerify(verificationInfo, accountId)) {
        const providerId = await providerToValidate.getProviderId(
          verificationInfo,
        );

        const authenticatingAccountId = await GetAccountIdForAuthProvider({
          providerId,
          accountId,
          domain,
        });

        const providerStateDocName = `auth/account/${authenticatingAccountId}/provider/${providerId}`;

        const providerState = await getDocValue(
          source,
          domain,
          providerStateDocName,
        );

        const requestedVerification = await providerToValidate.requestVerification(
          { verificationInfo, providerState },
        );

        await writeDocValue(
          source,
          domain,
          providerStateDocName,
          requestedVerification,
        );
        return {
          verificationChallenge: requestedVerification.verificationChallenge,
          providerId,
        };
      }
    }
    throw new Err('No auth provider matches this info and account!');
  }
  async function PutAuthProvider({
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
      throw new Err('not authenticated');
    }

    const authProviderVerification = await VerifyAuthProvider({
      accountId: verifiedSession.accountId,
      domain,
      verificationInfo,
      verificationResponse,
    });
    if (
      !authProviderVerification.accountId ||
      !authProviderVerification.verifiedProviderId ||
      !authProviderVerification.verifiedProviderName ||
      authProviderVerification.accountId !== verifiedSession.accountId
    ) {
      return authProviderVerification;
    }

    return authProviderVerification;
  }

  async function VerifyAuthProvider({
    domain,
    verificationInfo,
    verificationResponse,
    accountId,
  }) {
    let authenticatingAccountId = null;
    if (!verificationResponse) {
      return CreateVerificationRequest({ domain, accountId, verificationInfo });
    }

    let providersToValidate = [...providers];

    let verifiedProviderId = null;
    let verifiedProviderName = null;
    let verifiedAccountId = null;

    while (providersToValidate.length && !verifiedProviderId) {
      const providerToValidate = providersToValidate[0];
      providersToValidate = providersToValidate.slice(1);
      if (!providerToValidate.canVerify(verificationInfo, accountId)) {
        continue;
      }
      const providerId = await providerToValidate.getProviderId(
        verificationInfo,
      );

      authenticatingAccountId = await GetAccountIdForAuthProvider({
        domain,
        providerId,
        accountId,
      });

      const providerStateDocName = `auth/account/${authenticatingAccountId}/provider/${providerId}`;
      const providerState = await getDocValue(
        source,
        domain,
        providerStateDocName,
      );

      let nextproviderState = providerState;

      nextproviderState = await providerToValidate.performVerification({
        accountId: authenticatingAccountId,
        verificationInfo,
        providerState,
        verificationResponse,
      });
      verifiedProviderId = providerId;
      verifiedProviderName = providerToValidate.name;
      verifiedAccountId = authenticatingAccountId;

      if (nextproviderState !== providerState) {
        await writeDocValue(
          source,
          domain,
          providerStateDocName,
          nextproviderState,
        );
      }
    }

    if (!verifiedProviderId) {
      throw new Err('Provided authentication is invalid', 'InvalidAuth');
    }

    return {
      verifiedProviderName,
      verifiedProviderId,
      accountId: verifiedAccountId,
    };
  }

  async function CreateSession({
    domain,
    accountId,
    verificationInfo,
    verificationResponse,
  }) {
    const verification = await VerifyAuthProvider({
      domain,
      accountId,
      verificationInfo,
      verificationResponse,
    });
    if (
      !verification.accountId ||
      !verification.verifiedProviderId ||
      !verification.verifiedProviderName ||
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
      providerId: verification.verifiedProviderId,
      token,
      provider: verification.verifiedProviderName,
    };
    await writeDocValue(
      source,
      domain,
      `auth/account/${verification.accountId}/session/${sessionId}`,
      session,
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
    await writeDocValue(source, domain, `auth/account/${accountId}`, account);
    return accountId;
  }

  async function CreateAnonymousSession({ domain }) {
    const accountId = await CreateAnonymousAccount({ domain });
    const sessionId = uuid();
    const token = uuid();

    const session = {
      timeCreated: Date.now(),
      providerId: 'anonymous',
      accountId,
      sessionId,
      token,
    };

    await writeDocValue(
      source,
      domain,
      `auth/account/${accountId}/session/${sessionId}`,
      session,
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
      validatedAuth.provider === 'root' && validatedAuth.accountId === 'root';

    const permissionBlocks = await Promise.all(
      pathApartName(name)
        .map(nameToAuthDocName)
        .map(async docName => {
          return await getDocValue(source, domain, docName);
        }),
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

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      throw new Err('Invalid authentication!', 'InvalidAuth');
    }

    await source.dispatch({
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

    await source.dispatch({
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

    await source.dispatch({
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

    await source.dispatch({
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

    const lastPermissions = await getDocValue(source, domain, authDocName);
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

    await writeDocValue(source, domain, authDocName, permissions);
  }

  async function GetPermissionRules({ domain, name }) {
    const authDocName = `${name}/_auth`;
    const lastPermissions = await getDocValue(source, domain, authDocName);
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
        throw new Err(
          `Insufficient permissions for "${actionType}" on ${
            action.name
          }. Requires "${permissionLevel}"`,
          'InsufficientPermissions',
        );
      }
      const result = await dispatch(action);
      if (action.type === 'PostDoc' && result) {
        const authDocName = `${result.name}/_auth`;
        await writeDocValue(source, action.domain, authDocName, {
          owner: action.auth.accountId,
        });
      }
      return result;
    };
  }

  readActions.forEach(aName => {
    guardedActions[aName] = guardAction(source.dispatch, aName, 'canRead');
  });
  postActions.forEach(aName => {
    guardedActions[aName] = guardAction(source.dispatch, aName, 'canPost');
  });
  writeActions.forEach(aName => {
    guardedActions[aName] = guardAction(source.dispatch, aName, 'canWrite');
  });
  adminActions.forEach(aName => {
    guardedActions[aName] = guardAction(source.dispatch, aName, 'canAdmin');
  });

  const actions = {
    ...guardedActions,
    PutPermissionRules: guardAction(
      PutPermissionRules,
      'PutPermissionRules',
      'canAdmin',
    ),
    GetPermissionRules: guardAction(
      GetPermissionRules,
      'GetPermissionRules',
      'canAdmin',
    ),
    CreateSession,
    CreateAnonymousSession,
    DestroySession,
    // DestroyAllSessions, // implemented but not tested or used yet
    // DestroyAccount, // implemented but not tested or used yet
    VerifySession,
    VerifyAuth,
    SetAccountName,
    PutAuthProvider, // todo, guard
    GetPermissions,
  };

  const dispatch = createDispatcher(actions, source.dispatch);
  async function observeDoc(domain, name, auth) {
    const permissions = await GetPermissions({ name, auth, domain });
    if (!permissions.canRead) {
      throw new Err('Not authorized to subscribe here');
    }
    return await source.observeDoc(domain, name);
  }
  return {
    ...source,
    observeDoc,
    dispatch,
    close: () => {},
  };
}
