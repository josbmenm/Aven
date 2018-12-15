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

    const _refSubscriptions = {};

    const closeSubscription = localRefId => {
      _refSubscriptions[localRefId] &&
        _refSubscriptions[localRefId].unsubscribe();
      delete _refSubscriptions[localRefId];
    };
    const closeSocket = () => {
      Object.keys(_refSubscriptions).forEach(refName => {
        closeSubscription(refName);
      });
      socketClosers[clientId] = null;
    };
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
        case 'SubscribeRefs': {
          const { domain, refs } = action;
          refs.forEach(name => {
            dataSource.observeRef(domain, name).then(refObservable => {
              _refSubscriptions[`${domain}_${name}`] = refObservable
                .filter(z => !!z)
                .subscribe({
                  next: v => {
                    if (v.id === undefined) {
                      return;
                    }
                    sendMessage({
                      type: 'RefUpdate',
                      name,
                      domain: domain,
                      ...v,
                    });
                  },
                  error: () => {},
                  complete: () => {},
                });
            });
          });
          return;
        }
        case 'UnsubscribeRefs': {
          action.refs.forEach(refName => {
            closeSubscription(`${action.domain}_${refName}`);
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
        clientId => socketClosers[clientId] && socketClosers[clientId](),
      );
    },
  };
};

export default prepareSocketServer;
