import Knex from 'knex';
import getDomainModel from './getDomainModel';
import getBlockModel from './getBlockModel';
import getDocModel from './getDocModel';
import { BehaviorSubject } from 'rxjs-compat';
import createDispatcher from '../aven-cloud-utils/createDispatcher';
import uuid from 'uuid/v1';

const crypto = require('crypto');
const stringify = require('json-stable-stringify');

export default async function startSQLDataSource({ config, connection }) {
  const id = uuid();
  const isConnected = new BehaviorSubject(false);
  const knex = Knex({
    ...config,
    useNullAsDefault: true,
    afterCreate: (connection, done) => {
      isConnected.next(true);
      done(null, connection);
    },
  });

  async function GetDoc({ name, domain }) {
    const results = await models.Doc.query()
      .where('name', '=', name)
      .where('domainName', '=', domain)
      .limit(1);
    const doc = results[0];
    if (!doc) {
      return {};
    }
    const renderedDoc = {
      domain,
      name,
      id: doc.currentBlock,
    };
    _announceDoc(domain, name, renderedDoc);
    return renderedDoc;
  }

  const models = {};
  models.Domain = getDomainModel(models).bindKnex(knex);
  models.Block = getBlockModel(models).bindKnex(knex);
  models.Doc = getDocModel(models).bindKnex(knex);

  async function PutDoc({ domain, name, id }) {
    await models.Doc.query().upsertGraph(
      {
        name,
        currentBlock: id,

        // seems silly but we have to have the value AND the relation here.
        domain: { name: domain }, // the relation is here for insertMissing to insert the domain if it doesn't already exist
        domainName: domain, // value is used by objection to identify this row, (see getDocModel idColumn)
      },
      {
        relate: true,
        insertMissing: true,
      }
    );
    _announceDoc(domain, name, {
      domain,
      name,
      id,
    });
  }

  async function PutBlock({ name, domain, value }) {
    const blockData = stringify(value);
    const size = blockData.length;
    const sha = crypto.createHash('sha1');
    sha.update(blockData);
    const id = sha.digest('hex');
    try {
      await models.Block.query().insertGraph(
        {
          id,
          value: blockData,
          size,
        },
        {
          insertMissing: true,
        }
      );
    } catch (e) {
      // blocks are unique and immutable

      // handle postgres expected error
      if (e.code !== '23505' || e.constraint !== 'blocks_id_unique') {
        // handle sqlite expected error
        if (e.code !== 'SQLITE_CONSTRAINT') {
          throw e;
        }
      }
    }

    return { id };
  }

  async function GetBlock({ domain, name, id }) {
    const results = await models.Block.query()
      .where('id', '=', id)
      .eager(['value'])
      .limit(1);
    const block = results[0];
    if (!block) {
      return { id };
    }
    return {
      id: block.id,
      value: JSON.parse(block.value), // todo, use json field when on postgres, (and still provide fallback for sqlite)
    };
  }

  async function GetStatus() {
    return {
      isConnected: isConnected.value,
    };
  }

  async function ListDocs({ domain }) {
    const result = await models.Doc.query().where('domainName', '=', domain);
    return result.map(r => r.name);
  }

  async function ListDomains() {
    const result = await models.Domain.query();
    return result.map(r => r.name);
  }

  async function DestroyDoc({ domain, name }) {
    const numDeleted = await models.Doc.query()
      .where('name', '=', name)
      .where('domainName', '=', domain)
      .delete();
  }

  async function CollectGarbage() {}

  async function close() {
    isConnected.next(false);
    await knex.destroy();
  }

  const subscriptionPolicy = 'local'; // todo, check 'client', and add support for postgres pub sub

  const _localSubscriptions = {};
  function _getLocalDoc(domain, name) {
    const d = _localSubscriptions[domain] || (_localSubscriptions[domain] = {});
    const r = d[name] || (d[name] = {});
    return r;
  }
  function _announceLocalDoc(domain, name, doc) {
    const r = _getLocalDoc(domain, name);
    if (r.behavior) {
      if (r.behavior.value.id === doc.id) {
        return;
      }
      r.behavior.next(doc);
    } else {
      r.behavior = new BehaviorSubject(doc);
    }
  }
  function _observeLocalDoc(domain, name) {
    const r = _getLocalDoc(domain, name);
    if (!r.behavior) {
      r.behavior = new BehaviorSubject({ domain, name, id: null });
    }
    if (!r.behavior.value.id) {
      GetDoc({ domain, name }).catch(console.error);
    }
    return r.behavior;
  }
  function _announceDoc(domain, name, doc) {
    if (subscriptionPolicy === 'local') {
      return _announceLocalDoc(domain, name, doc);
    }
    throw new Error(`Unsupported subscription policy "${subscriptionPolicy}"`);
  }

  async function observeDoc(domain, name) {
    if (subscriptionPolicy === 'local') {
      return _observeLocalDoc(domain, name);
    }
    throw new Error(`Unsupported subscription policy "${subscriptionPolicy}"`);
  }

  return {
    isConnected,
    close,
    observeDoc,
    dispatch: createDispatcher({
      PutDoc,
      PutBlock,
      GetBlock,
      GetDoc,
      GetStatus,
      ListDomains,
      ListDocs,
      DestroyDoc,
      CollectGarbage,
    }),
    id,
  };
}
