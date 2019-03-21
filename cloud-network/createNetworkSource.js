import { Observable, BehaviorSubject, Subject } from 'rxjs-compat';
import ReconnectingWebSocket from 'reconnecting-websocket';

let idIndex = 0;
const idBase = Date.now();
function uuid() {
  idIndex += 1;
  return idBase + idIndex;
}

export default function createNetworkSource(opts) {
  const quiet = opts.quiet || false;
  const log = (...data) => {
    !quiet && console.log(...data);
  };

  const httpEndpoint = `${opts.useSSL === false ? 'http' : 'https'}://${
    opts.authority
  }/dispatch`;
  const wsEndpoint = `${opts.useSSL === false ? 'ws' : 'wss'}://${
    opts.authority
  }`;
  const isConnected = new BehaviorSubject(false);
  const wsMessages = new Subject();

  let ws = null;
  let wsClientId = null;

  async function dispatch(action) {
    const res = await opts.fetchFn(httpEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action),
    });

    if (res.status >= 400) {
      let result = await res.text();
      try {
        result = result.length ? JSON.parse(result) : null;
      } catch (e) {
        // fine! plaintext error. (see if I care!)
      }
      log('📣', action);
      log('🚨', result);
      throw new Error(result.message);
    }
    let result = await res.text();
    try {
      result = result.length ? JSON.parse(result) : null;
    } catch (e) {
      throw new Error('Expecting JSON but could not parse: ' + result);
    }
    log('📣', action);
    log('💨', result);

    return result;
  }

  function socketSendIfConnected(payload) {
    if (ws && ws.readyState === ReconnectingWebSocket.OPEN) {
      log('📣', payload);
      ws.send(JSON.stringify({ ...payload, clientId: wsClientId }));
    }
  }

  const subscriptions = {};

  function subscribe(subsSpec) {
    return new Observable(observer => {
      const id = uuid();
      const finalSpec = { ...subsSpec, id };
      socketSendIfConnected({
        type: 'Subscribe',
        subscriptions: [finalSpec],
      });
      subscriptions[id] = {
        spec: finalSpec,
        observer,
      };
      return () => {
        socketSendIfConnected({
          type: 'Unsubscribe',
          subscriptionIds: [id],
        });
        delete subscriptions[id];
      };
    }).share();
  }

  function connectWS() {
    if (ws) {
      throw new Error('ws already here!');
    }
    ws = new ReconnectingWebSocket(wsEndpoint, [], {
      // debug: true,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      minUptime: 5000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 4000,
      maxRetries: Infinity,
      WebSocket: opts.WebSocket,
    });

    wsClientId = null;
    ws.onopen = () => {
      // actually we're going to wait for the server to say hello with ClientId
    };
    ws.onclose = () => {
      isConnected.next(false);
      ws = null;
    };
    ws.onerror = () => {
      isConnected.next(false);
      ws = null;
    };
    ws.onmessage = msg => {
      const evt = JSON.parse(msg.data);
      !quiet && log('💨', evt);

      switch (evt.type) {
        case 'ClientId': {
          wsClientId = evt.clientId;
          isConnected.next(true);
          socketSendIfConnected({
            type: 'Subscribe',
            subscriptions: Object.keys(subscriptions).map(subsId => {
              const { spec } = subscriptions[subsId];
              return spec;
            }),
          });
          !quiet && log('Socket connected with client id: ', wsClientId);
          return;
        }
        case 'SubscriptionNext': {
          const { id, value } = evt;
          subscriptions[id] &&
            subscriptions[id].observer &&
            subscriptions[id].observer.next(value);
          return;
        }
        default: {
          wsMessages.next(evt);
          !quiet && log('Unknown ws event:', evt);
          return;
        }
      }
    };
  }

  connectWS();

  async function observeDoc(domain, name, auth) {
    return subscribe({ domain, auth, doc: name });
  }

  async function observeDocChildren(domain, name, auth) {
    return subscribe({ domain, auth, docChildren: name });
  }

  return {
    dispatch,
    observeDoc,
    observeDocChildren,
    isConnected,
    close: () => {
      ws && ws.close();
      ws = null;
      // todo, detach webocket
    },
  };
}
