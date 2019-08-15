import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import Row from '../components/Row';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useRestaurantState } from '../ono-cloud/Kitchen';

function OrdersList({ restaurantState, dispatch }) {
  return null;
}

export default function OrdersScreen(props) {
  const [restaurantState, dispatch] = useRestaurantState();
  const navigation = useNavigation();
  return (
    <TwoPanePage
      {...props}
      afterSide={null}
      hideBackButton
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
