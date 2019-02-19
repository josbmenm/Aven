import Lang from '../Lang';

test.skip('saves basic facts', () => {
  const { the, what } = Lang();
  expect(what.is.the('sky')).toBe(undefined);
  the('sky').is('blue');
  the('bug').is('green');
  expect(what.is.the('sky')).toBe('blue');
  expect(what.is.the('bug')).toBe('green');
});

test.skip('saves facts within known things', () => {
  const { the, what } = Lang();
  the('color')
    .ofThe('sky')
    .is('blue');
  expect(what.is.the('color').ofThe('sky')).toBe('blue');
  expect(what.is.the(['sky', 'color'])).toBe('blue');
  expect(what.is.the('age').ofThe('sky')).toBe(undefined);
});
