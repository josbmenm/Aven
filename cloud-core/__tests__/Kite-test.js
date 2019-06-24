import { createBlock } from '../Kite';
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
        dispatch: () => {},
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
          dispatch: () => {},
        }),
      ).toThrow();
    });
    it('handles creation with value', () => {
      const obj = createBlock({
        domain: 'test',
        onGetName: () => 'foo',
        value: { foo: 42 },
        dispatch: () => {},
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
        dispatch: m.dispatch,
        onGetName: () => 'foo',
        domain: 'test',
        id: obj1.id,
      });
      expect(block.get().lastFetchTime).toEqual(null);
      expect(block.get().value).toEqual(undefined);
      expect(obj.value.get()).toBe(undefined);
      await block.load();
      expect(block.get().lastFetchTime).toBeGreaterThan(0);
      expect(block.get().value.foo).toEqual('bar');
      expect(obj.value.get().foo).toBe('bar');
    });
  });

  // describe('stream behavior', () => {

  // })
});
