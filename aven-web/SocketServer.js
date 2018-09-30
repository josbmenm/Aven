import uuid from 'uuid/v1';

export const startSocketServer = wss => {
  wss.on('connection', ws => {
    const sendMessage = (type, message) =>
      ws.send(JSON.stringify({ ...message, type }));

    const clientId = uuid();
    sendMessage('ClientId', { clientId });

    ws.on('close', () => {
      // subscription.remove();
    });

    ws.on('message', async message => {
      const { requestId, ...action } = JSON.parse(message);
      console.log('hello', action);
      // switch (action.type) {
      //   case 'DocSubscribe': {
      //     // permission check
      //     if (!subscribedDocs.has(action.docName)) {
      //       subscribedDocs.add(action.docName);
      //     }
      //     return;
      //   }
      //   case 'DocUnsubscribe': {
      //     subscribedDocs.remove(action.docName);
      //     return;
      //   }
      //   case 'AccountSubscribe': {
      //     // permission check
      //     subscribedAccounts.add(action.accountName);
      //     return;
      //   }
      //   case 'AccountUnsubscribe': {
      //     subscribedAccounts.remove(action.accountName);
      //     return;
      //   }
      //   default: {
      //     // const result = await dispatch(action);
      //     // sendMessage('ActionResponse', {
      //     //   result,
      //     //   requestId,
      //     // });
      //     return;
      //   }
      // }
    });
  });

  return {
    close: () => {},
  };
};
