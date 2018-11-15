import useObservable from "./useObservable";

export default function useRefValue(ref) {
  const observable = ref.observeValue;
  return useObservable(ref.observeValue);
}
