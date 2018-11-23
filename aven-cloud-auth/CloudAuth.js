import { uuid, checksum } from "../aven-cloud-utils/Crypto";
import createDispatcher from "../aven-cloud-utils/createDispatcher";

async function writeObj(dataSource, domain, name, value) {
  const obj = await dataSource.dispatch({
    type: "PutObject",
    domain,
    value,
    name
  });
  await dataSource.dispatch({
    type: "PutRef",
    domain,
    id: obj.id,
    name
  });
}

async function getObj(dataSource, domain, name) {
  const r = await dataSource.dispatch({
    domain,
    type: "GetRef",
    name
  });
  if (!r || !r.id) {
    return null;
  }

  const o = await dataSource.dispatch({
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
  async function ValidateSession({ auth, domain }) {
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

    return { accountId, method: savedSession.method };
  }

  async function CreateSessionRequest({ domain, accountId, authInfo }) {
    let methodsToValidate = [...methods];

    let validatedAccountId = null;

    while (methodsToValidate.length && !validatedAccountId) {
      const methodToValidate = methodsToValidate[0];

      if (methodToValidate.canVerify(authInfo, accountId)) {
        const authRefId = await methodToValidate.getAuthId(authInfo);
        const authRefName = `auth/account/${accountId}/method/${authRefId}`;

        const lastAuthState = await getObj(dataSource, domain, authRefName);

        const requestedVerification = await methodToValidate.requestVerification(
          { authInfo, lastAuthState }
        );

        await writeObj(dataSource, domain, authRefName, requestedVerification);

        return {
          verificationChallenge: requestedVerification.verificationChallenge
        };
      }
    }

    throw new Error("No auth method matches this info and account!");
  }

  async function CreateSession({
    domain,
    accountId,
    authInfo,
    verificationResponse
  }) {
    if (!verificationResponse) {
      return CreateSessionRequest({ domain, accountId, authInfo });
    }

    let methodsToValidate = [...methods];

    let validatedMethodId = null;
    let validatedMethodName = null;

    while (methodsToValidate.length && !validatedMethodId) {
      const methodToValidate = methodsToValidate[0];
      methodsToValidate = methodsToValidate.slice(1);
      if (!methodToValidate.canVerify(authInfo, validatedMethodId)) {
        continue;
      }
      const methodId = await methodToValidate.getAuthId(authInfo);
      const authRefName = `auth/account/${accountId}/method/${methodId}`;
      const lastAuthState = await getObj(dataSource, domain, authRefName);

      let nextAuthState = lastAuthState;
      try {
        nextAuthState = await methodToValidate.performVerification({
          accountId,
          authInfo,
          lastAuthState,
          verificationResponse
        });
        validatedMethodId = methodId;
        validatedMethodName = methodToValidate.name;
      } catch (e) {}

      if (nextAuthState !== lastAuthState) {
        await writeObj(dataSource, domain, authRefName, nextAuthState);
      }
    }

    if (!validatedMethodId || !validatedMethodName) {
      throw new Error("Cannot verify");
    }

    const sessionId = uuid();
    const token = await checksum(uuid());
    const session = {
      timeCreated: Date.now(),
      accountId,
      sessionId,
      methodId: validatedMethodId,
      token,
      method: validatedMethodName
    };
    await writeObj(
      dataSource,
      domain,
      `auth/account/${accountId}/session/${sessionId}`,
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

    return session;
  }

  async function GetPermissions({ auth, name, domain }) {
    let canRead = false;
    let canWrite = false;
    let canPost = false;

    const validated = await ValidateSession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return { canRead, canWrite, canPost };
    }
    if (validated.method === "root" && validated.accountId === "root") {
      canRead = true;
      canWrite = true;
      canPost = true;
    }
    return { canRead, canWrite, canPost };
  }

  async function DestroySession({ auth, domain }) {
    const validated = await ValidateSession({ auth, domain });

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
    const validated = await ValidateSession({ auth, domain });

    if (!validated.accountId || validated.accountId !== auth.accountId) {
      return false;
    }

    await dataSource.dispatch({
      type: "DestroyRef",
      domain,
      name: `auth/account/${auth.accountId}/session`
    });
  }

  const guardedActions = {};

  const readActions = ["GetObject", "GetRef", "ListRefs", "ListRefObjects"];
  const writeActions = ["PutObject", "PutRef"];
  const adminActions = ["DestroyRef"];

  function guardAction(actionName, permissionLevel) {
    return async () => {
      const p = await GetPermissions({ auth, name, domain });

      // check that p has permissionLevel

      await dataSource.dispatch({
        auth,
        name,
        domain
      });
    };
  }

  readActions.forEach(actionName => {
    guardedActions[actionName] = guardAction(actionName, "canRead");
  });
  writeActions.forEach(actionName => {
    guardedActions[actionName] = guardAction(actionName, "canWrite");
  });
  adminActions.forEach(actionName => {
    guardedActions[actionName] = guardAction(actionName, "canAdmin");
  });

  const actions = {
    ...guardedActions,
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
    ValidateSession,

    // ## PutAccountId(auth, newAccountId)
    // only the current session will move over
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
