import { uuid } from "../aven-cloud-utils/Crypto";
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

export default function CloudAuth({ dataSource, methods }) {
  async function ValidateSession({ auth, domain }) {
    if (!auth) {
      return { accountId: null };
    }
    const { accountId, sessionId, token } = auth;

    const r = await dataSource.dispatch({
      domain,
      type: "GetRef",
      name: `auth/account/${accountId}/session/${sessionId}`
    });
    if (!r) {
      return { accountId: null };
    }
    const obj = await dataSource.dispatch({
      domain,
      type: "GetObject",
      name: `auth/account/${accountId}/session/${sessionId}`,
      id: r.id
    });

    if (!obj.object || obj.object.token !== token) {
      return { accountId: null };
    }

    return { accountId, method: obj.object.method };
  }

  async function CreateSessionRequest({ domain, accountId, authInfo }) {
    let methodsToValidate = [...methods];

    let validatedAccountId = null;

    while (methodsToValidate.length && !validatedAccountId) {
      const methodToValidate = methodsToValidate[0];

      if (methodToValidate.canVerify(authInfo, accountId)) {
        const verificationChallenge = await methodToValidate.requestVerification(
          { authInfo, lastAuthState: null }
        );
        return { verificationChallenge };
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

    let validatedAccountId = null;

    while (methodsToValidate.length && !validatedAccountId) {
      const methodToValidate = methodsToValidate[0];
      if (
        await methodToValidate.performVerification({
          accountId,
          authInfo,
          lastAuthState: null,
          verificationResponse
        })
      ) {
        validatedAccountId = accountId;
      }
      methodsToValidate = methodsToValidate.slice(1);
    }

    if (validatedAccountId !== accountId) {
      throw new Error("Cannot verify");
    }

    const sessionId = uuid();
    const token = uuid();
    const session = {
      timeCreated: Date.now(),
      accountId,
      sessionId,
      token,
      method: authInfo.type
    };
    await writeObj(
      dataSource,
      domain,
      `auth/account/${accountId}/session/${sessionId}`,
      session
    );
    return {
      accountId,
      sessionId,
      token
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

  async function GetPermissions({ auth, ref, domain }) {
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

  const actions = {
    //     ## CreateSession(accountId, authInfo, challengeResponse?) => auth?
    CreateSession,
    CreateAnonymousSession,
    // optionally run twice, first time without challengeResponse
    // ## CreateAnonymousSession() => auth
    // ## DestroySession(auth)
    DestroySession,
    // ## DestroyAllSessions(auth)
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
