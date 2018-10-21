import { Observable } from "rxjs-compat";
const crypto = require("crypto");
const stringify = require("json-stable-stringify");

const startMemoryDataSource = () => {
  const _objects = {};
  const _objectsSize = {};
  const _domains = {};
  async function _getDomain(domainName) {
    if (_domains[domainName]) {
      return _domains[domainName];
    }
    return (_domains[domainName] = { refs: {} });
  }

  async function putRef({ domain, ref, objectId, owner }) {
    const d = _getDomain(domain);
    const r = d.refs[ref] || (d.refs[ref] = {});
    r.id = objectId;
    r.owner = owner;
    r.isPublic = true;
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
  async function putObject({ object }) {
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
    const d = _getDomain(domain);
    const r = d.refs[ref];
    if (r) {
      return { id: r.id, ref, domain, owner: r.owner, isPublic: r.isPublic };
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
  const observeRef = refName => {
    return Observable.create(observer => {});
  };
  return {
    close,
    observeRef,
    actions
  };
};

export default startMemoryDataSource;
