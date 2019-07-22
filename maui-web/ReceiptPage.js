import { useNavigation } from '../navigation-hooks/Hooks';
import { View, Text } from 'react-native';
import React from 'react';
import { useCloud } from '../cloud-core/KiteReact';
import GenericPage from './GenericPage';
import useObservable from '../cloud-core/useObservable';
import formatTime from '../utils/formatTime';
import formatCurrency from '../utils/formatCurrency';

function Receipt({ orderValue, orderId }) {
  if (!orderValue) {
    return <Text>Loading..</Text>;
  }
  const cardPresentMeta =
    orderValue.stripeIntent &&
    orderValue.stripeIntent.charges.data[0].source.card_present;
  return (
    <React.Fragment>
      <Text>Order id {orderId}</Text>
      <Text>{formatTime(orderValue.confirmedTime)}</Text>
      <Text>
        {orderValue.orderName.firstName} {orderValue.orderName.lastName}
      </Text>
      <Text>
        {cardPresentMeta.read_method} {cardPresentMeta.brand}{' '}
        {cardPresentMeta.last4}
      </Text>
      {orderValue.refundTime && (
        <Text>
          This order was refunded at {formatTime(orderValue.refundTime)}
        </Text>
      )}
      {orderValue.items.map(item => {
        return (
          <Text>
            {item.displayName} - {item.quantity} x{' '}
            {formatCurrency(item.sellPrice)}
          </Text>
        );
      })}
      <Text>Subtotal: {formatCurrency(orderValue.subTotal)}</Text>
      <Text>Total: {formatCurrency(orderValue.total)}</Text>
    </React.Fragment>
  );
}

export default function ReceiptPage() {
  const { getParam } = useNavigation();
  const cloud = useCloud();
  const orderId = getParam('orderId');
  const orderValue = useObservable(
    cloud && cloud.get(`ConfirmedOrders/${orderId}`).observeValue,
  );
  return (
    <GenericPage>
      <Receipt orderValue={orderValue} orderId={orderId} />
    </GenericPage>
  );
}

ReceiptPage.path = 'receipt/:orderId';
ReceiptPage.navigationOptions = {
  title: 'Receipt',
};
