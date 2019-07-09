import {
  createBlock,
  createDoc,
  createDocSet,
  createAuthenticatedClient,
  createClient,
} from '../Kite';
import createMemoryStorageSource from '../createMemoryStorageSource';
import xs from 'xstream';
import sourceTests from './sourceTests';

async function justASec(duration) {
  return new Promise(resolve => setTimeout(resolve, duration || 1));
}

const dummySource = {
  dispatch: async () => null,
};

describe('kite block', () => {
  describe('generic behavior', () => {
    it('handles creation with empty value', () => {
      const obj = createBlock({
        domain: 'test',
        onGetName: () => 'foo',
        source: dummySource,
        id: 'asdf1234',
      });
      expect(obj.get().id).toBe('asdf1234');
      expect(obj.get().value).toBe(undefined);
      expect(obj.value.get()).toBe(undefined);
    });
    it('fails on creation without value or id', () => {
      expect(() =>
        createBlock({
          domain: 'test',
          onGetName: () => 'foo',
          source: dummySource,
        }),
      ).toThrow();
    });
    it('handles creation with value', () => {
      const obj = createBlock({
        domain: 'test',
        onGetName: () => 'foo',
        value: { foo: 42 },
        source: dummySource,
      });
      expect(obj.get().id).toBe(
        '080e64543b0bed8b2de186304bb1ed04d5d46b5c1c362e971ec99ad8194576fc',
      );
      expect(obj.get().value.foo).toBe(42);
      expect(obj.value.get().foo).toBe(42);
    });
  });

  describe('imperative behavior', () => {
    it('can load block', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const obj1 = await m.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const block = createBlock({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
        id: obj1.id,
      });
      expect(block.get().lastFetchTime).toEqual(null);
      expect(block.get().value).toEqual(undefined);
      expect(block.value.get()).toBe(undefined);
      await block.value.load();
      expect(typeof block.get().lastFetchTime).toBe('number');
      expect(block.get().value.foo).toEqual('bar');
      expect(block.value.get().foo).toBe('bar');
    });
  });

  describe('stream behavior', () => {
    it('can subscribe and unsubscribe to whole block info', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const obj1 = await m.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const block = createBlock({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
        id: obj1.id,
      });
      expect(block.get().lastFetchTime).toEqual(null);
      expect(block.get().value).toEqual(undefined);
      expect(block.value.get()).toBe(undefined);
      let streamedValue = null;
      const streamListener = {
        next: v => {
          streamedValue = v;
        },
      };
      block.stream.addListener(streamListener);
      expect(streamedValue.value).toEqual(undefined);
      expect(streamedValue.lastFetchTime).toEqual(null);
      await justASec();

      expect(streamedValue.value.foo).toEqual('bar');
      expect(typeof streamedValue.lastFetchTime).toEqual('number');
      expect(streamedValue.id).toEqual(obj1.id);

      block.stream.removeListener(streamListener);
    });

    it('can subscribe and unsubscribe to block values', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const obj1 = await m.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const block = createBlock({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
        id: obj1.id,
      });
      expect(block.get().lastFetchTime).toEqual(null);
      expect(block.get().value).toEqual(undefined);
      expect(block.value.get()).toBe(undefined);

      let streamedValue = undefined;
      const streamListener = {
        next: v => {
          streamedValue = v;
        },
      };
      block.value.stream.addListener(streamListener);
      expect(streamedValue).toEqual(undefined);
      await justASec();

      expect(streamedValue.foo).toEqual('bar');

      block.value.stream.removeListener(streamListener);
      await justASec();
      expect(block.get().id).toBe(obj1.id);
      expect(block.get().value.foo).toBe('bar');

      expect(block.value.get().foo).toBe('bar');
    });
  });
});

