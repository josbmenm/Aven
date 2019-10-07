import React, { createContext, useContext, useState, useMemo } from 'react';
import { useCloud, useValue } from '../cloud-core/KiteReact';
import { getOrderItemMapper, getOrderSummary } from '../logic/configLogic';
import { useMenu, getLocalName, useCompanyConfig } from './OnoKitchen';
import { getIsLiveMode } from '../card-reader/CardReader';

const OrderContext = createContext(null);

function doCancelOrderIfNotConfirmed(lastOrder) {
  if (lastOrder.isConfirmed) {
    return lastOrder;
  }
  if (lastOrder.isCancelled) {
    return lastOrder;
  }
  return { ...lastOrder, isCancelled: true, cancelledTime: Date.now() };
}

export function OrderContextProvider({ children }) {
  let cloud = useCloud();
  let [currentOrder, setCurrentOrder] = useState(null);
  let [asyncError, setAsyncError] = useState(null);

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

  let orderContext = {
    order: currentOrder,
    setOrderName: name => {
      guardAsync(
        currentOrder.transact(lastOrder => ({
          ...lastOrder,
          orderName: name,
        })),
      );
    },
    resetOrder: () => {
      if (!currentOrder) {
        return;
      }
      guardAsync(currentOrder.transact(doCancelOrderIfNotConfirmed));
      setCurrentOrder(null);
    },
    cancelOrder: () => {
      currentOrder &&
        guardAsync(
          currentOrder.transact(lastOrder => {
            if (lastOrder.isCancelled) {
              return lastOrder;
            }
            return {
              ...lastOrder,
              isCancelled: true,
              cancelledTime: Date.now(),
            };
          }),
        );
    },
    confirmOrder: async paymentIntent => {
      let order = currentOrder;
      if (!order) {
        return;
      }
      const orderState = order.idAndValue.get();
      const isLive = await getIsLiveMode();
      await cloud.dispatch({
        type: 'PlaceOrder',
        orderId: getLocalName(order.getName()),
        order: orderState.value,
        paymentIntent,
        isLive,
      });
    },
    startOrder: () =>
      guardAsync(
        (async () => {
          const order = cloud.get('PendingOrders').children.post();
          setCurrentOrder(order);
          await order.putValue({
            startTime: Date.now(),
            items: [],
          });
        })(),
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

export function useCurrentOrder() {
  let { order } = useContext(OrderContext);
  const observedOrder = useValue(order ? order.value : null);
  if (!observedOrder) {
    return observedOrder;
  }
  return { ...observedOrder, orderId: order && order.getName() };
}

export function useOrderItem(orderItemId) {
  let { order } = useOrder();

  const menu = useMenu();

  return useMemo(() => {
    async function setItemState(item) {
      await order.transact(lastOrder => {
        const lastItems = (lastOrder && lastOrder.items) || [];
        const items = [...lastItems];
        const itemIndex = items.findIndex(i => i.id === item.id);
        if (itemIndex === -1) {
          items.push(item);
        } else {
          items[itemIndex] = item;
        }
        return {
          ...lastOrder,
          items,
        };
      });
    }
    async function removeItem() {
      await order.transact(lastOrder => {
        const lastItems = (lastOrder && lastOrder.items) || [];
        const items = lastItems.filter(i => i.id !== orderItemId);
        return {
          ...lastOrder,
          items,
        };
      });
    }
    const itemMapper = menu && getOrderItemMapper(menu);
    const orderState = order && order.value.get();

    const orderItem =
      orderState &&
      orderState.items &&
      orderState.items.find(i => i.id === orderItemId);
    const fullOrderItem = orderItem && itemMapper(orderItem);

    return {
      orderItemId,
      orderItem: fullOrderItem,
      setItemState,
      removeItem,
      order,
    };
  }, [orderItemId, order, menu]);
}

export function useOrderSummary() {
  const currentOrder = useCurrentOrder();
  const companyConfig = useCompanyConfig();
  const summary = getOrderSummary(currentOrder, companyConfig);
  return summary;
}
