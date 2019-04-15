import kuid from 'kuid';

const WebSocket = require('ws');

export default function startSourceSocketServer(wss, source) {
  const connections = {};

  wss.on('connection', ws => {
    const sendMessage = message => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    };

    const clientId = kuid();
    sendMessage({ type: 'ClientId', clientId });

    const subs = {};

    function unsubscribeAll() {
      Object.keys(subs).forEach(subId => {
        subs[subId].unsubscribe();
      });
    }

    function close() {
      unsubscribeAll();
      delete connections[clientId];
    }

    connections[clientId] = {
      close,
      subscriptions: subs,
    };

    ws.on('close', () => {
      close();
    });
    ws.on('error', err => {
      console.error('Websocket Error of Client ' + clientId);
      console.error(err);
      close();
    });
    ws.on('message', async message => {
      const action = { ...JSON.parse(message), clientId };

      switch (action.type) {
        case 'Subscribe': {
          const { subscriptions } = action;
          await Promise.all(
            subscriptions.map(async subscription => {
              const {
                id: subscriptionId,
                doc,
                docChildren,
                domain,
                auth,
              } = subscription;
              if (!subscriptionId) {
                throw new Error(
                  'Can not subscribe without providing an id of the subscription.'
                );
              }
              if (doc !== undefined && docChildren !== undefined) {
                throw new Error(
                  'Trying to subscribe to a doc and the children of a doc at the same time. Use seperate subscriptions instead.'
                );
              }
              function sendError(error) {
                sendMessage({
                  type: 'SubscriptionError',
                  id: subscriptionId,
                  error: {
                    message: error.message,
                    type: error.type,
                    detail: error.detail,
                  },
                });
              }
              function sendUpdate(value) {
                sendMessage({
                  type: 'SubscriptionNext',
                  id: subscriptionId,
                  value,
                });
              }
              const observer = {
                next: sendUpdate,
                complete: () => {
                  console.log('== complate');
                },
                error: sendError,
              };
              if (doc) {
                try {
                  subs[subscriptionId] = (await source.observeDoc(
                    domain,
                    doc,
                    auth
                  )).subscribe(observer);
                } catch (e) {
                  observer.error(e);
                }
              } else if (docChildren !== undefined) {
                subs[subscriptionId] = (await source.observeDocChildren(
                  domain,
                  docChildren,
                  auth
                )).subscribe(observer);
              } else {
                throw new Error(
                  'Invalid subscription, should contain doc or docChildren'
                );
              }
            })
          );
          return;
        }
        case 'Unsubscribe': {
          const { subscriptionIds } = action;
          subscriptionIds.forEach(subscriptionId => {
            subs[subscriptionId] && subs[subscriptionId].unsubscribe();
            delete subs[subscriptionId];
          });
          return;
        }
        case 'UnsubscribeAll': {
          unsubscribeAll();
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
      for (let connection in connections) {
        connection && connection.close && connection.close();
      }
    },
  };
}
