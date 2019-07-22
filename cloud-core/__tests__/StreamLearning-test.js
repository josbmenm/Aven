import xs from 'xstream';

describe('basic stream stuff', () => {
  it('memory strem remembers', () => {
    const provider = {
      start: listener => {
        listener.next(2);
      },
      stop: () => {},
    };
    const m = xs.createWithMemory(provider);
    let a = null;
    m.addListener({
      next: v => {
        a = v;
      },
    });
    expect(a).toBe(2);
    let b = null;
    m.addListener({
      next: v => {
        b = v;
      },
    });
    expect(b).toBe(2);
  });

  it.only('map does not remember', () => {
    const provider = {
      start: listener => {
        console.log('starting');
        listener.next(2);
      },
      stop: () => {},
    };
    const m = xs.createWithMemory(provider);
    const mm = m.map(v => {
      console.log('mapping', v);
      return v * v;
    });
    let a = null;
    mm.addListener({
      next: v => {
        a = v;
      },
    });
    expect(a).toBe(4);
    let b = null;
    mm.addListener({
      next: v => {
        b = v;
      },
    });
    expect(b).toBe(4);
  });
});
