# Aven Cloud

A full-stack data framework for web and mobile apps

## Roadmap

- Basic Server Functionality
  - Authentication API
  - Doc storage
- Basic Client Authentication and remote-access storage
- Client-Only behavior: DB, cache, offline mode

# Getting Started

## Set up an Aven Cloud server:

Local server can be started with `npx @aven-cloud/server`

If the DB doesn't exist, this will init one, and ask for root authentication credentials. We use SQLite by default but it will be possible to configure the server with Postgres.

In production, you will set up a stateless node.js cluster with the aven-cloud-server code, in front of a Postgres server/cluster.

Eventually there will be cloud services to handle the whole back-end.

## Set up Aven Cloud Client

```
const cloud = require('@aven-cloud/client');
```

Observables:

cloud.auth.isLoggedIn
cloud.auth.userId

Methods:

cloud.login(authRequest)
cloud.logout()
cloud.get(docId) => docRef

cloud.getSynthetic(async () => {
const foo = await cloud.get('foo');
const fooAtVersion = await cloud.get('foo#hjkeww');
console.log(foo.state)
foo.exists
foo.state.**type
foo.state.**ref

// in the DB, foo is { bar: 42 }

// Or, foo is { bar: { \_\_ref: 'foo#3ieuald' } }

const bar = await foo.get('bar');
const bar = await cloud.get('foo/bar');

// throws an exception when using write inside synthetic:
const newBar = foo.write()

return {
barPlus: bar + 1,
}
})

docRef.write(jsonData) => docRef
docRef.transact(lastDoc => ({}))
