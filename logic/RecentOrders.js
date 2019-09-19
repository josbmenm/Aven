import { defineCloudReducer } from '../cloud-core/KiteReact';

function RecentOrdersFn(state = {}, action) {
  const defaultReturn = () => {
    return {
      ...state,
      // lastAction: action,
      // lastLastAction: state.lastAction,

      // actionCount: (state.actionCount || 0) + 1,
    };
  };
  switch (action.type) {
    case 'KioskOrder': {
      const {
        id,
        orderName,
        startTime,
        confirmedTime,
        isConfirmed,
        isOrderValid,
        total,
        subTotal,
        discountTotal,
        orderTasks,
      } = action.confirmedOrder;
      return {
        ...defaultReturn(),
        orders: [
          ...(state.orders ? state.orders.slice(-99) : []),
          {
            id,
            orderName,
            startTime,
            confirmedTime,
            isConfirmed,
            isOrderValid,
            total,
            subTotal,
            discountTotal,
            orderTasks:
              orderTasks &&
              orderTasks.map(({ id, blendName }) => {
                return { id, blendName };
              }),
          },
        ],
      };
    }
    default: {
      return defaultReturn();
    }
  }
}

const RecentOrders = defineCloudReducer('RecentOrders5', RecentOrdersFn, {});

export default RecentOrders;
