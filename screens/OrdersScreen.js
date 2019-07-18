import React from 'react';
import { View, Text } from 'react-native';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import { useCloudReducer } from '../cloud-core/KiteReact';
import RowSection from '../components/RowSection';
import {
  proseFontFace,
  primaryFontFace,
  monsterra80,
} from '../components/Styles';
import RestaurantReducer from '../logic/RestaurantReducer';

function OrderInfoText({ orderState }) {
  if (!orderState) {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
        <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
          Unknown Order
        </Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
      <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
        {orderState.name}
      </Text>
      <Text style={{ fontSize: 24, ...primaryFontFace, color: '#282828' }}>
        {orderState.blendName}
      </Text>
    </View>
  );
}

function OrderQueueRow({ onCancel, orderState }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'stretch',
      }}
    >
      <OrderInfoText orderState={orderState} />
      <Text style={{ alignSelf: 'center', margin: 10 }}>
        {orderState.fills.length} fills
      </Text>
      <Button onPress={onCancel} title="Cancel" />
    </View>
  );
}

function OrderQueue({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  return (
    <RowSection title="Order Queue">
      {restaurantState.queue &&
        restaurantState.queue.filter(Boolean).map(orderState => (
          <OrderQueueRow
            key={orderState.id}
            orderState={orderState}
            onCancel={() => {
              dispatch({ type: 'CancelOrder', id: orderState.id });
            }}
          />
        ))}
    </RowSection>
  );
}

function OrdersList({ restaurantState, dispatch }) {
  return <OrderQueue restaurantState={restaurantState} dispatch={dispatch} />;
}

export default function OrdersScreen(props) {
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActions',
    RestaurantReducer,
  );
  return (
    <TwoPanePage
      {...props}
      title="Orders"
      icon="🎟"
      afterSide={null}
      side={
        <OrdersList restaurantState={restaurantState} dispatch={dispatch} />
      }
    >
      {null}
    </TwoPanePage>
  );
}

OrdersScreen.navigationOptions = TwoPanePage.navigationOptions;