describe('kite doc', () => {
  describe('imperative behavior', () => {
    it('can load doc', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const obj1 = await m.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const doc = createDoc({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
      });

      expect(doc.get().lastFetchTime).toEqual(null);
      expect(doc.get().value).toEqual(undefined);
      expect(doc.value.get()).toBe(undefined);

      const loadResp = await doc.value.load();
      expect(typeof doc.get().lastFetchTime).toBe('number');
      expect(doc.get().id).toEqual(obj1.id);
      expect(doc.value.get().foo).toBe('bar');
    });

    it('can publish value block', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const doc = createDoc({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
      });
      const block = await doc.publishValue({ x: 42 });

      const id = block.get().id;

      const resp = await m.dispatch({
        type: 'GetBlock',
        domain: 'test',
        name: 'foo',
        id,
      });
      expect(resp.value.x).toEqual(42);
    });

    it('can publish value block then put block', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const doc = createDoc({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
      });
      const block = await doc.publishValue({ x: 42 });

      const id = block.get().id;

      const resp = await m.dispatch({
        type: 'GetBlock',
        domain: 'test',
        name: 'foo',
        id,
      });
      expect(resp.value.x).toEqual(42);
      await doc.putBlock(block);
      const resp2 = await m.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo',
      });
      expect(resp2.value.x).toEqual(42);
      expect(resp2.id).toEqual(id);
    });

    it('can put doc value', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const doc = createDoc({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
      });
      await doc.putValue({ x: 42 });
      const resp = await m.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo',
      });
      expect(resp.value.x).toEqual(42);
      expect(resp.id).toEqual(doc.get().id);
    });

    it('can transact on doc values', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const doc = createDoc({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
      });
      await doc.putTransactionValue({ x: 42 });
      const resp = await m.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo',
      });
      expect(resp.value.on).toEqual(null);
      expect(resp.value.value.x).toEqual(42);
      expect(doc.value.get().value.x).toEqual(42);
      expect(typeof doc.get().lastPutTime).toEqual('number');
    });
  });

  describe('stream behavior', () => {
    it('can load via doc.value.stream', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const obj1 = await m.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const doc = createDoc({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
      });
      let lastValue = undefined;
      const listener = {
        next: v => {
          lastValue = v;
        },
      };
      doc.value.stream.addListener(listener);
      expect(lastValue).toEqual(undefined);
      await justASec();
      expect(lastValue.foo).toEqual('bar');
      const obj2 = await m.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'a' },
      });
      await justASec();
      expect(lastValue.foo).toEqual('a');
      doc.value.stream.removeListener(listener);
      const obj3 = await m.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'b' },
      });
      await justASec();
      expect(lastValue.foo).toEqual('a');
      await doc.value.load();
      expect(doc.value.get().foo).toBe('b');
    });

    it('can stream putValue vals via doc.value.stream', async () => {
      const m = createMemoryStorageSource({ domain: 'test' });
      const doc = createDoc({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
      });
      await doc.putValue({ foo: 'bar' });
      const listenDoc = createDoc({
        source: m,
        onGetName: () => 'foo',
        domain: 'test',
      });
      let lastValue = undefined;
      const listener = {
        next: v => {
          lastValue = v;
        },
      };
      listenDoc.value.stream.addListener(listener);
      expect(lastValue).toEqual(undefined);
      await justASec();
      expect(lastValue.foo).toEqual('bar');
      await doc.putValue({ foo: 'a' });

      await justASec();
      expect(lastValue.foo).toEqual('a');
      listenDoc.value.stream.removeListener(listener);
      await doc.putValue({ foo: 'b' });

      await justASec();
      expect(lastValue.foo).toEqual('a');
      await doc.value.load();
      expect(doc.value.get().foo).toBe('b');
    });
  });
});

