import React from 'react';
import Tag from '../components/Tag';
import GenericPage from '../components/GenericPage';
import RowSection from '../components/RowSection';
import LinkRow from '../components/LinkRow';
import Hero from '../components/Hero';
import Button from '../components/Button';
import { useOrders } from '../ono-cloud/OnoKitchen';
import { useNavigation } from '../navigation-hooks/Hooks';

function PendingStateTag() {
  return <Tag title="Pending" color="#4358A9" />;
}

function ConfirmedStateTag() {
  return <Tag title="Confirmed" color="#8A43A9" />;
}

function CancelledStateTag() {
  return <Tag title="Cancelled" color="#504D51" />;
}

const StateTags = {
  pending: PendingStateTag,
  cancelled: CancelledStateTag,
  confirmed: ConfirmedStateTag,
};

function ManageOrderRow({ order }) {
  if (!order.summary) {
    return null; // simple hack around the _auth object showing up
  }
  const title = order.id;
  const StateTag = StateTags[order.summary.state];
  const { navigate } = useNavigation();
  return (
    <LinkRow
      title={title}
      onPress={() => {
        navigate('ManageOrder', { orderId: order.id });
      }}
    >
      {!order.summary.isCancelled && (
        <Button title="Cancel" onPress={order.cancel} />
      )}
      <StateTag />
    </LinkRow>
  );
}

export default function MangeOrders(props) {
  const orders = useOrders();
  return (
    <GenericPage {...props}>
      <Hero title="Manage Orders" />
      <RowSection>
        {orders.map(order => (
          <ManageOrderRow key={order.id} order={order} />
        ))}
      </RowSection>
    </GenericPage>
  );
}
MangeOrders.navigationOptions = GenericPage.navigationOptions;
