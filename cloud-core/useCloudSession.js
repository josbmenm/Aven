import useCloud from './useCloud';
import useObservable from './useObservable';

export default function useCloudContext() {
  const cloud = useCloud();
  if (!cloud) {
    return null;
  }
  const session = useObservable(cloud.observeSession);
  return session;
}
