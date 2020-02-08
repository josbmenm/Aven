import { defineCloudReducer } from '../cloud-core/KiteReact';

function HistoricalOrdersFn(state = {}, action, actionId) {
  const { type, dispatchTime } = action;
  const time = new Date(dispatchTime);
  const year = String(time.getFullYear());
  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  const yearData = state[year] || {};
  const monthData = yearData[month] || {};
  const dayData = monthData[day] || [];
  return {
    ...state,
    [year]: {
      ...yearData,
      [month]: {
        ...monthData,
        [day]: [
          ...dayData,
          {
            dispatchTime,
            type,
            actionDoc: {
              type: 'BlockReference',
              id: actionId,
            },
          },
        ],
      },
    },
  };
}

const HistoricalOrders = defineCloudReducer(
  'HistoricalTransactions-01a',
  HistoricalOrdersFn,
  {},
);

export default HistoricalOrders;
