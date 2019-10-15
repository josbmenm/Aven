import { defineCloudReducer } from '../cloud-core/KiteReact';
import cuid from 'cuid';

function OrderReducerFn(state = {}, action) {
  if (!action.type) {
    console.log('Handling LEGACY order');
    return action;
  }
  switch (action.type) {
    case 'PlaceOrder': {
      if (state.orderId && action.orderId !== state.orderId) {
        // just a precaution.. this shouldn't ever happen!
        return state;
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
