import { useNavigation } from '../navigation-hooks/Hooks';
import { View, Text } from 'react-native';
import React from 'react';
import { useCloudValue } from '../cloud-core/KiteReact';
import GenericPage from './GenericPage';
import formatTime from '../utils/formatTime';
import formatCurrency from '../utils/formatCurrency';
import GenericImageHeader from './GenericImageHeader';
import PageFooter from './PageFooter';

function Receipt({ orderValue, orderId }) {
  if (!orderValue) {
    return <Text>Loading..</Text>;
  }
  return (
    <React.Fragment>
      <Text>Order id {orderId}</Text>
      <Text>{formatTime(orderValue.confirmedTime)}</Text>
      <Text>
        {orderValue.orderName.firstName} {orderValue.orderName.lastName}
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
  const orderId = getParam('orderId');
  const orderValue = useCloudValue(`ConfirmedOrders/${orderId}`);

  return (
    <GenericPage>
      <View style={{ flex: 1, paddingBottom: 40 }}>
        <GenericImageHeader />
        <Receipt orderValue={orderValue} orderId={orderId} />
      </View>
      <PageFooter />
    </GenericPage>
  );
}

ReceiptPage.path = 'receipt/:orderId';
ReceiptPage.navigationOptions = {
  title: 'Receipt',
};
