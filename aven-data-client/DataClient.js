import { Observable, BehaviorSubject, Subject } from "rxjs-compat";
import { default as withObs } from "@nozbe/with-observables";
import SHA1 from "crypto-js/sha1";
import ReconnectingWebSocket from "reconnecting-websocket";
const JSONStringify = require("json-stable-stringify");

export const withObservables = withObs;

const observeNull = Observable.create(observer => {});

class SaveObject {
  constructor({ client, objectId }) {
    this._client = client;
    this._objectId = objectId;

    this._state = {
      objectId: this.objectId,

      // sync state:
      lastFetchedTime: null,
      lastPutTime: null,

      // obj data:
      value: null
    };
    this.observe = new BehaviorSubject(this._state);
  }

  provideValue = value => {
    if (this._state.value !== null) {
      return;
    }
    this._setState({
      value
    });
  };

  _setState = newVals => {
    this._state = {
      ...this._state,
      ...newVals
    };
    this.observe.next(this._state);
  };

  getObjectId() {
    return this._objectId;
  }

  observeValue = Observable.create(observer => {
    this.fetch()
      .then(() => {
        observer.next(this._state.value);
        observer.complete();
      })
      .catch(e => observer.error(e));
  });

  fetch = async () => {
    if (this._state.value !== null) {
      return;
    }
    const result = await this._client.dispatch({
      type: "getObject",
      domain: this._client.getDomain(),
      id: this._objectId
    });
    if (!result || result.object == null) {
      throw new Error(`Error fetching object "${this._objectId}" from remote!`);
    }
    this._setState({
      value: result.object,
      lastFetchedTime: Date.now()
    });
  };

  put = async () => {
    if (this._state.value == null) {
      throw new Error(
        `Cannot put empty value from object "${this._objectId}"!`
      );
    }
    const res = await this._client.dispatch({
      type: "putObject",
      domain: this._client.getDomain(),
      value: this._state.value
    });
    if (res.id !== this._objectId) {
      // if we get here, we are truly screwed!
      throw new Error(
        `Server and client objectIds do not match! Server: ${res.id}, Client: ${
          this._objectId
        }`
      );
    }
    return res;
  };

  getValue() {
    return this._state.value;
  }
}

class SaveRef {
  constructor({ client, name }) {
    this._client = client;
    this._name = name;

    this._isWatching = false;
    this._state = {
      name: this._name,

      // sync state:
      lastFetchedTime: null,
      puttingFromObjectId: null,

      // obj data:
      objectId: null
    };
  }

  getName() {
    return this._name;
  }

  fetch = async () => {
    const result = await this._client.dispatch({
      type: "getRef",
      domain: this._client.getDomain(),
      ref: this._name
    });
    this._state.objectId = result.id;
    this._state.hasFetched = true;
    this._state.lastFetchedTime = Date.now();
  };

  fetchObject = async () => {
    // todo, avoid fetch if this._isWatching and client is connected
    await this.fetch();
    const obj = this.getObject();
    if (!obj) {
      return;
    }
    await obj.fetch();
  };

  _updateObserved = null;
  _notifyObserved = () => {
    this._updateObserved && this._updateObserved();
  };

  putObjectId = async objectId => {
    if (this._state.puttingFromObjectId) {
      throw new Error(
        `Cannot putObjectId of "${
          this._name
        }" while another put is in progress!`
      );
    }
    const fromObjectId = this._state.objectId;
    try {
      this._state.puttingFromObjectId = fromObjectId;
      this._state.objectId = objectId;
      await this._client.dispatch({
        type: "putRef",
        domain: this._client.getDomain(),
        objectId,
        ref: this._name
      });
      this._state.puttingFromObjectId = null;
      this._notifyObserved();
    } catch (e) {
      this._state.puttingFromObjectId = null;
      this._state.objectId = fromObjectId;
      this._notifyObserved();
      console.error(e);
      throw new Error(`Failed to putObjectId of "${this._name}"!`);
    }
  };

  putObject = async obj => {
    const objectId = obj.getObjectId();
    if (this._state.puttingFromObjectId) {
      throw new Error(
        `Cannot putObjectId of "${
          this._name
        }" while another put is in progress!`
      );
    }
    const fromObjectId = this._state.objectId;
    try {
      this._state.puttingFromObjectId = fromObjectId;
      this._state.objectId = objectId;
      this._notifyObserved();
      await obj.put();
      await this._client.dispatch({
        type: "putRef",
        domain: this._client.getDomain(),
        objectId,
        ref: this._name
      });
      this._state.puttingFromObjectId = null;
      this._notifyObserved();
    } catch (e) {
      this._state.puttingFromObjectId = null;
      this._state.objectId = fromObjectId;
      this._notifyObserved();
      console.error(e);
      throw new Error(`Failed to putObjectId of "${this._name}"!`);
    }
  };

  $handleRefEvent = evt => {
    if (evt.objectId === this._state.objectId) {
      return;
    }
    if (this._state.puttingFromObjectId) {
      console.error("remote event while putting!", {
        remoteId: env.objectId,
        localNewId: this._state.objectId,
        localLastId: this._state.puttingFromObjectId
      });
      // this probably means a conflict is happening
    }
    this._state.objectId = evt.objectId;
    this._notifyObserved();
  };

