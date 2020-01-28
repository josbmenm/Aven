import { defineCloudReducer } from '../cloud-core/KiteReact';
import cuid from 'cuid';

function OrderDraftReducerFn(state = {}, action) {
  switch (action.type) {
    case 'WipeState': {
      return {};
    }
    case 'StartOrderDraft': {
      return {
        ...state,
        items: [],
        draftOrderId: cuid(),
        startTime: action.dispatchTime,
      };
    }
    case 'SentReceipt': {
      return {
        ...state,
        receipts: [...(state.receipts || []), action.receipt],
      };
    }
    case 'CancelOrder': {
      return {
        ...state,
        cancelledTime: action.dispatchTime,
        isCancelled: true,
      };
    }
    case 'AddItem': {
      if (
        state.items &&
        state.items.find(item => action.orderItemId === item.id)
      ) {
        return {
          ...state,
          items: state.items.map(item => {
            if (item.id !== action.orderItemId) return item;
            return { ...item, quantity: item.quantity + 1 };
          }),
        };
      }
      if (action.foodItemId) {
        return {
          ...state,
          items: [
            ...(state.items || []),
            {
              id: action.orderItemId || action.dispatchId,
              type: 'food',
              foodItemId: action.foodItemId,
              quantity: 1,
            },
          ],
        };
      }
      return {
        ...state,
        items: [
          ...(state.items || []),
          {
            id: action.orderItemId || action.dispatchId,
            type: 'blend',
            menuItemId: action.menuItemId,
            quantity: 1,
          },
        ],
      };
    }
    case 'SetOrderName': {
      return {
        ...state,
        orderName: action.orderName,
      };
    }
    case 'IncrementQuantity': {
      const items = state.items.map(item => {
        if (item.id !== action.itemId) return item;
        return {
          ...item,
          quantity: item.quantity + action.increment,
        };
      });
      return {
        ...state,
        items,
      };
    }
    case 'RemoveItem': {
      items = state.items.filter(item => {
        return item.id !== action.itemId;
      });
      return {
        ...state,
        items,
      };
    }
    case 'SetPromo': {
      return {
        ...state,
        promo: action.promo,
      };
    }
    default: {
      return state;
    }
  }
}

const OrderDraftReducer = defineCloudReducer(
  'OrderDraftReducer',
  OrderDraftReducerFn,
  {},
);

export default OrderDraftReducer;
