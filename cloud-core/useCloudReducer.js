import useCloud from './useCloud';
import useObservable from './useObservable';

export default function useCloudReducer(
  actionDocName,
  reducerName,
  reducerFn,
  initialState,
) {
  const cloud = useCloud();
  const actionsDoc = cloud.get(actionDocName);
  cloud.setLambda(reducerName, (docState, doc, cloud, useValue) => {
    let state = initialState;
    if (docState === undefined) {
      return state;
    }
    let action = docState.value;
    if (docState.on && docState.on.id) {
      const ancestorName = `${doc.getFullName()}#${
        docState.on.id
      }^${reducerName}`;
      state = useValue(cloud.get(ancestorName));
    }
    return reducerFn(state, action);
  });
  const todosReduced = actionsDoc.get(`^${reducerName}`);
  const todos = useObservable(todosReduced.observeValue);
  return [todos, actionsDoc.putTransaction];
}
