import { Observable, BehaviorSubject } from "rxjs-compat";
const fetch = require("node-fetch");
const WebSocketClient = require("websocket").w3cwebsocket;

const _getRef = ({ objectId, isPublic, owner }) => {
  // this strips out hidden features of the ref and snapshots the references
  return {
    objectId,
    isPublic,
    owner
  };
};

const startRemoteDataSource = ({ host, domain }) => {
  const _httpEndpoint = `${host.useSSL === false ? "http" : "https"}://${
    host.authority
  }/dispatch`;
  const _wsEndpoint = `${host.useSSL === false ? "ws" : "wss"}://${
    host.authority
  }`;
  const _isConnected = new BehaviorSubject(false);

  const _domains = {};
  const setInternalRef = (domain, refName, ref) => {
    const d = _domains[domain] || (_domains[domain] = {});
    const r = d[refName] || (d[refName] = {});
    r.objectId = ref.id;
    if (r.observe) {
      r.observe.next(_getRef(r));
    } else {
      r.observe = new BehaviorSubject(_getRef(r));
    }
  };
  const getInternalRef = (domain, refName) => {
    const d = _domains[domain] || (_domains[domain] = {});
    const r = d[refName] || (d[refName] = {});
    if (!r.observe) {
      r.observe = new BehaviorSubject(_getRef(r));
    }
    return r;
  };

  const dispatch = async action => {
    const res = await fetch(_httpEndpoint, {
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
      console.error(e);
      // throw new Error("Expecting JSON but could not parse: " + result);
    }
    console.log("📣", action);
    console.log("💨", result);

    return result;
  };

  async function putRef({ domain, ref, objectId, owner }) {
    return await dispatch({
      type: "putRef",
      domain,
      ref,
      objectId
    });
  }

  async function getObject({ id, domain }) {
    return await dispatch({
      type: "getObject",
      id,
      domain
    });
  }
  async function putObject({ object, domain }) {
    return await dispatch({
      type: "putObject",
      object,
      domain
    });
  }
  async function getRef({ domain, ref }) {
    const refVal = await dispatch({
      type: "getRef",
      ref,
      domain
    });
    setInternalRef(domain, ref, refVal);
    return refVal;
  }

  let _ws = null;
  let clientId = null;

  const _upstreamSubscribedRefs = new Set();

  const _socketSendIfConnected = payload => {
    if (_ws && _ws.readyState === WebSocketClient.OPEN) {
      _ws.send(JSON.stringify({ ...payload, clientId }));
    }
  };

  const connectWS = () => {
    if (_ws) {
      throw new Error("ws already here!");
    }
    _ws = new WebSocketClient(_wsEndpoint, [], {
      // debug: true,
      WebSocket: WebSocketClient,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      minUptime: 5000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 4000,
      maxRetries: Infinity
    });

    clientId = null;
    _ws.onopen = () => {
      // actually we're going to wait for the server to say hello with ClientId
    };
    _ws.onclose = () => {
      _isConnected.next(false);
      _ws = null;
    };
    _ws.onerror = () => {
      _isConnected.next(false);
      _ws = null;
    };
    _ws.onmessage = msg => {
      const evt = JSON.parse(msg.data);
      switch (evt.type) {
        case "ClientId": {
          clientId = evt.clientId;
          _isConnected.next(true);
          const subdRefs = Array.from(_upstreamSubscribedRefs).map(ref =>
            ref.getName()
          );
          _socketSendIfConnected({
            type: "SubscribeRefs",
            refs: subdRefs,
            domain
          });
          console.log("Socket connected with client id: ", clientId);
          return;
        }
        case "RefUpdate": {
          console.log("====REMOTE REF UPDATE!!!!!", evt);
          setInternalRef(evt.domain, evt.name, evt);
          return;
        }
        default: {
          console.error("Unknown ws event:", evt);
          return;
        }
      }
    };
  };

  const getStatus = () => ({
    ready: true,
    connected: true,
    migrated: true
  });
  const actions = {
    putRef,
    putObject,
    getObject,
    getRef,
    getStatus
  };
  const close = () => {
    _ws && _ws.close();
  };

  connectWS();

  const listenRef = async (refName, domain) => {};
  const unlistenRef = async (refName, domain) => {
    _socketSendIfConnected({
      type: "SubscribeRefs",
      refs: [refName],
      doamin
    });
  };

  const observeRef = (refName, domain) => {
    console.log("yo, observeRef to ", refName, domain);
    if (_refObservables[refName]) {
      return _refObservables[refName];
    }
    const refObs = Observable.create(observer => {
      listenRef(refName)
        .then(channelName => {
          _notifyRefObservables[channelName] = payload => {
            observer.next(payload);
          };
        })
        .catch(e => {
          observer.error(e);
        });

      return () => {
        unlistenRef(refName, domain)
          .then(() => {})
          .catch(e => {
            observer.error(e);
          });
        _notifyRefObservables[channelOfRefAndDomain(refName, domain)] = null;
      };
    })
      .multicast(() => new BehaviorSubject(null))
      .refCount();
    _refObservables[refName] = refObs;
    return refObs;
  };

  return {
    close,
    observeRef,
    actions
  };
};

export default startRemoteDataSource;
