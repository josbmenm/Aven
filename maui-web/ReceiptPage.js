import { useNavigation } from '../navigation-hooks/Hooks';
import { View, Text } from 'react-native';
import React from 'react';
import { useCloudValue } from '../cloud-core/KiteReact';
import GenericPage from './GenericPage';
import formatTime from '../utils/formatTime';
import BaseText from '../dashboard-ui-deprecated/BaseText';
import Heading from '../dashboard-ui-deprecated/Heading';
import Container from '../dashboard-ui-deprecated/Container';
import { useTheme } from '../dashboard-ui-deprecated/Theme';
import formatCurrency from '../utils/formatCurrency';
import GenericImageHeader from './GenericImageHeader';
import PageFooter from './PageFooter';

function Receipt({ orderValue, orderId }) {
  if (orderValue === null) {
    return <Text>Order not found.</Text>;
  }
  if (orderValue === undefined) {
    return <Text>Loading..</Text>;
  }
  const theme = useTheme();
  if (!orderValue.orderName) {
    // this should never happen
    return null;
  }
  return (
    <Container>
      <Heading>
        Order for {orderValue.orderName.firstName}{' '}
        {orderValue.orderName.lastName}
      </Heading>
      <BaseText>Order #{orderId}</BaseText>
      <BaseText>{formatTime(orderValue.confirmedTime)}</BaseText>

      {orderValue.refundTime && (
        <View
          style={{
            padding: 20,
            borderRadius: 8,
            backgroundColor: theme.colors.lighterGrey,
          }}
        >
          <BaseText>
            This order was refunded at {formatTime(orderValue.refundTime)}
          </BaseText>
        </View>
      )}
      {orderValue.promo && (
        <View
          style={{
            padding: 20,
            borderRadius: 8,
            backgroundColor: theme.colors.lighterGrey,
          }}
        >
          <BaseText>Promo code used.</BaseText>
        </View>
      )}
      {orderValue.items.map(item => {
        return (
          <BaseText key={item.id}>
            {item.displayName} - {item.quantity} x{' '}
            {formatCurrency(item.sellPrice)}
          </BaseText>
        );
      })}
      <View style={{ marginTop: 40 }}>
        <BaseText>Subtotal: {formatCurrency(orderValue.subTotal)}</BaseText>
        <BaseText>Total: {formatCurrency(orderValue.total)}</BaseText>
      </View>
    </Container>
  );
}

export default function ReceiptPage() {
  const { getParam } = useNavigation();
  const orderId = getParam('orderId');
  const orderValue = useCloudValue(`OrderState/${orderId}`);

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
ReceiptPage.navigationOptions = ({ navigation, screenProps }) => {
  const cloud = screenProps.cloud;
  const orderId = navigation.getParam('orderId');
  const orderDoc = cloud.get(`OrderState/${orderId}`);
  return {
    title: 'Receipt',
    loadData: async () => {
      if (cloud) {
        return [await orderDoc.export()];
      }
    },
  };
};
