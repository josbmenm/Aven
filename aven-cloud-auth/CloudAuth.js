import { uuid, checksum } from "../aven-cloud-utils/Crypto";
import createDispatcher from "../aven-cloud-utils/createDispatcher";

function thanksVeryMuch(dispatch) {
  return async action => {
    const resp = await dispatch(action);
    // console.log("thanks", action, resp);
    return resp;
  };
}
async function writeObj(dataSource, domain, name, value) {
  const obj = await thanksVeryMuch(dataSource.dispatch)({
    type: "PutObject",
    domain,
    value,
    name
  });
  await thanksVeryMuch(dataSource.dispatch)({
    type: "PutRef",
    domain,
    id: obj.id,
    name
  });
}

async function getObj(dataSource, domain, name) {
  const r = await thanksVeryMuch(dataSource.dispatch)({
    domain,
    type: "GetRef",
    name
  });
  if (!r || !r.id) {
    return null;
  }

  const o = await thanksVeryMuch(dataSource.dispatch)({
    type: "GetObject",
    name,
    domain,
    id: r.id
  });
  if (!o) {
    return o;
  }
  return o.object;
}

export default function CloudAuth({ dataSource, methods }) {
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

  async function CreateVerificationRequest({ domain, accountId, authInfo }) {
    let methodsToValidate = [...methods];

    let validatedAccountId = null;

    while (methodsToValidate.length && !validatedAccountId) {
      const methodToValidate = methodsToValidate[0];

      if (methodToValidate.canVerify(authInfo, accountId)) {
        const methodId = await methodToValidate.getMethodId(authInfo);
        const methodStateRefName = `auth/method/${methodId}`;

        const methodState = await getObj(
          dataSource,
          domain,
          methodStateRefName
        );

        const requestedVerification = await methodToValidate.requestVerification(
          { authInfo, methodState }
        );

        await writeObj(
          dataSource,
          domain,
          methodStateRefName,
          requestedVerification
        );

        return {
          verificationChallenge: requestedVerification.verificationChallenge,
          methodId
        };
      }
    }

    throw new Error("No auth method matches this info and account!");
  }
  async function PutAuthMethod({
    domain,
    auth,
    authInfo,
    verificationResponse
  }) {
    const verifiedSession = await VerifySession({ auth, domain });

    if (
      !verifiedSession ||
      !verifiedSession.accountId ||
      verifiedSession.accountId !== auth.accountId
    ) {
      throw new Error("not authenticated");
    }

    const authMethodVerification = await VerifyAuthMethod({
      accountId: verifiedSession.accountId,
      domain,
      authInfo,
      verificationResponse
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
    authInfo,
    verificationResponse,
    accountId
  }) {
    if (!verificationResponse) {
      return CreateVerificationRequest({ domain, accountId, authInfo });
    }

    let methodsToValidate = [...methods];

    let verifiedMethodId = null;
    let verifiedMethodName = null;
    let verifiedAccountId = null;

    while (methodsToValidate.length && !verifiedMethodId) {
      const methodToValidate = methodsToValidate[0];
      methodsToValidate = methodsToValidate.slice(1);
      if (!methodToValidate.canVerify(authInfo, verifiedMethodId)) {
        continue;
      }
      const methodId = await methodToValidate.getMethodId(authInfo);
      const methodStateRefName = `auth/method/${methodId}`;
      const methodState = await getObj(dataSource, domain, methodStateRefName);
      const methodStoredAccountId = methodState && methodState.accountId;
      const methodAccountId = methodStoredAccountId || accountId;

      if (
        methodStoredAccountId &&
        accountId &&
        methodStoredAccountId !== accountId
      ) {
        throw new Error("Auth method in use by another account!");
      }

      let nextMethodState = methodState;
      nextMethodState = await methodToValidate.performVerification({
        accountId: methodAccountId,
        authInfo,
        methodState,
        verificationResponse
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
      throw new Error("Cannot verify auth method");
    }
    return {
      verifiedMethodName,
      verifiedMethodId,
      accountId: verifiedAccountId
    };
  }

  async function CreateSession({
    domain,
    accountId,
    authInfo,
    verificationResponse
  }) {
    const verification = await VerifyAuthMethod({
      domain,
      accountId,
      authInfo,
      verificationResponse
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
      method: verification.verifiedMethodName
    };
    await writeObj(
      dataSource,
      domain,
      `auth/account/${verification.accountId}/session/${sessionId}`,
      session
    );
    return {
      session
    };
  }
  async function CreateAnonymousSession({ domain }) {
    const accountId = uuid();
    const sessionId = uuid();
    const token = uuid();

    const account = {
      timeCreated: Date.now()
    };

    const session = {
      timeCreated: Date.now(),
      methodId: "anonymous",
      accountId,
      sessionId,
      token
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
      canAdmin: false
    },
    admin: {
      canRead: true,
      canWrite: true,
      canPost: true,
      canAdmin: true
    }
  };
  const Rules = {
    empty: {
      canRead: null,
      canWrite: null,
      canPost: null,
      canAdmin: null
    }
  };
  const PermissionNames = ["canRead", "canWrite", "canPost", "canAdmin"];

  async function GetPermissions({ auth, name, domain }) {
    const validated = await VerifySession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return Permissions.none;
    }
    if (validated.method === "root" && validated.accountId === "root") {
      return Permissions.admin;
    }

    const authObjName = `${name}/_auth`;

    const permissions = await getObj(dataSource, domain, authObjName);

    const interpretedRule = {};

    function applyPermission(permission) {
      PermissionNames.forEach(permissionName => {
        const p = permission[permissionName];
        if (interpretedRule[permissionName] == null) {
          interpretedRule[permissionName] = p;
        }
      });
    }

    applyPermission(permissions.defaultRule);

    return {
      ...Permissions.none,
      ...interpretedRule
    };
  }

  async function DestroySession({ auth, domain }) {
    const validated = await VerifySession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return false;
    }

    await dataSource.dispatch({
      type: "DestroyRef",
      domain,
      name: `auth/account/${auth.accountId}/session/${auth.sessionId}`
    });

    return true; // uh
  }

  async function DestroyAllSessions({ auth, domain }) {
    const validated = await VerifySession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return false;
    }

    await dataSource.dispatch({
      type: "DestroyRef",
      domain,
      name: `auth/account/${auth.accountId}/session`
    });
  }

  async function PutPermissionRules({
    auth,
    domain,
    name,
    rules,
    defaultRule
  }) {
    const authObjName = `${name}/_auth`;

    const lastPermissions = await getObj(dataSource, domain, authObjName);
    const lastDefaultRule =
      (lastPermissions && lastPermissions.defaultRule) || Rules.empty;
    const lastRules = (lastPermissions && lastPermissions.rules) || [];

    const permissions = {
      ...lastPermissions,
      rules: rules || lastRules,
      defaultRule: defaultRule || lastDefaultRule,
      lastWriteTime: Date.now()
    };

    await writeObj(dataSource, domain, authObjName, permissions);
  }

  const guardedActions = {};

  const readActions = ["GetObject", "GetRef", "ListRefs", "ListRefObjects"];
  const writeActions = ["PutObject", "PutRef"];
  const adminActions = ["DestroyRef"];

  function guardAction(dispatch, actionType, permissionLevel) {
    return async action => {
      if (action.type !== actionType) {
        return await dispatch(action);
      }
      const p = await GetPermissions({
        auth: action.auth,
        name: action.name,
        domain: action.domain
      });

      if (!p[permissionLevel]) {
        throw new Error("Insufficient permissions");
      }
      return await dispatch(action);
    };
  }

  readActions.forEach(aName => {
    guardedActions[aName] = guardAction(dataSource.dispatch, aName, "canRead");
  });
  writeActions.forEach(aName => {
    guardedActions[aName] = guardAction(dataSource.dispatch, aName, "canWrite");
  });
  adminActions.forEach(aName => {
    guardedActions[aName] = guardAction(dataSource.dispatch, aName, "canAdmin");
  });

  const actions = {
    ...guardedActions,
    PutPermissionRules: guardAction(
      PutPermissionRules,
      "PutPermissionRules",
      "canAdmin"
    ),
    // ListObjects,
    // CollectGarbage,

    // can admin:
    // DestroyRef,
    // TransferOwnership,

    // can write:
    // PutObject,
    // PutRef,

    // can read:
    // GetRef,
    // GetObject,
    // ListRefObjects
    // ListRefs,

    // anyone:
    // GetStatus,
    // ListDomains,

    CreateSession,
    CreateAnonymousSession,
    DestroySession,
    DestroyAllSessions,
    VerifySession,

    // ## PutAccountId(auth, newAccountId)
    // only the current session will move over
    PutAuthMethod,
    // ## PutAuthMethod(auth, authInfo, challengeResponse?)
    // optionally run twice, first time without challengeResponse
    // ## DestroyAuthMethod(auth, authInfo)
    // ## DestroyAccount(auth)

    GetPermissions
    // ## GetPermissions(auth?, refName)
    // ## PutAccountPermission(auth, refName, acctId, permissionObj)
    // ## PutGlobalPermission(auth, refName, permission)

    // ## TransferOwnership(auth, refName, newOwnerAcctId)
    // ## AcceptOwnership(auth, refName)
  };

  const dispatch = createDispatcher(actions, dataSource.dispatch);
  return {
    ...dataSource,
    dispatch
  };
}
