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
      return {
        ...defaultReturn(),
        orders: [...(state.orders || []).slice(-99), action.confirmedOrder],
      };
    }
    default: {
      return defaultReturn();
    }
  }
}

const RecentOrders = defineCloudReducer('RecentOrders', RecentOrdersFn, {});

export default RecentOrders;
