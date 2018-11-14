import { Observable, BehaviorSubject } from "rxjs-compat";
const crypto = require("crypto");
const stringify = require("json-stable-stringify");

function _renderRef({ id, isPublic, owner }) {
  // this strips out hidden features of the ref and snapshots the referenced values
  return {
    id: id || null,
    isPublic: isPublic || true,
    owner: owner || null
  };
}

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

  function _getRef(name) {
    const r = _refs[name] || (_refs[name] = {});
    r.objects = r.objects || {};
    return r;
  }

  const isConnected = new BehaviorSubject(true);

  if (dataSourceDomain == null) {
    throw new Error(`Empty domain passed to startMemoryDataSource`);
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
    const r = _getRef(name);
    if (r.id === id) {
      return; // avoid calling behavior.next if the ID hasn't changed
      // todo, respect owner and permissions here
    }
    r.id = id;
    r.owner = owner;
    r.isPublic = true;
    r.objects[id] = true;
    if (r.behavior) {
      r.behavior.next(_renderRef(r));
    } else {
      r.behavior = new BehaviorSubject(_renderRef(r));
    }
  }

  async function DestroyRef({ domain, name }) {
    if (domain === undefined || name === undefined) {
      throw new Error("Invalid use. ", { domain, name, id });
    }
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    const r = _getRef(name);
    r.objects = {};
    r.id = null;
    r.owner = null;
    if (r.behavior) {
      r.behavior.next(_renderRef(r));
    } else {
      r.behavior = new BehaviorSubject(_renderRef(r));
    }
  }

  async function GetObject({ domain, name, id }) {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    const r = _getRef(name);

    if (r.objects[id] && _objects[id] !== undefined) {
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

  function _isValidName(name) {
    return typeof name === "string" && name.length > 0;
  }

  async function PutObject({ value, name, domain }) {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    if (!_isValidName(name)) {
      throw new Error(
        `Invalid ref name "${name}", must be provided with PutObject`
      );
    }
    const objData = stringify(value);
    const size = objData.length;
    const sha = crypto.createHash("sha1");
    sha.update(objData);
    const id = sha.digest("hex");
    if (_objects[id] === undefined) {
      _objects[id] = value;
    }
    if (_objectsSize[id] === undefined) {
      _objectsSize[id] = size;
    }
    const r = _getRef(name);
    r.objects[id] = true;
    return { id };
  }

  async function GetRef({ domain, name }) {
    if (domain !== dataSourceDomain) {
      return null;
    }
    const r = _getRef(name);
    return _renderRef(r);
  }

  async function ListRefObjects({ domain, name }) {
    if (domain !== dataSourceDomain) {
      return [];
    }
    const r = _getRef(name);
    return Object.keys(r.objects);
  }

  async function ListRefs({ domain }) {
    if (domain !== dataSourceDomain) {
      return [];
    }
    return Object.keys(_refs);
  }

  async function ListObjects({ domain, name }) {}

  async function CollectGarbage() {
    // create list of all objects
    // for each ref
    //   remove all of Object.keys(r.objects) from list of objects
    // delete each object in the list
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
    GetStatus,
    ListRefs,
    ListObjects,
    DestroyRef,
    CollectGarbage,
    ListRefObjects
  };

  const close = () => {
    _objects = null;
    _objectsSize = null;
    _refs = null;
  };
  const observeRef = async (domain, name) => {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    const r = _getRef(name);
    if (r.behavior) {
      return r.behavior;
    } else {
      return (r.behavior = new BehaviorSubject(_renderRef(r)));
    }
  };
  return {
    isConnected,
    close,
    observeRef,
    dispatch: createDispatcher(actions)
  };
};

export default startMemoryDataSource;
