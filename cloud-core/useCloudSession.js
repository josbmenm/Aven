import useCloud from './useCloud';
import useObservable from './useObservable';

export default function useCloudContext() {
  const cloud = useCloud();
  const session = useObservable(cloud && cloud.observeSession);
  if (!cloud) {
    return null;
  }
  return session;
}
