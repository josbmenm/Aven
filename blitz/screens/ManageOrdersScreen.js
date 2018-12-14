import React from 'react';
import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import Row from '../../components/Row';
import Hero from '../../components/Hero';
import Button from '../../components/Button';
import { useOrders } from '../../ono-cloud/OnoKitchen';

export default function ManageOrdersScreen() {
  const orders = useOrders();
  return (
    <GenericPage>
      <Hero title="Manage Orders" />
      <RowSection>
        {orders.map(order => (
          <Row title={order.id}>
            <Button onPress={() => {}} title="Destroy" />
          </Row>
        ))}
      </RowSection>
    </GenericPage>
  );
}
