import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import Row from '../components/Row';
import StatusBar from '../components/StatusBar';
import RowSection from '../components/RowSection';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import { useCloudValue } from '../cloud-core/KiteReact';
import { View, Text, TouchableOpacity } from 'react-native';
import formatCurrency from '../utils/formatCurrency';
import {
  proseFontFace,
  primaryFontFace,
  monsterra80,
} from '../components/Styles';
import formatTime from '../utils/formatTime';

function OrderRow({ order }) {
  const { navigate } = useNavigation();
  if (!order || !order.orderName || !order.orderTasks) {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
        <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
          Unknown Order
        </Text>
      </View>
    );
  }
  return (
    <TouchableOpacity
      onPress={() => {
        navigate('InternalOrder', { orderId: order.id });
      }}
    >
      <Row>
        <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
          <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
            {order.orderName.firstName} {order.orderName.lastName}
            {' - '}
            {formatTime(order.confirmedTime)}
          </Text>
          <Text style={{ fontSize: 24, ...primaryFontFace, color: '#282828' }}>
            {order.orderTasks.length} blend
            {order.orderTasks.length === 1 ? '' : 's'} -{' '}
            {formatCurrency(order.total)}
          </Text>
        </View>
      </Row>
    </TouchableOpacity>
  );
}

function OrdersList({ restaurantState, dispatch }) {
  const recentOrders = useCloudValue('RecentOrders');
  if (!recentOrders || !recentOrders.orders) {
    return null;
  }
  return (
    <RowSection title="recent orders">
      {recentOrders.orders
        .map(order => {
          return <OrderRow order={order} key={order.id} />;
        })
        .reverse()}
    </RowSection>
  );
}

export default function OrdersScreen(props) {
  const [restaurantState, dispatch] = useRestaurantState();
  const navigation = useNavigation();
  return (
    <TwoPanePage
      {...props}
      afterSide={null}
      hideBackButton
      footer={<StatusBar />}
      side={
        <OrdersList restaurantState={restaurantState} dispatch={dispatch} />
      }
    >
      <Row title="new order">
        <Button
          title="start kiosk order"
          onPress={() => {
            navigation.navigate({ routeName: 'ProductHome' });
          }}
        />
      </Row>
    </TwoPanePage>
  );
}

OrdersScreen.navigationOptions = TwoPanePage.navigationOptions;
