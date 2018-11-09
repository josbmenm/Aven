import { Observable, BehaviorSubject } from "rxjs-compat";
const crypto = require("crypto");
const stringify = require("json-stable-stringify");

const _getRef = ({ id, isPublic, owner }) => {
  // this strips out hidden features of the ref and snapshots the references
  return {
    id: id || null,
    isPublic: isPublic || true,
    owner: owner || null
  };
};

const createDispatcher = actions => action => {
  if (actions[action.type]) {
    return actions[action.type](action);
  }
  throw new Error(`Cannot find action "${action.type}"`);
};

const startMemoryDataSource = (opts = {}) => {
  const dataSourceDomain = opts.domain;
  let _objects = {};
  let _objectsSize = {};
  let _refs = {};

  const isConnected = new BehaviorSubject(true);

  if (dataSourceDomain == null) {
    throw new Error(`Empty domapin passed to startMemoryDataSource`);
  }

  async function PutRef({ domain, name, id, owner }) {
    if (domain === undefined || name === undefined) {
      throw new Error("Invalid use. ", { domain, name, id });
    }
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    const r = _refs[name] || (_refs[name] = {});
    if (r.id === id) {
      return; // avoid calling behavior.next if the ID hasn't changed
      // todo, respect owner and permissions here
    }
    r.id = id;
    r.owner = owner;
    r.isPublic = true;
    if (r.behavior) {
      r.behavior.next(_getRef(r));
    } else {
      r.behavior = new BehaviorSubject(_getRef(r));
    }
  }

  async function GetObject({ id }) {
    if (_objects[id] !== undefined) {
      return {
        id,
        object: _objects[id]
      };
    }
    return {
      id,
      object: undefined
    };
  }

  async function PutObject({ value, ref, domain }) {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    const objData = stringify(value);
    const size = objData.length;
    const sha = crypto.createHash("sha1");
    sha.update(objData);
    const id = sha.digest("hex");
    _objects[id] = value;
    _objectsSize[id] = size;
    return { id };
  }

  async function GetRef({ domain, name }) {
    if (domain !== dataSourceDomain) {
      return null;
    }
    const r = _refs[name];
    if (r) {
      return {
        id: r.id,
        name,
        domain,
        owner: r.owner,
        isPublic: r.isPublic
      };
    }
    return null;
  }

  const GetStatus = () => ({
    ready: true,
    connected: true,
    migrated: true
  });

  const actions = {
    PutRef,
    PutObject,
    GetObject,
    GetRef,
    GetStatus
  };

  const close = () => {
    _objects = null;
    _objectsSize = null;
    _refs = null;
  };
  const observeRef = async (domain, refName) => {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    let r = _refs[refName];
    if (r) {
      return r.behavior;
    }
    r = _refs[refName] = {};
    r.behavior = new BehaviorSubject(_getRef(r));
    return r.behavior;
  };
  return {
    isConnected,
    close,
    observeRef,
    dispatch: createDispatcher(actions)
  };
};

export default startMemoryDataSource;
