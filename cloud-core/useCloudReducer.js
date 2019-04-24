import useCloud from './useCloud';
import useObservable from './useObservable';

export default function useCloudReducer(
  actionDocName,
  cloudReducer,
  remote = true
) {
  const cloud = useCloud();
  if (remote) {
    const reducerDoc = cloud.get(cloudReducer.name);
    reducerDoc.markRemoteLambda(true);
  }
  const actionsDoc = cloud.get(actionDocName);
  if (cloudReducer.type !== 'CloudFunction') {
    throw new Error(
      'Invalid reducer provided to useCloudReducer. Create it with defineCloudReducer'
    );
  }
  cloud.lazyDefineCloudFunction(cloudReducer);
  const todosReduced = actionsDoc.get(`^${cloudReducer.name}`);
  const todos = useObservable(todosReduced.observeValue);
  return [todos, actionsDoc.putTransaction];
}
