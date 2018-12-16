import React from 'react';
import Tag from '../../components/Tag';
import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import Row from '../../components/Row';
import Hero from '../../components/Hero';
import Button from '../../components/Button';
import { useOrders } from '../../ono-cloud/OnoKitchen';
import AdminSessionContainer from '../AdminSessionContainer';

function PendingStateTag() {
  return <Tag title="Pending" color="blue" />;
}

function ConfirmedStateTag() {
  return <Tag title="Confirmed" color="green" />;
}

const StateTags = {
  pending: PendingStateTag,
  confirmed: ConfirmedStateTag,
};

function ManageOrderRow({ order }) {
  console.log(order);
  const title = order.summary.name || order.id;
  const StateTag = StateTags[order.summary.state];
  return (
    <Row title={title}>
      <Button title="Delete" onPress={order.destroy} />
      <StateTag />
    </Row>
  );
}

function MangeOrders() {
  const orders = useOrders();
  return (
    <GenericPage>
      <Hero title="Manage Orders" />
      <RowSection>
        {orders.map(order => (
          <ManageOrderRow key={order.id} order={order} />
        ))}
      </RowSection>
    </GenericPage>
  );
}

export default function ManageOrdersScreen() {
  return (
    <AdminSessionContainer>
      <MangeOrders />
    </AdminSessionContainer>
  );
}