  observe = Observable.create(observer => {
    observer.next(this._state);
    this.fetch()
      .then(() => {
        observer.next(this._state);
      })
      .catch(e => {
        observer.next(this._state);
        console.error("Could not fetch ref " + this._name);
        console.error(e);
      });
    if (this._updateObserved) {
      throw new Error(
        `Cannot observe "${
          this._name
        }" because it already is being observed internally, and the observable should be .share()'d!`
      );
    }
    this._updateObserved = () => {
      observer.next(this._state);
    };
    this._client.subscribeUpstreamRef(this);
    this._isWatching = true;
    console.log(`👓 Watching "${this._name}"`);
    const detach = () => {
      console.log(`✋ Done watching "${this._name}"`);
      this._isWatching = false;
      this._updateObserved = null;
    };
    return detach;
  }).share();

  write = async transactionFn => {
    await this.fetchObject();
    const prevObjectVal = this.getObjectValue();
    const nextVal = transactionFn(prevObjectVal);
    const nextObj = this._client.createObject(nextVal);
    await this.putObject(nextObj);
  };

  getObject = () => {
    if (!this._state.objectId) {
      return null;
    }
    return this._client.getObject(this._state.objectId);
  };

  getObjectValue = () => {
    const obj = this.getObject();
    if (!obj) {
      return null;
    }
    return obj.getValue();
  };

  observeObjectValue = this.observe
    .map(r => {
      if (!r.objectId) {
        return observeNull;
      }
      const obj = this._client.getObject(r.objectId);
      return obj.observeValue;
    })
    .switch();
}

class DataClient {
  constructor({ host, domain }) {
    this._host = host;
    this._domain = domain;
    this._httpEndpoint = `${host.useSSL === false ? "http" : "https"}://${
      host.authority
    }/dispatch`;
    this._wsEndpoint = `${host.useSSL === false ? "ws" : "wss"}://${
      host.authority
    }`;
    this._isConnected = new BehaviorSubject(false);
    this.isConnected = this._isConnected.share();
    this._wsMessages = new Subject();
    this.socketMessages = this._wsMessages.share();
    this._connectWS();
  }

  dispatch = async action => {
    const res = await fetch(this._httpEndpoint, {
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
      console.warn("Expecting JSON but could not parse: " + result);
    }
    console.log("📣", action);
    console.log("💨", result);

    return result;
  };

  _refs = {};
  _objects = {};

  getDomain = () => this._domain;

  getObject = objectId => {
    if (this._objects[objectId]) {
      return this._objects[objectId];
    }
    return (this._objects[objectId] = new SaveObject({
      client: this,
      objectId
    }));
  };

  createObject = value => {
    const valueString = JSONStringify(value);
    const objectId = SHA1(valueString).toString();
    const obj = this.getObject(objectId);
    obj.provideValue(value);
    return obj;
  };

  getRef = name => {
    if (this._refs[name]) {
      return this._refs[name];
    }
    return (this._refs[name] = new SaveRef({ client: this, name }));
  };

  _ws = null;

  _socketSendIfConnected = payload => {
    if (this._ws && this._ws.readyState === ReconnectingWebSocket.OPEN) {
      this._ws.send(JSON.stringify({ ...payload, clientId: this._wsClientId }));
    }
  };

  _connectWS = () => {
    if (this._ws) {
      throw new Error("ws already here!");
    }
    this._ws = new ReconnectingWebSocket(this._wsEndpoint, [], {
      // debug: true,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      minUptime: 5000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 4000,
      maxRetries: Infinity
    });

    this._wsClientId = null;
    this._ws.onopen = () => {
      // actually we're going to wait for the server to say hello with ClientId
    };
    this._ws.onclose = () => {
      this._isConnected.next(false);
      this._ws = null;
    };
    this._ws.onerror = () => {
      this._isConnected.next(false);
      this._ws = null;
    };
    this._ws.onmessage = msg => {
      const evt = JSON.parse(msg.data);
      switch (evt.type) {
        case "ClientId": {
          this._wsClientId = evt.clientId;
          this._isConnected.next(true);
          const subdRefs = Array.from(this._upstreamSubscribedRefs).map(ref =>
            ref.getName()
          );
          this._socketSendIfConnected({
            type: "SubscribeRefs",
            refs: subdRefs
          });
          console.log("Socket connected with client id: ", this._wsClientId);
          return;
        }
        case "RefUpdate": {
          const ref = this._refs[evt.name];
          ref.$handleRefEvent(evt);
        }
        default: {
          this._wsMessages.next(evt);
          console.log("Unknown ws event:", evt);
          return;
        }
      }
    };
  };

  _upstreamSubscribedRefs = new Set();

  subscribeUpstreamRef = ref => {
    this._socketSendIfConnected({
      type: "SubscribeRefs",
      refs: [ref.getName()]
    });
    this._upstreamSubscribedRefs.add(ref);
  };
  unsubscribeUpstreamRef = ref => {
    this._socketSendIfConnected({
      type: "UnubscribeRefs",
      refs: [ref.getName()]
    });
    this._upstreamSubscribedRefs.delete(ref);
  };
}

export default DataClient;
