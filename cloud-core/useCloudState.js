import useCloud from './useCloud';
import useObservable from './useObservable';

export default function useCloudState(name, defaultValue) {
  const cloud = useCloud();
  const doc = cloud.get(name);
  let value = useObservable(doc.observeValue);
  if (value === null && defaultValue !== undefined) {
    value = defaultValue;
  }
  return [value, doc.put];
}
