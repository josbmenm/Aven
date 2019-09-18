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
      if (
        !action.confirmedOrder ||
        !action.confirmedOrder.id ||
        (state.orders &&
          state.orders.find(o => o.id === action.confirmedOrder.id))
      ) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        orders: [...(state.orders || []).slice(-9), action.confirmedOrder],
      };
    }
    default: {
      return defaultReturn();
    }
  }
}

const RecentOrders = defineCloudReducer('RecentOrders', RecentOrdersFn, {});

export default RecentOrders;
