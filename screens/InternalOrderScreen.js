import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import { useCloudValue, useCloud } from '../cloud-core/KiteReact';
import formatTime from '../utils/formatTime';
import { Text, View } from 'react-native';
import {
  proseFontFace,
  primaryFontFace,
  monsterra80,
  boldPrimaryFontFace,
} from '../components/Styles';
import formatCurrency from '../utils/formatCurrency';
import Button from '../components/Button';
import Row from '../components/Row';
import Spinner from '../components/Spinner';
import BlockFormInput from '../components/BlockFormInput';
import useKeyboardPopover from '../components/useKeyboardPopover';
import useFocus from '../navigation-hooks/useFocus';

function OrderTasks({ order }) {
  if (!order) return null;
  return (
    <View>
      {order.orderTasks.map(task => {
        return <Row title={task.id} key={task.id} />;
      })}
    </View>
  );
}

function SendReceiptForm({ onClose, order, type }) {
  const [contactValue, setContactValue] = React.useState('');
  const cloud = useCloud();
  function handleSubmit() {
    onClose();
    cloud.dispatch({
      type: 'SendReceipt',
      orderId: order.orderId,
      contact: {
        type,
        value: contactValue,
      },
    });
  }
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      props => (
        <BlockFormInput
          {...props}
          label={type === 'sms' ? 'phone number' : 'email address'}
          mode={type === 'sms' ? 'phone' : 'email'}
          value={contactValue}
          onValue={setContactValue}
        />
      ),
    ],
  });

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>{inputs}</View>
      <Button title="save" onPress={handleSubmit} />
    </View>
  );
}

function ReceiptSection({ order }) {
  const { onPopover: onEmailPopover } = useKeyboardPopover(({ onClose }) => (
    <SendReceiptForm onClose={onClose} order={order} type="email" />
  ));

  const { onPopover: onSMSPopover } = useKeyboardPopover(({ onClose }) => (
    <SendReceiptForm onClose={onClose} order={order} type="sms" />
  ));

  const receipts = order.receipts || [];
  return (
    <Row title="Receipt">
      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: 10 }}>
          {receipts.length === 0 && (
            <Text style={{ ...primaryFontFace, flex: 1 }}>
              No Receipts Sent
            </Text>
          )}
          {receipts.map(receipt => {
            return (
              <Text style={{ ...primaryFontFace }}>
                {receipt.contact.type} at {formatTime(receipt.sendTime)}:{' '}
                {receipt.contact.value}
              </Text>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Button
            title="Send SMS receipt"
            onPress={onSMSPopover}
            style={{ marginHorizontal: 8 }}
          />
          <Button
            title="Send Email receipt"
            onPress={onEmailPopover}
            style={{ marginHorizontal: 8 }}
          />
        </View>
      </View>
    </Row>
  );
}

function PromoSection({ order }) {
  if (!order.promo) {
    return null;
  }
  return (
    <Row title="promo code">
      <Text style={{ ...boldPrimaryFontFace }}>{order.promo.promoCode}</Text>
      {order.promo.type === 'FreeBlends' && (
        <Text style={{ ...boldPrimaryFontFace }}>
          {order.promo.count} free blends
        </Text>
      )}
    </Row>
  );
}
function RefundSection({ order }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const cloud = useCloud();
  const canRefund = order.total > 0 && !order.refundTime;
  return (
    <Row title="Refund">
      <Button
        title={isLoading ? null : 'Refund Charge'}
        disabled={!canRefund || isLoading}
        onPress={() => {
          setIsLoading(true);
          cloud
            .dispatch({ type: 'RefundOrder', orderId: order.orderId })
            .then(() => {
              setIsLoading(false);
            })
            .catch(e => {
              alert('Failure!');
              console.error(e);
              setIsLoading(False);
            });
        }}
      >
        {isLoading && <Spinner />}
      </Button>
      <View style={{ flex: 1, marginHorizontal: 16, justifyContent: 'center' }}>
        {order.refundTime && (
          <Text style={{ ...boldPrimaryFontFace }}>
            Refunded at: {formatTime(order.refundTime)}
          </Text>
        )}
      </View>
    </Row>
  );
}

function OrderPage({ order }) {
  if (!order) {
    return null;
  }
  return (
    <View>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
          {formatTime(order.confirmedTime)}
        </Text>
        <Text style={{ fontSize: 24, ...primaryFontFace, color: '#282828' }}>
          {formatCurrency(order.total)} #{order.orderId}
        </Text>
      </View>
      <PromoSection order={order} />
      <RefundSection order={order} />
      <ReceiptSection order={order} />
    </View>
  );
}

function InternalOrderScreen({ ...props }) {
  const orderId = props.navigation.getParam('orderId');
  const order = useCloudValue(`ConfirmedOrders/${orderId}`);
  return (
    <TwoPanePage
      {...props}
      title={
        order
          ? `Order for ${order.orderName.firstName} ${order.orderName.lastName}`
          : 'Order'
      }
      side={<OrderTasks order={order} />}
    >
      <OrderPage order={order} />
    </TwoPanePage>
  );
}

InternalOrderScreen.navigationOptions = TwoPanePage.navigationOptions;

export default InternalOrderScreen;