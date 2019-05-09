import React from 'react';
import OrderCompletePage from '../components/OrderCompletePage';

export default function OrderCompleteScreen({ ...props }) {
  return (
    <OrderCompletePage
      {...props}
      backBehavior={null}
      backRouteName="KioskHome"
    />
  );
}

OrderCompleteScreen.navigationOptions = OrderCompletePage.navigationOptions;

export function OrderCompletePortalScreen({ ...props }) {
  return (
    <OrderCompletePage {...props} backBehavior={null} backRouteName="Home" />
  );
}

OrderCompletePortalScreen.navigationOptions =
  OrderCompletePage.navigationOptions;
