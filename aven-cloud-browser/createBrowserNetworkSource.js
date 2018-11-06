import { Observable, BehaviorSubject, Subject } from "rxjs-compat";
import ReconnectingWebSocket from "reconnecting-websocket";

export default function createBrowserNetworkSource(opts) {
  const httpEndpoint = `${opts.useSSL === false ? "http" : "https"}://${
    opts.authority
  }/dispatch`;
  const wsEndpoint = `${opts.useSSL === false ? "ws" : "wss"}://${
    opts.authority
  }`;
  const isConnected = new BehaviorSubject(false);
  const wsMessages = new Subject();

  let wsClientId = null;

  async function dispatch(action) {
    const res = await fetch(httpEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(action)
    });

    if (res.status >= 400) {
      throw new Error(await res.text());
    }
    let result = await res.text();
    try {
      result = JSON.parse(result);
    } catch (e) {
      throw new Error("Expecting JSON but could not parse: " + result);
    }
    console.log("📣", action);
    console.log("💨", result);

    return result;
  }

  let ws = null;

  const upstreamSubscribedRefs = new Set();

  // todo
  function subscribeUpstream(domain, refs) {
    socketSendIfConnected({
      type: "SubscribeRefs",
      refs,
      domain
    });
    refs.forEach(ref => upstreamSubscribedRefs.add(ref));
  }
  // function unsubscribeUpstream(domain, ref) {
  //   socketSendIfConnected({
  //     type: "UnsubscribeRefs",
  //     refs: [ref.getName()],
  //     // domain: this._domain
  //   });
  //   upstreamSubscribedRefs.delete(ref);
  // }

  function socketSendIfConnected(payload) {
    if (ws && ws.readyState === ReconnectingWebSocket.OPEN) {
      ws.send(JSON.stringify({ ...payload, clientId: wsClientId }));
    }
  }

  function connectWS() {
    if (ws) {
      throw new Error("ws already here!");
    }
    ws = new ReconnectingWebSocket(wsEndpoint, [], {
      // debug: true,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      minUptime: 5000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 4000,
      maxRetries: Infinity
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
      switch (evt.type) {
        case "ClientId": {
          wsClientId = evt.clientId;
          isConnected.next(true);
          const subdRefs = Array.from(upstreamSubscribedRefs).map(ref =>
            ref.getName()
          );
          socketSendIfConnected({
            type: "SubscribeRefs",
            refs: subdRefs
            // todo: refactor this whole thing to handle multiple domains. see observeDomainRef
            // domain: this._domain
          });
          console.log("Socket connected with client id: ", wsClientId);
          return;
        }
        case "RefUpdate": {
          const ref = this._refs[evt.name];
          ref.$handleRefEvent(evt);
        }
        default: {
          wsMessages.next(evt);
          console.log("Unknown ws event:", evt);
          return;
        }
      }
    };
  }

  connectWS();

  const refObservables = {};
  function createDomainRefObserver(domain, name) {
    const subject = new BehaviorSubject({ id: null });
    return Observable.create(observer => {
      console.log("subscribing to upstream data!");
      // observer.next();
      return () => {
        console.log("unsubuscribing from upstream data!");
      };
    });
    subscribeUpstream({
      domain,
      refs: [name]
    });
  }
  async function observeRef(domain, name) {
    const d = refObservables[domain] || (refObservables[domain] = {});
    const r = d[name] || (d[name] = createDomainRefObserver(domain, name));
    return r;
  }

  return {
    dispatch,
    observeRef,
    isConnected
  };
}
