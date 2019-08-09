import defineCloudFunction from './defineCloudFunction';

export default function defineCloudReducer(
  reducerName,
  reducerFn,
  initialState,
) {
  const fn = ({ value, id }, doc, cloud, getValue) => {
    let state = initialState;
    if (value === undefined || value === null) {
      return state;
    }
    let action = value.value;
    if (value.on && value.on.id) {
      const ancestorName = `${doc.getFullName()}#${value.on.id}^${reducerName}`;
      state = getValue(cloud.get(ancestorName));
    }
    let nextState = null;
    try {
      nextState = reducerFn(state, action);
    } catch (e) {
      console.error('Error reducing ' + reducerName);
      console.error(state, action);
      throw e;
    }

    return nextState;
  };
  return defineCloudFunction(reducerName, fn);
}
