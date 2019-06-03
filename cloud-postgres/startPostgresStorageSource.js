import Knex from 'knex';
import { BehaviorSubject, Observable, Subject } from 'rxjs-compat';
import createDispatcher from '../cloud-utils/createDispatcher';
import cuid from 'cuid';
import getIdOfValue from '../cloud-utils/getIdOfValue';
import { getMaxListDocs } from '../cloud-core/maxListDocs';
import bindCommitDeepBlock from '../cloud-core/bindCommitDeepBlock';
import Err from '../utils/Err';

const pgFormat = require('pg-format');

const { Client } = require('pg');

const stringify = require('json-stable-stringify');
const pathJoin = require('path').join;

export default async function startPostgresStorageSource({ config, domains }) {
  if (!domains || !domains.length) {
    throw new Err(
      'Domains must be specified when creating a postgres storage source',
      'DomainConfiguration',
    );
  }
  const id = `postgres-${cuid()}`;

  const TOP_PARENT_ID = 0; // hacky approach to handle top-level parents and still enforce uniqueness properly on the docs table.

  const isConnected = new BehaviorSubject(false);

  const observingChannels = {};

  const pgClient = new Client(config.connection);

  let handleClose = () => {};

  pgClient.connect(function(err, client, done) {
    if (err) {
      console.error(err);
      return;
    }

    client.on('notification', msg => {
      const { payload, channel: channelId } = msg;
      const payloadData = JSON.parse(payload);
      const channel = observingChannels[channelId];
      if (channel && channel.notifier) {
        channel.notifier.next(payloadData);
      } else {
        console.error('undeliverable pg notification!', msg);
      }
    });

    // call the existing closer, if by any chance it actually does anything
    handleClose();
    handleClose = () => {
      // sadly this is needed to clean up the notification subscription, knex.destroy doesn't do it for us..
      client.end().catch(console.error);
    };
  });

  const knex = Knex({
    ...config,
    useNullAsDefault: true,
    pool: {
      afterCreate: async (connection, done) => {
        try {
          //Insert Domains in Bulk here
          let values = await getValues(domains);
          let query =
            'INSERT INTO domains (name) VALUES ' +
            values +
            'ON CONFLICT (name) DO NOTHING;';
          await connection.query(query);

          // shamefully doing this here, to make sure the reference always exists and no other docs claim this id:
          await connection.query(`
          INSERT INTO docs ("docId") VALUES (${TOP_PARENT_ID}) ON CONFLICT ("docId") DO NOTHING;
        `);

          isConnected.next(true);
          done(null, connection);
        } catch (e) {
          console.error('Error on DB setup:', e);
          done(e, connection);
        }
      },
    },
  });

  async function getValues(data) {
    return data.map(d => "('" + d + "')").join(',');
  }

  async function getDocDBContext(domain, docName, forceExistence) {
    if (!docName) {
      return {
        didCreate: false,
        parent: null,
        parentId: null,
        domain,
        id: TOP_PARENT_ID,
        localName: null,
        name: null,
      };
    }
    let didCreate = false;
    const docNameParts = docName.split('/');
    const lastName = docNameParts[0];
    if (lastName === docName) {
      let id = null;
      const idResult = await knex.raw(
        `
      SELECT "docId" FROM docs WHERE "name" = :name AND "parentId" = :parentId AND "domainName" = :domain
    `,
        { name: docName, parentId: TOP_PARENT_ID, domain },
      );
      if (idResult.rowCount === 1) {
        id = idResult.rows[0].docId;
      } else if (forceExistence) {
        const creationResult = await knex.raw(
          `INSERT INTO docs ("name", "domainName", "parentId", "currentBlock") VALUES (:name, :domain, :parentId, NULL) RETURNING "docId";`,
          { parentId: TOP_PARENT_ID, domain, name: docName },
        );
        id = creationResult.rows[0].docId;
        didCreate = true;
      }
      if (didCreate) {
        notifyDocCreation(domain, docName);
      }
      return {
        didCreate,
        domain,
        name: docName,
        localName: docName,
        id,
        parent: null,
        parentId: TOP_PARENT_ID,
      };
    }
    const parentName = docNameParts.slice(0, -1).join('/');
    const parentContext = await getDocDBContext(
      domain,
      parentName,
      forceExistence,
    );
    const localName = docNameParts[docNameParts.length - 1];

    if (!parentContext.id) {
      return {
        parent: parentContext,
        id: null,
        localName,
        name: docName,
        parentId: TOP_PARENT_ID,
      };
    }

    let id = null;
    const idResult = await knex.raw(
      `
    SELECT "docId" FROM docs WHERE "name" = :name AND "parentId" = :parentId AND "domainName" = :domain
  `,
      { name: localName, parentId: parentContext.id, domain },
    );
    if (idResult.rowCount === 1) {
      id = idResult.rows[0].docId;
    } else if (forceExistence) {
      const creationResult = await knex.raw(
        `INSERT INTO docs ("name", "domainName", "parentId", "currentBlock") VALUES (:name, :domain, :parentId, NULL) RETURNING "docId";`,
        { parentId: parentContext.id, domain, name: localName },
      );
      didCreate = true;
      id = creationResult.rows[0].docId;
    }
    if (didCreate) {
      notifyDocCreation(domain, docName);
    }
    return {
      domain,
      name: docName,
      localName,
      id,
      parent: parentContext,
      parentId: (parentContext && parentContext.id) || null,
      didCreate,
    };
  }

  async function commitBlock(value, refs) {
    if (value === undefined) {
      throw new Err('Undefined value provided to commitBlock', 'EmptyValue', {
        value,
      });
    }
    const blockData = stringify(value);
    if (!blockData) {
      console.error(
        'Stringification error while serializing this value:',
        value,
      );
      throw new Err('Internal Server Error', 'InternalError1', {});
    }
    const size = blockData.length;
    const id = getIdOfValue(value);
    const storedValue = { value, refs };
    if (id === undefined) {
      throw new Error('Bad ID!');
    }
    if (storedValue === undefined) {
      throw new Error('Bad Stored Value');
    }
    if (size === undefined) {
      throw new Error('Bad Size');
    }
    const commitArguments = { value: JSON.stringify(storedValue), size, id };
    const doQuery = async () => {
      await knex.raw(
        `
    INSERT INTO blocks ("id","value","size") VALUES (:id, :value, :size)
    ON CONFLICT ON CONSTRAINT "blockIdentity" DO NOTHING
    `,
        commitArguments,
      );
    };
    try {
      await doQuery();
    } catch (e) {
      if (e.message.indexOf('Undefined binding(s)') === -1) {
        throw e;
      }
      console.log('Retrying...!', commitArguments);
      await new Promise(resolve => {
        setTimeout(resolve, 1000 + Math.floor(Math.random() * 2000));
      });
      await doQuery();
    }
    return { id, size };
  }

  const commitDeepBlock = bindCommitDeepBlock(commitBlock);

  async function putBlock(inputValue) {
    const { value, refs } = await commitDeepBlock(inputValue);
    const block = await commitBlock(value, refs);
    return block;
  }

  async function PutBlock({ value, name, domain, id }) {
    if (!name) {
      throw new Err('Invalid doc name for "PutBlock"', 'InvalidDocName', {
        domain,
        name,
      });
    }
    if (!domain) {
      throw new Err('Invalid domain for "PutBlock"', 'InvalidDomain', {
        domain,
      });
    }

    if (value === undefined) {
      throw new Err('Invalid value for "PutBlock"', 'EmptyValue', {
        domain,
        name,
        value,
      });
    }
    // todo, (epic): properly associate these blocks with the provided domain+docName

    const putResult = await putBlock(value);

    if (id && putResult.id !== id) {
      throw new Err(
        `Invalid ID provided for this value. Provided "${id}" but computed id "${
          putResult.id
        }"`,
        'InvalidValueId',
        { id, value },
      );
      // should destroy putResult.id, todo
    }
    return {
      id: putResult.id,
    };
  }

  function getInternalParentId(parentId) {
    return parentId == null ? TOP_PARENT_ID : parentId;
  }

  async function notifyChannel(channelId, payload) {
    const channel = observingChannels[channelId];
    if (channel && channel.notifier) {
      channel.notifier.next(payload);
    }
    await knex.raw(`NOTIFY "${channelId}", ${pgFormat.literal(payload)}`);
  }

  async function notifyDocCreation(domain, docName) {
    const ctx = await getDocDBContext(domain, docName);
    const channelId = getChildrenChannel(domain, ctx.parentId);
    const payload = JSON.stringify({
      type: 'AddChildDoc',
      name: ctx.localName,
      domain,
    });
    await notifyChannel(channelId, payload);
  }

  async function notifyDocDestroy(domain, docName) {
    const ctx = await getDocDBContext(domain, docName);
    const channelId = getChildrenChannel(domain, ctx.parentId);
    const payload = JSON.stringify({
      type: 'DestroyChildDoc',
      name: ctx.localName,
      domain,
    });
    await notifyChannel(channelId, payload);
  }

  async function notifyDocWrite(
    domain,
    parentId,
    docName,
    currentBlockId,
    valueForNotification,
  ) {
    const channelId = getDocChannel(domain, parentId, docName);
    const payload = JSON.stringify({
      id: currentBlockId,
      value: valueForNotification,
    });
    await notifyChannel(channelId, payload);
  }

  async function writeDoc(
    domain,
    parentId,
    localName,
    currentBlockId,
    valueForNotification,
  ) {
    const internalParentId = getInternalParentId(parentId);
    try {
      const writeResult = await knex.raw(
        `INSERT INTO docs ("name", "domainName", "currentBlock", "parentId") VALUES (:localName, :domain, :current, :parentId)
          ON CONFLICT ON CONSTRAINT "docIdentity" DO UPDATE SET "prevBlock" = docs."currentBlock", "currentBlock" = :current
          RETURNING "docId", "currentBlock", "prevBlock";`,
        {
          localName,
          domain,
          current: currentBlockId,
          parentId: internalParentId,
        },
      );
      const resultRow = writeResult.rows[0];
      if (resultRow.prevBlock !== currentBlockId) {
        await notifyDocWrite(
          domain,
          internalParentId,
          localName,
          currentBlockId,
          valueForNotification,
        );
      }
    } catch (e) {
      if (e.message.match(/docs_currentblock_foreign/)) {
        throw new Err(
          `Could not PutDoc because doc id "${currentBlockId}" is unknown.`,
          'UknownBlock',
          { blockId: currentBlockId },
        );
      }
      throw e;
    }
  }

  async function writeDocTransaction(
    domain,
    parentId,
    name,
    currentBlock,
    prevCurrentBlock,
    valueForNotification,
  ) {
    const internalParentId = getInternalParentId(parentId);
    let resp = null;
    if (prevCurrentBlock === null) {
      resp = await knex.raw(
        `UPDATE docs SET "currentBlock" = :currentBlock WHERE "name" = :name AND "domainName" = :domain AND "parentId" = :parentId AND "currentBlock" IS NULL RETURNING "currentBlock";
    `,
        {
          name,
          domain,
          currentBlock,
          parentId: internalParentId,
        },
      );
    } else {
      resp = await knex.raw(
        `UPDATE docs SET "currentBlock" = :currentBlock WHERE "name" = :name AND "domainName" = :domain AND "parentId" = :parentId AND "currentBlock" = :prevCurrentBlock RETURNING "currentBlock";
      `,
        {
          name,
          domain,
          currentBlock,
          parentId: internalParentId,
          prevCurrentBlock,
        },
      );
    }
    if (!resp.rows.length) {
      throw new Error('Could not perform this transaction!');
    }
    await notifyDocWrite(
      domain,
      internalParentId,
      name,
      currentBlock,
      valueForNotification,
    );
  }

  async function PutDocValue({ domain, value, name }) {
    if (!name) {
      throw new Err('Invalid doc name for "PutDocValue"', 'InvalidDocName', {
        domain,
        name,
      });
    }
    if (!domain) {
      throw new Err('Invalid domain for "PutDocValue"', 'InvalidDomain', {
        domain,
      });
    }
    if (value === undefined) {
      throw new Err('Undefined doc value', 'InvalidValue', {
        domain,
        name,
        value,
      });
    }
    const { localName, parentId } = await getDocDBContext(domain, name, true);
    if (
      value &&
      typeof value === 'object' &&
      value.type === 'TransactionValue'
    ) {
      const onId = value && value.on && value.on.id;
      const block = await putBlock(value);
      await writeDocTransaction(
        domain,
        parentId,
        localName,
        block.id,
        onId,
        value,
      );
      return { name, id: block.id };
    }
    const block = await putBlock(value);
    const smallEnoughForNotification = block.size && block.size < 1000;
    await writeDoc(
      domain,
      parentId,
      localName,
      block.id,
      smallEnoughForNotification ? value : undefined,
    );
    return {
      name,
      id: block.id,
    };
  }

  async function PutTransactionValue({ domain, value, name }) {
    if (!name) {
      throw new Err(
        'Invalid doc name for "PutTransactionValue"',
        'InvalidDocName',
        { domain, name },
      );
    }
    if (!domain) {
      throw new Err(
        'Invalid domain for "PutTransactionValue"',
        'InvalidDomain',
        { domain },
      );
    }
    // technically this action has a race condition if the prevBlockId changes while we are transacting. But thanks to the "where" inside writeDocTransaction, we will never loose data, will only error occasionally when doing this action concurrently on a doc
    const { localName, parentId, id } = await getDocDBContext(
      domain,
      name,
      true,
    );
    const prevResp = await knex.raw(
      `SELECT "docId", "currentBlock" FROM docs WHERE "parentId" = :parentId AND "domainName" = :domain AND "name" = :name;`,
      { parentId: getInternalParentId(parentId), domain, name: localName },
    );
    const prevBlockId =
      (prevResp.rows[0] && prevResp.rows[0].currentBlock) || null;
    const on = prevBlockId ? { id: prevBlockId, type: 'BlockReference' } : null;
    const finalValue = {
      type: 'TransactionValue',
      on,
      value,
    };
    const block = await putBlock(finalValue);
    await writeDocTransaction(
      domain,
      parentId,
      localName,
      block.id,
      prevBlockId,
    );
    return {
      name,
      id: block.id,
    };
  }

  async function GetDocValue({ domain, name }) {
    const doc = await GetDoc({ name, domain });
    let value = undefined;
    if (doc.id) {
      const block = await GetBlock({ domain, name, id: doc.id });
      value = block.value;
    }
    return { domain, name, id: doc.id, value };
  }

  async function GetDocValues({ domain, names }) {
    const results = await Promise.all(
      names.map(async name => {
        // todo, join in postgres..
        return await GetDocValue({ domain, name });
      }),
    );
    return { results };
  }

  async function GetDoc({ name, domain }) {
    if (!name) {
      throw new Err('Invalid doc name for "GetDoc"', 'InvalidDocName', {
        domain,
        name,
      });
    }
    if (!domain) {
      throw new Err('Invalid domain for "GetDoc"', 'InvalidDomain', { domain });
    }
    const { id } = await getDocDBContext(domain, name, false);
    const result = await knex.raw(
      `
    SELECT * FROM docs WHERE "docId" = :id
    `,
      { id },
    );
    const doc = result.rows[0];
    return {
      id: doc && doc.currentBlock,
      name,
      domain,
    };
  }

  async function GetDocs({ names, domain }) {
    const results = await Promise.all(
      names.map(async name => {
        return await GetDoc({ name, domain });
      }),
    );
    return { results };
  }

  async function MoveDoc({ domain, from, to }) {
    return await knex('docs')
      .where({ domainName: domain, name: from })
      .update({
        name: to,
      })
      .then(updatedRows => {
        return;
      })
      .catch(function(error) {
        console.error(error);
      });
  }

  async function PutDoc({ domain, name, id }) {
    if (!name) {
      throw new Err('Invalid doc name for "PutDoc"', 'InvalidDocName', {
        domain,
        name,
      });
    }
    if (!domain) {
      throw new Err('Invalid domain for "PutDoc"', 'InvalidDomain', { domain });
    }
    const { localName, parent } = await getDocDBContext(domain, name, true);
    const parentId = parent && parent.id;
    await writeDoc(domain, parentId, localName, id);
  }

  async function PostDoc({ domain, name, value, id }) {
    if (!domain) {
      throw new Err('Invalid domain for "PostDoc"', 'InvalidDomain', {
        domain,
      });
    }
    const postedName = name ? pathJoin(name, cuid()) : cuid();

    if (value) {
      return await PutDocValue({ domain, value, name: postedName, id });
    } else if (id !== undefined) {
      return await PutDoc({ domain, name: postedName, id });
    } else {
      throw new Error('Must post with id or value, even if id is null');
    }
  }

  async function GetBlock({ domain, name, id }) {
    if (!name) {
      throw new Err('Invalid doc name for "GetBlock"', 'InvalidDocName', {
        domain,
        name,
      });
    }
    if (!domain) {
      throw new Err('Invalid domain for "GetBlock"', 'InvalidDomain', {
        domain,
      });
    }
    if (!id) {
      throw new Err('Invalid block id for "GetBlock"', 'InvalidBlockId', {
        domain,
        name,
        id,
      });
    }
    return await knex
      .select('*')
      .from('blocks')
      .where('id', '=', id)
      .limit(1)
      .then(function(res) {
        const block = res.shift();
        if (!block) {
          throw new Err(`Block ID "${id}" was not found`, 'BlockNotFound', {
            id,
          });
        }
        return {
          id: block.id,
          value: block.value.value,
        };
      })
      .catch(function(error) {
        console.error(error);
      });
  }

  async function GetBlocks({ domain, name, ids }) {
    return await knex
      .raw(`SELECT * FROM blocks WHERE "id" = ANY (:ids);`, { domain, ids })
      .then(function(res) {
        return {
          results: res.rows,
        };
      });
  }

  async function PutDomainValue({ domain }) {
    return await knex
      .insert({
        name: domain,
      })
      .into('domains')
      .returning('*')
      .then(function(res) {
        return { domain };
      })
      .catch(function(error) {
        console.error(error);
      });
  }

  async function GetStatus() {
    // todo, fix this
    return {
      ready: isConnected.getValue(),
      connected: isConnected.getValue(),
      migrated: isConnected.getValue(),
    };
  }

  async function ListDocs({ domain, parentName, afterName }) {
    let parentId = TOP_PARENT_ID;
    if (parentName != null) {
      const { id } = await getDocDBContext(domain, parentName);
      parentId = id;
    }
    const limit = getMaxListDocs() + 1;
    const results = await knex.raw(
      `SELECT "name" FROM docs WHERE "name" > :afterName AND "parentId" = :parentId AND "domainName" = :domain ORDER BY "name" LIMIT :limit:`,
      { limit, parentId, domain, afterName: afterName || '' },
    );
    const { rows } = results;
    const hasMore = rows.length === limit;
    let docs = rows.map(r => r.name);
    if (hasMore) {
      docs = docs.slice(0, -1);
    }
    return { docs, hasMore };
  }

  async function ListDomains() {
    return await knex
      .select('*')
      .from('domains')
      .orderBy('name')
      .then(function(result) {
        return result.map(r => r.name);
      })
      .catch(function(error) {
        console.error(error);
      });
  }

  async function DestroyDoc({ domain, name }) {
    if (!name) {
      throw new Err('Invalid doc name for "DestroyDoc"', 'InvalidDocName', {
        domain,
        name,
      });
    }
    if (!domain) {
      throw new Err('Invalid domain for "DestroyDoc"', 'InvalidDomain', {
        domain,
      });
    }
    const ctx = await getDocDBContext(domain, name, false);
    if (!ctx.id) {
      return; // it is already deleted, or missing? consider throwing an error
    }
    await knex.raw(
      `
    DELETE FROM docs WHERE "docId" = :docId
  `,
      { docId: ctx.id },
    );
    notifyDocDestroy(domain, name);
  }

  async function CollectGarbage() {}

  async function close() {
    isConnected.next(false);
    await knex.destroy();
    handleClose();
  }

  function getCachedObervable(args, getChannelId) {
    const channelId = getChannelId(...args);
    if (observingChannels[channelId]) {
      return observingChannels[channelId].observable;
    }
    const notifier = new Subject();
    const observable = new Observable(observer => {
      const notifierSubscription = notifier.subscribe({
        next: val => {
          observer.next(val);
        },
      });
      pgClient && pgClient.query(`LISTEN "${channelId}"`).catch(console.error);
      return () => {
        pgClient
          .query(`UNLISTEN "${channelId}"`)
          .then(resp => {})
          .catch(console.error);
        notifierSubscription.unsubscribe();
      };
    }).shareReplay(1);
    const channel = {
      notifier,
      observable,
    };
    observingChannels[channelId] = channel;
    return channel.observable;
  }

  function getDocChannel(domain, parentId, name) {
    return `doc-${domain}-${parentId}-${name}`;
  }
  function getChildrenChannel(domain, parentId) {
    return `doc-children-${domain}-${parentId}`;
  }

  async function observeDoc(domain, name) {
    if (!name) {
      throw new Err('Invalid doc name for "observeDoc"', 'InvalidDocName', {
        domain,
        name,
      });
    }
    if (!domain) {
      throw new Err('Invalid domain for "observeDoc"', 'InvalidDomain', {
        domain,
      });
    }
    const ctx = await getDocDBContext(domain, name, false);
    const channelId = getDocChannel(domain, ctx.parentId, ctx.localName);

    if (observingChannels[channelId]) {
      return observingChannels[channelId].observable;
    }

    const notifier = new Subject();
    const observable = new Observable(observer => {
      const notifierSubscription = notifier.subscribe({
        next: val => {
          observer.next(val);
        },
      });
      GetDocValue({ name, domain })
        .then(docState => {
          observer.next({ id: docState.id, value: docState.value });
        })
        .catch(observer.error);

      pgClient && pgClient.query(`LISTEN "${channelId}"`).catch(observer.error);
      return () => {
        pgClient
          .query(`UNLISTEN "${channelId}"`)
          .then(resp => {})
          .catch(console.error);
        notifierSubscription.unsubscribe();
      };
    }).shareReplay(1);
    const channel = {
      notifier,
      observable,
    };
    observingChannels[channelId] = channel;

    return channel.observable;
  }
  async function observeDocChildren(domain, name) {
    if (!domain) {
      throw new Err('Invalid domain', 'InvalidDomain', { domain });
    }
    const { id } = await getDocDBContext(domain, name);
    return getCachedObervable([domain, id], getChildrenChannel);
  }
  return {
    isConnected,
    close,
    observeDoc,
    observeDocChildren,
    dispatch: createDispatcher({
      PutDocValue,
      GetDocValue,
      GetDocValues,
      PutDoc,
      PostDoc,
      MoveDoc,
      PutTransactionValue,
      PutBlock,
      GetBlock,
      GetBlocks,
      PutDomainValue,
      GetDoc,
      GetDocs,
      GetStatus,
      ListDomains,
      ListDocs,
      DestroyDoc,
      CollectGarbage,
    }),
    id,
  };
}
