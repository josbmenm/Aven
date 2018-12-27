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

    const _docSubscriptions = {};

    const closeSubscription = localDocId => {
      _docSubscriptions[localDocId] &&
        _docSubscriptions[localDocId].unsubscribe();
      delete _docSubscriptions[localDocId];
    };
    const closeSocket = () => {
      Object.keys(_docSubscriptions).forEach(docName => {
        closeSubscription(docName);
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
        case 'SubscribeDocs': {
          const { domain, docs, auth } = action;
          docs.forEach(name => {
            dataSource.observeDoc(domain, name, auth).then(docObservable => {
              _docSubscriptions[`${domain}_${name}`] = docObservable
                .filter(z => !!z)
                .distinctUntilChanged()
                .subscribe({
                  next: v => {
                    if (v.id === undefined && v.value === undefined) {
                      return;
                    }
                    sendMessage({
                      type: 'DocUpdate',
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
        case 'UnsubscribeDocs': {
          action.docs.forEach(docName => {
            closeSubscription(`${action.domain}_${docName}`);
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
