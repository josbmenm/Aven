import React from 'react';
import { Text, View } from 'react-native';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});
function RecieptRow({ label, amount, emphasize }) {
  const textStyle = { fontSize: 32, color: emphasize ? '#111' : '#333' };
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1 }}>
        <Text style={textStyle}>{label}</Text>
      </View>
      <View style={{ width: 180 }}>
        <Text style={textStyle}>{currency.format(amount)}</Text>
      </View>
    </View>
  );
}

function OrderItemRow({ item }) {
  return (
    <RecieptRow
      label={item.menuItem['Display Name']}
      amount={item.menuItem.Recipe['Sell Price']}
      emphasize
    />
  );
}

export default function OrderSummary({ summary }) {
  if (!summary) {
    return null;
  }
  return (
    <View style={{ backgroundColor: 'white', padding: 30 }}>
      <Text style={{ fontSize: 52 }}>Review order for "{summary.name}"</Text>
      {summary.items.map(item => (
        <OrderItemRow item={item} key={item.id} />
      ))}
      <View style={{ height: 80 }} />
      <RecieptRow label="SubTotal" amount={summary.subTotal} />
      <RecieptRow label="Tax" amount={summary.tax} />
      <RecieptRow label="Total" amount={summary.total} emphasize />
    </View>
  );
}
