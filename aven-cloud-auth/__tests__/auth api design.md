# Auth service API

## Data APIs:

- unchanged except new auth param with {id, session, token}

## CreateSession(accountId, authInfo, challengeResponse?) => auth?

- optionally run twice, first time without challengeResponse

## CreateAnonymousSession() => auth

## DestroySession(auth)

## DestroyAllSessions(auth)

## PutAccountId(auth, newAccountId)

- only the current session will move over

## PutAuthMethod(auth, authInfo, challengeResponse?)

- optionally run twice, first time without challengeResponse

## DestroyAuthMethod(auth, authInfo)

## DestroyAccount(auth)

## GetPermissions(auth?, refName)

## PutAccountPermission(auth, refName, acctId, permissionObj)

## PutGlobalPermission(auth, refName, permission)

## TransferOwnership(auth, refName, newOwnerAcctId)

## AcceptOwnership(auth, refName)

# Data Types

Auth

- acctId
- authSessionId
- token

AuthInfo

- type
  ...typed auth method info

AuthMethodState

- type
  ...typed auth method state

Permission

- canRead
- canWrite
- canPut - allowed to write objects AND publish
- canOwn - allowed to create direct children

UserAccount

- primaryAuthMethod: method id

Session

- token
- method
- creation time

# User Stories to Support

== story: track order with email/smserv

createAnonymousSession

put+write to 'orders/${orderId}', using session

authentication

await session = createSession({
accountId: uuid(),
authInfo: { type: email, email: foo@example.com, messageContext: 'reciept', messageParams: {...recieptParams} }
})

== story: create account with email/sms

== story: create account with unique username + email/sms

== story: disassociate email/phone

== story: log in with email/sms

service.getAuthToken

== story: log in with email/sms + password

== story: log in with ID + password

== story: log out

== story: associate new phone/email

== story: delete account

refs/
auth/
permission/${...refName}
id/
${auth_id}
method/
${method_id}
session/
${auth_id}
${session_id}
