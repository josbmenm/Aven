import { Observable, Subject } from 'rxjs-compat';
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
      this._updateObserved && this._updateObserved();
      await this._client.dispatch({
        type: 'putRef',
        domain: this._client.getDomain(),
        objectId,
        ref: this._name,
      });
      this._state.puttingFromObjectId = null;
      this._updateObserved && this._updateObserved();
    } catch (e) {
      this._state.puttingFromObjectId = null;
      this._state.objectId = fromObjectId;
      this._updateObserved && this._updateObserved();
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
      this._updateObserved();
      await obj.put();
      await this._client.dispatch({
        type: 'putRef',
        domain: this._client.getDomain(),
        objectId,
        ref: this._name,
      });
      this._state.puttingFromObjectId = null;
      this._updateObserved();
    } catch (e) {
      this._state.puttingFromObjectId = null;
      this._state.objectId = fromObjectId;
      this._updateObserved();
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
  constructor(opts) {
    this._host = opts.host;
    this._domain = opts.domain;
    this._endpoint = `${opts.host}/dispatch`;
  }

  dispatch = async action => {
    const res = await fetch(this._endpoint, {
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
    const result = await res.json();
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
