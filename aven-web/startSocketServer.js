import uuid from 'uuid/v1';

const WebSocket = require('ws');

const prepareSocketServer = (wss, dataSource) => {
  const socketClosers = {};
  wss.on('connection', ws => {
    const sendMessage = message => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    };

    const clientId = uuid();
    console.log('ws connection!', clientId);
    sendMessage({ type: 'ClientId', clientId });

    const subscriptions = {}; // map of domains to (map of authSessionId to (map of doc name to subscription with .unsubscribe)) // remember we are already in the context of a single client but theoretically one network client may support simultaneous sessions and domains

    function createSubscription(domain, auth, name, onValue, onError) {
      dataSource
        .observeDoc(domain, name, auth)
        .then(docObservable => {
          const subscription = docObservable.subscribe({
            next: onValue,
            error: () => {},
            complete: () => {},
          });
          const authSubs =
            subscriptions[domain] || (subscriptions[domain] = {});
          const docSubs =
            authSubs[auth.sessionId] || (authSubs[auth.sessionId] = {});
          docSubs[name] = subscription;
        })
        .catch(onError);
    }

    function closeSocket() {
      Object.keys(subscriptions).forEach(domain => {
        const authSubscriptions = subscriptions[domain];
        Object.keys(authSubscriptions).forEach(sessionId => {
          const docSubscriptions = authSubscriptions[sessionId];
          Object.keys(docSubscriptions).forEach(name => {
            const subscription = docSubscriptions[name];
            subscription && subscription.unsubscribe;
          });
        });
      });
      socketClosers[clientId] = null;
    }

    socketClosers[clientId] = closeSocket;

    ws.on('close', () => {
      closeSocket();
    });
    ws.on('error', err => {
      console.error('Websocket Error of Client ' + clientId);
      console.error(err);
      closeSocket();
    });
    ws.on('message', async message => {
      const action = { ...JSON.parse(message), clientId };

      switch (action.type) {
        case 'SubscribeDocs': {
          const { domain, docs, auth } = action;
          docs.forEach(name => {
            createSubscription(
              domain,
              auth || null,
              name,
              v => {
                if (v.id === undefined && v.value === undefined) {
                  return;
                }
                sendMessage({
                  type: 'DocUpdate',
                  auth: auth && { sessionId: auth.sessionId }, // mask the rest of auth
                  name,
                  domain: domain,
                  ...v,
                });
              },
              error => {
                sendMessage({
                  type: 'DocSubscriptionError',
                  error,
                });
              }
            );
          });
          return;
        }
        case 'UnsubscribeDocs': {
          const authSubs = subscriptions[action.domain];
          const docSubs =
            authSubs[(action.auth && action.auth.sessionId) || null];
          action.docs.forEach(docName => {
            if (docSubs[docName]) {
              docSubs[docName].unsubscribe && docSubs[docName].unsubscribe();
              delete docSubs[docName];
            }
          });
          return;
        }
        default: {
          throw new Error(`unrecognized msg type "${action.type}"`);
        }
      }
    });
  });

  return {
    close: () => {
      Object.keys(socketClosers).forEach(
        clientId => socketClosers[clientId] && socketClosers[clientId]()
      );
    },
  };
};

export default prepareSocketServer;
