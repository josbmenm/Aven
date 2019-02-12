import { useEffect, useMemo, useState } from 'react';

import useCloud from './useCloud';
import useObservable from './useObservable';

export default function useCloudReducer(name, reducer, initialState) {
  const cloud = useCloud();
  const doc = cloud.get(name);
  const lambdaName = `${name}/reducer`;
  const resultDoc = cloud.get(`${name}^${lambdaName}`);
  const [isReady, setIsReady] = useState(false);
  useEffect(
    () => {
      const lambdaDoc = cloud.get(`${name}/reducer`);
      lambdaDoc
        .put({
          type: 'LambdaFunction',
          code: `(a, doc, cloud, opts) => {
        let state = ${JSON.stringify(initialState)};
        
        if (!a) {
          return state;
        }
        if (a.on && a.on.id) {
          const ancestorName = doc.getFullName() + '#' + a.on.id + '^${lambdaName}';
          state = useValue(cloud.get(ancestorName)) || [];
        }
        
        const action = a.value;

        ${reducer}
      }`,
        })
        .then(() => {
          setIsReady(true);
        })
        .catch(e => {
          throw new Error('error on uploaded lambda');
        });
    },
    [reducer, name]
  );
  let value = useObservable(isReady && resultDoc.observeValue);

  return [value, doc.putTransaction];
}
