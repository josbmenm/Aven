import React from 'react';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';
import { useOrderIdSummary } from '../../ono-cloud/OnoKitchen';
import { useNavigation } from '../../navigation-hooks/Hooks';
import OrderSummary from '../../components/OrderSummary';

export default function MangeOrder() {
  const { getParam } = useNavigation();
  const summary = useOrderIdSummary(getParam('orderId'));
  return (
    <GenericPage>
      <Hero title="Manage Order" />
      <OrderSummary summary={summary} />
    </GenericPage>
  );
}
