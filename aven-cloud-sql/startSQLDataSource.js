import Knex from "knex";
import DomainModel from "./DomainModel";
import ObjectModel from "./ObjectModel";
import RefModel from "./RefModel";
import { BehaviorSubject } from "rxjs-compat";
import createDispatcher from "../aven-cloud/createDispatcher";
import uuid from "uuid/v1";

const crypto = require("crypto");
const stringify = require("json-stable-stringify");

export default async function startSQLDataSource({
  client,
  connection,
  domain
}) {
  const id = uuid();
  const isConnected = new BehaviorSubject(false);
  const knex = Knex({
    client,
    connection,
    useNullAsDefault: true
  });

  const models = {
    Domain: DomainModel.bindKnex(knex),
    Ref: RefModel.bindKnex(knex),
    Object: ObjectModel.bindKnex(knex)
  };

  async function PutRef({ domain, name, id }) {
    const f = await models.Ref.query().upsertGraph(
      {
        name,
        domain,
        id
      },
      {
        insertMissing: true
      }
    );

    _announceRef(domain, name, {
      domain,
      name,
      id
    });
    console.log("made it here at least!", f);
  }
  async function GetRef({ name, domain }) {
    const results = await models.Ref.query()
      .where("name", "=", name)
      .where("domain", "=", domain)
      .limit(1);
    const ref = results[0];
    if (!ref) {
      return null;
    }
    _announceRef(domain, name, {
      domain,
      name,
      id: ref.id
    });
    return ref;
  }

  async function PutObject({ name, domain, value }) {
    const objData = stringify(value);
    const size = objData.length;
    const sha = crypto.createHash("sha1");
    sha.update(objData);
    const id = sha.digest("hex");
    const f = await models.Object.query().upsertGraph(
      {
        id,
        value: objData,
        size
      },
      {
        insertMissing: true
      }
    );
    return { id };
  }
  async function GetObject({ domain, name, id }) {
    const results = await models.Object.query()
      .where("id", "=", id)
      .eager(["value"])
      .limit(1);
    const obj = results[0];
    if (!obj) {
      return { id };
    }
    return {
      id: obj.id,
      object: JSON.parse(obj.value) // todo, use json field when on postgres, (and still provide fallback for sqlite)
    };
  }
  async function GetStatus() {
    return {
      isConnected: isConnected.value
    };
  }
  async function ListRefs({ domain }) {
    const result = await models.Ref.query().where("domain", "=", domain);
    return result.map(r => r.name);
  }
  async function ListDomains({}) {
    const result = await models.Domain.query();
    return result.map(r => r.name);
  }
  async function ListObjects() {}
  async function DestroyRef() {}
  async function CollectGarbage() {}
  async function ListRefObjects() {}
  async function close() {
    await knex.destroy();
  }

  const subscriptionPolicy = "local"; // todo, check 'client', and add support for postgres pub sub

  const _localSubscriptions = {};
  function _getLocalRef(domain, name) {
    const d = _localSubscriptions[domain] || (_localSubscriptions[domain] = {});
    const r = d[name] || (d[name] = {});
    return r;
  }
  function _announceLocalRef(domain, name, ref) {
    const r = _getLocalRef(domain, name);
    if (r.behavior) {
      if (r.behavior.value.id === ref.id) {
        return;
      }
      r.behavior.next(ref);
    } else {
      r.behavior = new BehaviorSubject(ref);
    }
  }
  function _observeLocalRef(domain, name) {
    const r = _getLocalRef(domain, name);
    if (!r.behavior) {
      r.behavior = new BehaviorSubject({ domain, name, id: null });
    }
    if (!r.behavior.value.id) {
      GetRef({ domain, name }).catch(console.error);
    }
    return r.behavior;
  }
  function _announceRef(domain, name, ref) {
    if (subscriptionPolicy === "local") {
      return _announceLocalRef(domain, name, ref);
    }
    throw new Error(`Unsupported subscription policy "${subscriptionPolicy}"`);
  }

  async function observeRef(domain, name) {
    if (subscriptionPolicy === "local") {
      return _observeLocalRef(domain, name);
    }
    throw new Error(`Unsupported subscription policy "${subscriptionPolicy}"`);
  }

  return {
    isConnected,
    close,
    observeRef,
    dispatch: createDispatcher({
      PutRef,
      PutObject,
      GetObject,
      GetRef,
      GetStatus,
      ListDomains,
      ListRefs,
      ListObjects,
      DestroyRef,
      CollectGarbage,
      ListRefObjects
    }),
    id
  };
}
