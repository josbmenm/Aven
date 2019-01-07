import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { highlightPrimaryColor } from './Styles';
import { formatCurrency } from './Utils';
import useObservable from '../aven-cloud/useObservable';
import { useOrderItem } from '../ono-cloud/OnoKitchen';

const summaryRowLabelStyle = {
  color: highlightPrimaryColor,
  fontSize: 20,
  fontFamily: 'Maax',
};
const summaryRowCurrencyStyle = {
  ...summaryRowLabelStyle,
  fontFamily: 'Maax-Bold',
};
const cartRowCurrencyStyle = {
  color: highlightPrimaryColor,
  fontSize: 20,
  fontFamily: 'Maax',
};
const cartRowTitleStyle = {
  color: highlightPrimaryColor,
  fontSize: 20,
  fontFamily: 'Maax-Bold',
};

function SummaryRow({ label, amount, emphasize }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{}}>
        <Text style={summaryRowLabelStyle}>{label}</Text>
      </View>
      <View style={{}}>
        <Text style={summaryRowCurrencyStyle}>{formatCurrency(amount)}</Text>
      </View>
    </View>
  );
}

function SmallButton({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ padding: 5 }}>
        <Text>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function StepperButton({ icon, onPress, disabled }) {
  const buttonOpacity = disabled ? 0.5 : 1;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ opacity: buttonOpacity }}
    >
      <Text>{icon}</Text>
    </TouchableOpacity>
  );
}

function CartRow({ itemId }) {
  let { orderItem, setItem, removeItem } = useOrderItem(itemId);
  const item = orderItem && useObservable(orderItem.observeValue);
  console.log('ze item', item);
  if (!item || !item.menuItem) {
    return null;
  }
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{}}>
        <Text style={cartRowCurrencyStyle}>
          {formatCurrency(item.menuItem.Recipe['Sell Price'])}
        </Text>
        <View style={{}}>
          <Text style={cartRowTitleStyle}>{item.menuItem['Display Name']}</Text>
        </View>
        <View style={{}}>
          <SmallButton title="customize" />
          <SmallButton title="remove" onPress={removeItem} />
        </View>
      </View>
      <View
        style={{
          width: 80,
          alignSelf: 'stretch',
          alignItems: 'flex-end',
        }}
      >
        <StepperButton
          icon={'👍'}
          disabled={false}
          onPress={() => {
            setItem({
              ...item,
              quantity: item.quantity + 1,
            });
          }}
        />
        <Text
          style={{
            marginVertical: 20,
            marginHorizontal: 5,
            fontSize: 32,
            color: highlightPrimaryColor,
          }}
        >
          {item.quantity}
        </Text>
        <StepperButton
          icon={'👎'}
          disabled={item.quantity <= 1}
          onPress={() => {
            setItem({
              ...item,
              quantity: item.quantity - 1,
            });
          }}
        />
      </View>
    </View>
  );
}

export default function Cart({ summary }) {
  if (!summary) {
    return null;
  }
  return (
    <View style={{ backgroundColor: 'white', padding: 30 }}>
      {summary.items.map(item => (
        <CartRow itemId={item.id} key={item.id} />
      ))}
      <View style={{ height: 80 }} />
      <SummaryRow label="taxes" amount={summary.tax} />
      <SummaryRow label="total" amount={summary.total} emphasize />
    </View>
  );
}
