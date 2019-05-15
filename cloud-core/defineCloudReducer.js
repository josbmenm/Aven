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
    return reducerFn(state, action);
  };
  return defineCloudFunction(reducerName, fn);
}