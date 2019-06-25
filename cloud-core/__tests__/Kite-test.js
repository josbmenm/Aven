import { createBlock, createDoc } from '../Kite';
import createMemoryStorageSource from '../createMemoryStorageSource';

async function justASec() {
  return new Promise(resolve => setTimeout(resolve, 1));
}

describe('kite block', () => {
  describe('generic behavior', () => {
    it('handles creation with empty value', () => {
      const obj = createBlock({
        domain: 'test',
        onGetName: () => 'foo',
        source: {},
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
          source: {},
        }),
      ).toThrow();
    });
    it('handles creation with value', () => {
      const obj = createBlock({
        domain: 'test',
        onGetName: () => 'foo',
        value: { foo: 42 },
        source: {},
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
      expect(block.getIsAttached()).toEqual(false);
      expect(block.value.get()).toBe(undefined);

      let streamedIsAttached = null;
      block.isAttachedStream.addListener({
        next: isAtt => {
          streamedIsAttached = isAtt;
        },
      });
      expect(streamedIsAttached).toEqual(false);
      await block.load();
      expect(streamedIsAttached).toEqual(true);
      expect(block.getIsAttached()).toEqual(true);
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
      expect(block.getIsAttached()).toEqual(false);
      expect(block.value.get()).toBe(undefined);

      let streamedIsAttached = null;
      block.isAttachedStream.addListener({
        next: isAtt => {
          streamedIsAttached = isAtt;
        },
      });
      expect(streamedIsAttached).toEqual(false);

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
      expect(streamedIsAttached).toEqual(true);
      expect(block.getIsAttached()).toEqual(true);

      expect(streamedValue.value.foo).toEqual('bar');
      expect(typeof streamedValue.lastFetchTime).toEqual('number');
      expect(streamedValue.id).toEqual(obj1.id);

      block.stream.removeListener(streamListener);
      // block values never change. so they are always attached once loaded, even when we stop listening
      await justASec();
      expect(streamedIsAttached).toEqual(true);
      expect(block.getIsAttached()).toEqual(true);
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
      expect(block.getIsAttached()).toEqual(false);
      expect(block.value.get()).toBe(undefined);

      let streamedIsAttached = null;
      block.isAttachedStream.addListener({
        next: isAtt => {
          streamedIsAttached = isAtt;
        },
      });
      expect(streamedIsAttached).toEqual(false);

      let streamedValue = undefined;
      const streamListener = {
        next: v => {
          streamedValue = v;
        },
      };
      block.value.stream.addListener(streamListener);
      expect(streamedValue).toEqual(undefined);
      await justASec();
      expect(streamedIsAttached).toEqual(true);
      expect(block.getIsAttached()).toEqual(true);

      expect(streamedValue.foo).toEqual('bar');

      block.value.stream.removeListener(streamListener);
      // block values never change. so they are always attached once loaded, even when we stop listening
      await justASec();
      expect(streamedIsAttached).toEqual(true);
      expect(block.getIsAttached()).toEqual(true);
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
        name: 'foo',
        domain: 'test',
      });
      expect(doc.get().lastFetchTime).toEqual(null);
      expect(doc.get().value).toEqual(undefined);
      expect(doc.getIsAttached()).toEqual(false);
      expect(doc.value.get()).toBe(undefined);

      let streamedIsAttached = null;
      doc.isAttachedStream.addListener({
        next: isAtt => {
          streamedIsAttached = isAtt;
        },
      });
      expect(streamedIsAttached).toEqual(false);
      await doc.load();
      expect(streamedIsAttached).toEqual(true);
      expect(doc.getIsAttached()).toEqual(true);
      expect(typeof doc.get().lastFetchTime).toBe('number');
      expect(doc.get().value.foo).toEqual('bar');
      expect(doc.get().id).toEqual(obj1.id);
      expect(doc.value.get().foo).toBe('bar');
    });
  });
});
