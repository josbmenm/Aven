import React, { createContext, useContext, useState, useMemo } from 'react';
import { useCloud, useValue } from '../cloud-core/KiteReact';
import { getOrderItemMapper, getOrderSummary } from '../logic/configLogic';
import { useMenu, getLocalName, useCompanyConfig } from './OnoKitchen';
import { getIsLiveMode } from '../card-reader/CardReader';
import OrderDraftReducer from '../logic/OrderDraftReducer';

const OrderContext = createContext(null);

export function OrderContextProvider({ children }) {
  const cloud = useCloud();
  const draftActions = cloud.get('DraftOrderActions');

  const draftOrder = React.useMemo(() => {
    draftActions.setLocalOnly();

    return cloud.setReducer('DraftOrder', {
      reducer: OrderDraftReducer,
      actionsDoc: draftActions,
    });
  }, [cloud, draftActions]);

  const [asyncError, setAsyncError] = useState(null);

  if (asyncError) {
    setAsyncError(null);
    throw asyncError;
  }

  function guardAsync(promise) {
    return promise
      .then(() => {})
      .catch(e => {
        setAsyncError(e);
      });
  }
  const orderDispatch = draftActions.putTransactionValue;
  const orderContext = {
    order: draftOrder,
    orderDispatch,
    setOrderName: name => {
      guardAsync(
        orderDispatch({
          type: 'SetOrderName',
          orderName: name,
        }),
      );
    },
    resetOrder: () => {
      guardAsync(
        orderDispatch({
          type: 'CancelOrder',
        }),
      );
    },
    confirmOrder: async paymentIntent => {
      // const newOrder = cloud.get('Orders').children.post();
      // const orderBlockId = await draftActions.getId();
      // const orderBlock = newOrder.getBlock(orderBlockId);
      // await newOrder.putBlock(orderBlock);

      const orderState = cloud.get('DraftOrder').idAndValue.get();
      const isLive = await getIsLiveMode();
      await cloud.dispatch({
        type: 'PlaceOrder',
        orderId: orderState.value.orderId,
        order: orderState.value,
        paymentIntent,
        isLive,
      });
    },
    startOrder: () =>
      guardAsync(
        cloud.get('DraftOrderActions').putValue({
          type: 'TransactionValue',
          on: null,
          value: { type: 'StartOrderDraft' },
        }),
      ),
  };
  return (
    <OrderContext.Provider value={orderContext}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  let orderContext = useContext(OrderContext);
  return orderContext;
}

export function useOrderState() {
  let { order, ...orderStuff } = useContext(OrderContext);
  const orderState = useValue(order ? order.value : null);
  return {
    ...orderStuff,
    orderState,
  };
}

export function useOrderItem(orderItemId) {
  let { order, orderDispatch } = useOrder();

  const menu = useMenu();

  return useMemo(() => {
    const itemMapper = menu && getOrderItemMapper(menu);
    const orderState = order && order.idAndValue.get();

    const orderItem =
      orderState.value &&
      orderState.value.items &&
      orderState.value.items.find(i => i.id === orderItemId);
    const fullOrderItem = orderItem && itemMapper && itemMapper(orderItem);

    return {
      orderDispatch,
      orderItemId,
      orderItem: fullOrderItem,
    };
  }, [orderItemId, order, menu]);
}

export function useOrderSummary() {
  const { orderState } = useOrderState();
  const companyConfig = useCompanyConfig();
  const summary = getOrderSummary(orderState, companyConfig);
  return summary;
}
