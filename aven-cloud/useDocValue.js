import useObservable from './useObservable';

export default function useDocValue(doc) {
  const observable = doc.observeValue;
  return useObservable(observable);
}
