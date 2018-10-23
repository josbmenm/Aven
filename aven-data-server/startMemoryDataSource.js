import { Observable, BehaviorSubject } from "rxjs-compat";
const crypto = require("crypto");
const stringify = require("json-stable-stringify");

const _getRef = ({ objectId, isPublic, owner }) => {
  // this strips out hidden features of the ref and snapshots the references
  return {
    objectId,
    isPublic,
    owner
  };
};

const startMemoryDataSource = opts => {
  const dataSourceDomain = opts.domain;
  const _objects = {};
  const _objectsSize = {};
  const _refs = {};

  async function putRef({ domain, ref, objectId, owner }) {
    if (domain === undefined || ref === undefined) {
      throw new Error("Invalid use. ", { domain, ref, objectId });
    }
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    const r = _refs[ref] || (_refs[ref] = {});
    r.objectId = objectId;
    r.owner = owner;
    r.isPublic = true;
    if (r.behavior) {
      r.behavior.next(_getRef(r));
    } else {
      r.behavior = new BehaviorSubject(_getRef(r));
    }
  }

  async function getObject({ id }) {
    if (_objects[id]) {
      return {
        id,
        object: _objects[id]
      };
    }
    return null;
  }
  async function putObject({ object, ref, domain }) {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    const objData = stringify(object);
    const size = objData.length;
    const sha = crypto.createHash("sha1");
    sha.update(objData);
    const id = sha.digest("hex");
    _objects[id] = object;
    _objectsSize[id] = size;
    return { id };
  }
  async function getRef({ domain, ref }) {
    if (domain !== dataSourceDomain) {
      return null;
    }
    const r = _refs[ref];
    if (r) {
      return {
        id: r.objectId,
        ref: ref,
        domain,
        owner: r.owner,
        isPublic: r.isPublic
      };
    }
    return null;
  }

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
  const close = () => {};
  const observeRef = (refName, domain) => {
    if (domain !== dataSourceDomain) {
      throw new Error(
        `Invalid domain "${domain}", must use "${dataSourceDomain}" with this memory data source`
      );
    }
    const r = _refs[refName];
    if (r && r.behavior) {
      return r.behavior;
    }
    throw new Error(
      `cannot observe ref "${refName}" because it cannot be found`
    );
  };
  return {
    close,
    observeRef,
    actions
  };
};

export default startMemoryDataSource;