describe('kite doc set', () => {
  it('get - basic', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    await m.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const docSet = createDocSet({
      source: m,
      onGetName: () => null,
      domain: 'test',
    });
    const doc = docSet.get('foo');
    expect((await doc.value.load()).foo).toBe('bar');
  });
  it('get - parents to children', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const docSet = createDocSet({
      source: m,
      onGetName: () => null,
      domain: 'test',
    });
    const parentDoc = docSet.get('foo');
    const childDoc = docSet.get('foo/bar');
    expect(childDoc.get().id).toEqual(undefined);
    expect(parentDoc.get().id).toEqual(undefined);
    const sameChild = parentDoc.children.get('bar');
    expect(childDoc).toBe(sameChild);
  });
  it('sets and gets overridden stream docs', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    await m.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const docSet = createDocSet({
      source: m,
      onGetName: () => null,
      domain: 'test',
    });
    const foo = docSet.get('foo');
    expect(await foo.value.load()).toMatchObject({ foo: 'bar' });
    docSet.setOverrideStream(
      'foobar',
      foo.value.stream.map(v => {
        return v.foo;
      }),
    );
    const mappedDoc = docSet.get('foobar');
    expect(await mappedDoc.value.load()).toBe('bar');
  });

  it.only('handles reducer stream docs', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });

    const docSet = createDocSet({
      source: m,
      onGetName: () => null,
      domain: 'test',
    });
    const foo = docSet.get('foo');
    const initialState = {
      items: [],
    };
    function reducerFn(state, action) {
      if (action.add) {
        return {
          items: [...state.items, action.add],
        };
      } else if (action.remove) {
        return {
          items: state.items.filter(i => i !== action.remove),
        };
      }
      return state;
    }

    function streamReduced(val) {
      console.log('streamReduced', val);
      if (!val) {
        return xs.of(undefined);
      }
      let lastStateStream = undefined;
      if (val.on === null) {
        lastStateStream = xs.of(initialState);
      } else if (val.on.id) {
        lastStateStream = foo
          .getBlock(val.on.id)
          .value.stream.map(streamReduced)
          .flatten();
      } else {
        return xs.of(undefined);
      }
      return lastStateStream.map(lastState => {
        return reducerFn(lastState, val.value);
      });
    }

    const fooReduced = docSet.setOverrideStream(
      'fooReduced',
      foo.value.stream.map(streamReduced).flatten(),
    );
    const loaded = await fooReduced.value.load();
    expect(loaded).toBe(undefined);
    await foo.putTransactionValue({ add: 'a' });
    console.log('OH I SEEEEEEEEE');
    const loaded2 = await fooReduced.value.load();
    console.log('faaaaaail');

    expect(loaded2).toMatchObject({ items: ['a'] });
    let lastObserved = null;
    const listener = {
      next: v => {
        lastObserved = v;
      },
    };
    fooReduced.value.stream.addListener(listener);
    await justASec();
    expect(lastObserved).toMatchObject({ items: ['a'] });
    // foo.putTransactionValue({ add: 'b' });
    // const loaded3 = await fooReduced.value.load();
    // expect(loaded3).toMatchObject({ items: ['a', 'b'] });
    // await justASec();
    // expect(lastObserved).toMatchObject({ items: ['a', 'b'] });
  });

  it('posts at root', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const docSet = createDocSet({
      source: m,
      onGetName: () => null,
      domain: 'test',
    });
    const newDoc = docSet.post();
    await newDoc.putValue({ hello: 'world' });
    const postedName = newDoc.getName();
    const res = await m.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: postedName,
    });
    expect(res.value.hello).toEqual('world');
  });
  it('posts children', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const docSet = createDocSet({
      source: m,
      onGetName: () => 'foo',
      domain: 'test',
    });
    const newDoc = docSet.post();
    await newDoc.putValue({ hello: 'world' });
    const postedName = newDoc.getName();
    const res = await m.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: postedName,
    });
    expect(res.value.hello).toEqual('world');
    expect(postedName.length > 10).toEqual(true);
    expect(postedName.indexOf('foo/')).toEqual(0);
  });
  it('destroys at root without loading', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const docSet = createDocSet({
      source: m,
      onGetName: () => null,
      domain: 'test',
    });
    await m.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const doc = docSet.get('foo');
    await doc.destroy();
    expect(doc.get().isDestroyed).toBe(true);
    const res = await m.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo',
    });
    expect(res.value).toEqual(undefined);
    expect(res.id).toEqual(undefined);
  });

  it('destroys at root after loading', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const docSet = createDocSet({
      source: m,
      onGetName: () => null,
      domain: 'test',
    });
    await m.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const doc = docSet.get('foo');
    await doc.load();
    await doc.destroy();
    expect(doc.get().isDestroyed).toBe(true);
    const res = await m.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo',
    });
    expect(res.value).toEqual(undefined);
    expect(res.id).toEqual(undefined);
  });
});

describe('authenticated client behaves as source', () => {
  async function startTestSource(options = { domain: 'test' }) {
    const source = createMemoryStorageSource({
      domain: options.domain,
      ...options,
    });
    const client = createAuthenticatedClient({
      source,
      domain: options.domain,
    });
    return client;
  }

  sourceTests(startTestSource);
});
