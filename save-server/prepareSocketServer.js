import uuid from 'uuid/v1';

const prepareSocketServer = dbService => wss => {
  const socketClosers = {};
  wss.on('connection', ws => {
    const sendMessage = message => ws.send(JSON.stringify(message));

    const clientId = uuid();
    sendMessage({ type: 'ClientId', clientId });

    const _refSubscriptions = {};

    const closeSubscription = refName => {
      _refSubscriptions[refName] && _refSubscriptions[refName].unsubscribe();
      delete _refSubscriptions[refName];
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
          action.refs.forEach(refName => {
            _refSubscriptions[refName] = dbService
              .observeRef(refName)
              .filter(z => !!z)
              .subscribe({
                next: v => {
                  sendMessage({
                    type: 'RefUpdate',
                    name: refName,
                    ...v,
                  });
                },
                error: () => {},
                complete: () => {},
              });
          });
          return;
        }
        case 'UnsubscribeRefs': {
          action.refs.forEach(refName => {
            closeSubscription(refName);
          });
          return;
        }
        default: {
          throw new Error(`unrecognized msg type "${action.type}"`);
          return;
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
