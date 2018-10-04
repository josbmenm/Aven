import { Observable, BehaviorSubject } from 'rxjs-compat';
import { default as withObs } from '@nozbe/with-observables';
import SHA1 from 'crypto-js/sha1';
const JSONStringify = require('json-stable-stringify');

export const withObservables = withObs;

class SaveObject {
  constructor({ client, objectId }) {
    this._client = client;
    this._objectId = objectId;
    const value = client.getCachedObjectValue(objectId);
    this._state = {
      _objectId: this._objectId,

      // sync state:
      hasFetched: false,
      lastFetchedTime: null,

      // obj data:
      value,
    };
  }

  getObjectId() {
    return this._objectId;
  }

  fetch = async () => {
    if (this._state.hasFetched) {
      return;
    }
    const result = await this._client.dispatch({
      type: 'getObject',
      domain: this._client.getDomain(),
      id: this._objectId,
    });
    if (!result || result.object == null) {
      throw new Error(`Error fetching object "${this._objectId}" from remote!`);
    }
    this._state.value = result.object;
    this._client.setCachedObjectValue(this._objectId, result.object);
    this._state.hasFetched = true;
    this._state.lastFetchedTime = Date.now();
  };

  put = async () => {
    if (this._state.value == null) {
      throw new Error(
        `Cannot put empty value from object "${this._objectId}"!`,
      );
    }
    const res = await this._client.dispatch({
      type: 'putObject',
      domain: this._client.getDomain(),
      value: this._state.value,
    });
    if (res.id !== this._objectId) {
      // if we get here, we are truly screwed!
      throw new Error(
        `Server and client objectIds do not match! Server: ${res.id}, Client: ${
          this._objectId
        }`,
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
      _name: this._name,

      // sync state:
      hasFetched: false,
      lastFetchedTime: null,
      puttingFromObjectId: null,

      // obj data:
      objectId: null,
    };
  }

  getName() {
    return this._name;
  }

  fetch = async () => {
    const result = await this._client.dispatch({
      type: 'getRef',
      domain: this._client.getDomain(),
      ref: this._name,
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
        }" while another put is in progress!`,
      );
    }
    const fromObjectId = this._state.objectId;
    try {
      this._state.puttingFromObjectId = fromObjectId;
      this._state.objectId = objectId;
      await this._client.dispatch({
        type: 'putRef',
        domain: this._client.getDomain(),
        objectId,
        ref: this._name,
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
        }" while another put is in progress!`,
      );
    }
    const fromObjectId = this._state.objectId;
    try {
      this._state.puttingFromObjectId = fromObjectId;
      this._state.objectId = objectId;
      this._notifyObserved();
      await obj.put();
      await this._client.dispatch({
        type: 'putRef',
        domain: this._client.getDomain(),
        objectId,
        ref: this._name,
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

  observe = Observable.create(observer => {
    observer.next(this._state);
    this.fetch()
      .then(() => {
        observer.next(this._state);
      })
      .catch(e => {
        observer.next(this._state);
        console.error('Could not fetch ref ' + this._name);
        console.error(e);
      });
    if (this._updateObserved) {
      throw new Error(
        `Cannot observe "${
          this._name
        }" because it already is being observed internally, and the observable should be shared!`,
      );
    }
    this._updateObserved = () => {
      observer.next(this._state);
    };
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
    console.log('prevObjectVal ', prevObjectVal);
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

  observeObject = Observable.create(observer => {
    observer.next(this.getObjectValue());
    const sub = this.observe.subscribe({
      next: () => {
        const newObj = this.getObject();
        if (!newObj) {
          observer.next(null);
          return;
        }
        newObj
          .fetch()
          .then(() => {
            observer.next(this.getObjectValue());
          })
          .catch(e => {
            console.error(e);
            console.error(
              `Cannot fetch object "${newObj.id}" while updating ref "${
                this._name
              }"!`,
            );
            observer.error(e);
          });
      },
      error: e => observer.error(e),
      complete: () => observer.complete(),
    });

    const detach = () => {
      sub.unsubscribe();
    };
    return detach;
  }).share();
}

class SaveClient {
  constructor({ host, domain }) {
    this._host = host;
    this._domain = domain;
    this._httpEndpoint = `${host.useSSL === false ? 'http' : 'https'}://${
      host.authority
    }/dispatch`;
    this._wsEndpoint = `${host.useSSL === false ? 'ws' : 'wss'}://${
      host.authority
    }`;
    this._isConnected = new BehaviorSubject(false);
    this.isConnected = this._isConnected.share();

    this._connectWS();
    setTimeout(() => {
      this._isConnected.next(true);
    }, 2000);
    setTimeout(() => {
      this._isConnected.next(false);
    }, 3000);
  }

  _connectWS = () => {
    // this._ws = new ReconnectingWebSocket('ws://smoothiepi:8080', [], {
    //   // debug: true,
    //   maxReconnectionDelay: 10000,
    //   minReconnectionDelay: 1000,
    //   minUptime: 5000,
    //   reconnectionDelayGrowFactor: 1.3,
    //   connectionTimeout: 4000,
    //   maxRetries: Infinity,
    // });
    // setInterval(() => {
    //   // wow, the shame of an interval! please don't be inspired by this..
    //   if (this._ws.readyState === ReconnectingWebSocket.CLOSED) {
    //     this._ws.reconnect(47, 'you hung up on me!');
    //   }
    //   const isConnected = this._ws.readyState === ReconnectingWebSocket.OPEN;
    //   if (this.state.isConnected !== isConnected) {
    //     this.setState(last => ({ ...last, isConnected }));
    //   }
    // }, 500);
    // this._wsClientId = null;
    // this._ws.onopen = () => {
    //   console.log('Connected to Truck!');
    // };
    // this._ws.onmessage = msg => {
    //   const evt = JSON.parse(msg.data);
    //   switch (evt.type) {
    //     case 'ClientId': {
    //       this._wsClientId = evt.clientId;
    //       console.log('ClientId', this._wsClientId);
    //       return;
    //     }
    //     case 'OrderStatus': {
    //       this.setState(state => ({
    //         orders: {
    //           ...state.orders,
    //           [evt.orderId]: evt.order,
    //         },
    //       }));
    //     }
    //     default: {
    //       console.log(evt);
    //       return;
    //     }
    //   }
    // };
  };

  dispatch = async action => {
    const res = await fetch(this._httpEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action),
    });

    if (res.status >= 400) {
      throw new Error(await res.text());
    }
    let result = await res.text();
    try {
      result = JSON.parse(result);
    } catch (e) {
      console.warn('Expecting JSON but could not parse: ' + result);
    }
    console.log('📣', action);
    console.log('💨', result);

    return result;
  };

  _refs = {};
  _objects = {};
  _objectValues = {};

  getDomain = () => this._domain;

  getCachedObjectValue = objectId => {
    return this._objectValues[objectId];
  };
  setCachedObjectValue = (objectId, objValue) => {
    if (this._objectValues[objectId] == null) {
      this._objectValues[objectId] = objValue;
    }
  };

  getObject = objectId => {
    if (this._objects[objectId]) {
      return this._objects[objectId];
    }
    return (this._objects[objectId] = new SaveObject({
      client: this,
      objectId,
    }));
  };

  createObject = value => {
    const valueString = JSONStringify(value);
    const id = SHA1(valueString).toString();
    this.setCachedObjectValue(id, value);
    console.log(JSONStringify(value), id);
    return this.getObject(id);
  };

  getRef = name => {
    if (this._refs[name]) {
      return this._refs[name];
    }
    return (this._refs[name] = new SaveRef({ client: this, name }));
  };
}

export default SaveClient;
