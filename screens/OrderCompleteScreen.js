import React from 'react';
import useEmptyOrderEscape from './useEmptyOrderEscape';
import OrderCompletePage from '../components/OrderCompletePage';

export default function OrderCompleteScreen({ props }) {
  useEmptyOrderEscape();
  return <OrderCompletePage {...props} backBehavior={null} />;
}

OrderCompleteScreen.navigationOptions = OrderCompletePage.navigationOptions;
