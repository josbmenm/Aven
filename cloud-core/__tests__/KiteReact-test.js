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

import { createReducerStream } from '../KiteReact';

async function justASec(duration) {
  return new Promise(resolve => setTimeout(resolve, duration || 1));
}

const dummySource = {
  dispatch: async () => null,
};

describe('kite reducer', () => {
  it('handles reducer stream', async () => {
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

    const fooReducedStream = createReducerStream(foo, reducerFn, initialState);
    let lastObserved = null;
    const listener = {
      next: v => {
        lastObserved = v;
      },
    };
    fooReducedStream.addListener(listener);
    expect(lastObserved).toBe(null);
    await justASec();
    expect(lastObserved).toBe(undefined);
    await foo.putTransactionValue({ add: 'a' });
    expect(lastObserved).toMatchObject({ items: ['a'] });
    await foo.putTransactionValue({ add: 'b' });
    expect(lastObserved).toMatchObject({ items: ['a', 'b'] });
  });

  it('handles reducer stream override docs', async () => {
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
    const streamReduced = createReducerStream(foo, reducerFn, initialState);
    const fooReduced = docSet.setOverrideStream('fooReduced', streamReduced);
    const loaded = await fooReduced.value.load();
    expect(loaded).toBe(undefined);
    await foo.putTransactionValue({ add: 'a' });
    const loaded2 = await fooReduced.value.load();
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
    await foo.putTransactionValue({ add: 'b' });
    const loaded3 = await fooReduced.value.load();
    expect(loaded3).toMatchObject({ items: ['a', 'b'] });
    await justASec();
    expect(lastObserved).toMatchObject({ items: ['a', 'b'] });
  });
});
