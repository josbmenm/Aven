import useCloud from './useCloud';
import useObservable from './useObservable';
import defineCloudFunction from './defineCloudFunction';

export function defineCloudReducer(reducerName, reducerFn, initialState) {
  const fn = ({ value, id }, doc, cloud, useValue) => {
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
  return defineCloudFunction(reducerName, fn);
}

export default function useCloudReducer(actionDocName, cloudReducer) {
  const cloud = useCloud();
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

/*

const cloudFn = defineCloudFunction('FnName', fn)
const reducer = defineCloudReducer('ReducerName', reducer, {init: 'state'})

useCloudValue(cloudFn)

cloud.get(cloudFn)

createEvalSource({
  source,
  functions: [cloudFn, reducer],
})

useCloudReducer('StateDocName', reducer)

*/

// export function createReducerLambda(reducerName, reducerFn, initialState) {
//   return ({ value, id }, doc, cloud, useValue) => {
//     let state = initialState;
//     if (value === undefined || value === null) {
//       return state;
//     }
//     let action = value.value;
//     if (value.on && value.on.id) {
//       const ancestorName = `${doc.getFullName()}#${value.on.id}^${reducerName}`;
//       state = useValue(cloud.get(ancestorName));
//     }
//     return reducerFn(state, action);
//   };
// }

// export default function useCloudReducer(
//   actionDocName,
//   reducerName,
//   reducerFn,
//   initialState
// ) {
//   const cloud = useCloud();
//   const actionsDoc = cloud.get(actionDocName);
//   cloud.setLambda(
//     reducerName,
//     createReducerLambda(reducerName, reducerFn, initialState)
//   );
//   const todosReduced = actionsDoc.get(`^${reducerName}`);
//   const todos = useObservable(todosReduced.observeValue);
//   return [todos, actionsDoc.putTransaction];
// }
