import { defineCloudReducer } from '../cloud-core/KiteReact';
import { error } from '../logger/logger';

function OrderReducerFn(state = {}, action) {
  if (!action.type) {
    error('DetectedLegacyOrder');
    return action;
  }
  switch (action.type) {
    case 'PlaceOrder': {
      if (state.orderId) {
        error('DetectedDuplicateOrderId', {
          orderId: state.orderId,
          action,
        });
        return {
          ...state,
          duplicateOrders: [...(state.duplicateOrders || []), action.order],
        };
      }
      return {
        ...action.order,
      };
    }
    case 'PaymentRefund': {
      return { ...state, refundTime: action.refundTime, refund: action.refund };
    }
    case 'SentReceipt': {
      return {
        ...state,
        receipts: [...(state.receipts || []), action.receipt],
      };
    }

    default: {
      return state;
    }
  }
}

const OrderReducer = defineCloudReducer('OrderReducer', OrderReducerFn, {});

export default OrderReducer;
