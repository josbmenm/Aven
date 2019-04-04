import useCloud from './useCloud';
import useObservable from './useObservable';

export function createReducerLambda(reducerName, reducerFn, initialState) {
  return ({ value, id }, doc, cloud, useValue) => {
    let state = initialState;
    if (value === undefined || value === null) {
      return state;
    }
    let action = value.value;
    if (value.on && value.on.id) {
      const ancestorName = `${doc.getFullName()}#${value.on.id}^${reducerName}`;
      state = useValue(cloud.get(ancestorName));
    }
    return reducerFn(state, action);
  };
}

export default function useCloudReducer(
  actionDocName,
  reducerName,
  reducerFn,
  initialState
) {
  const cloud = useCloud();
  const actionsDoc = cloud.get(actionDocName);
  cloud.setLambda(
    reducerName,
    createReducerLambda(reducerName, reducerFn, initialState)
  );
  const todosReduced = actionsDoc.get(`^${reducerName}`);
  const todos = useObservable(todosReduced.observeValue);
  return [todos, actionsDoc.putTransaction];
}
