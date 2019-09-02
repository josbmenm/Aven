import React from 'react';
import GenericPage from '../components/GenericPage';
import { useCloudValue } from '../cloud-core/KiteReact';
import { Text, View } from 'react-native';
import {
  proseFontFace,
  primaryFontFace,
  monsterra80,
} from '../components/Styles';
import formatCurrency from '../utils/formatCurrency';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

function RefundButton({ orderId }) {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Button
      title={isLoading ? null : 'Refund Charge'}
      disabled={isLoading}
      onPress={() => {
        setIsLoading(true);
      }}
    >
      {isLoading && <Spinner />}
    </Button>
  );
}

function OrderPage({ order }) {
  if (!order) {
    return null;
  }
  return (
    <View>
      <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
        {order.orderName.firstName} {order.orderName.lastName}
      </Text>
      <Text style={{ fontSize: 24, ...primaryFontFace, color: '#282828' }}>
        {order.orderTasks.length} blend
        {order.orderTasks.length === 1 ? '' : 's'} -{' '}
        {formatCurrency(order.total)}
      </Text>
      <RefundButton orderId={order.orderId} />
    </View>
  );
}

function InternalOrderScreen({ ...props }) {
  const orderId = props.navigation.getParam('orderId');
  const order = useCloudValue(`ConfirmedOrders/${orderId}`);
  return (
    <GenericPage {...props}>
      <OrderPage order={order} />
    </GenericPage>
  );
}

InternalOrderScreen.navigationOptions = GenericPage.navigationOptions;

export default InternalOrderScreen;
