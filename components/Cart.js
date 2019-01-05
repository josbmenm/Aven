import React from 'react';
import { Text, View } from 'react-native';
import { highlightPrimaryColor } from './Styles';
import { formatCurrency } from './Utils';

const summaryRowLabelStyle = {
  color: highlightPrimaryColor,
  fontSize: 20,
  fontFamily: 'Maax',
};
const summaryRowCurrencyStyle = {
  ...summaryRowLabelStyle,
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

function CartRow({ item }) {
  const textStyle = { fontSize: 22, color: '#333' };
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1 }}>
        <Text style={textStyle}>{item.menuItem['Display Name']}</Text>
      </View>
      <View style={{ width: 180 }}>
        <Text style={textStyle}>
          {currency.format(item.menuItem.Recipe['Sell Price'])}
        </Text>
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
        <CartRow item={item} key={item.id} />
      ))}
      <View style={{ height: 80 }} />
      <SummaryRow label="taxes" amount={summary.tax} />
      <SummaryRow label="total" amount={summary.total} emphasize />
    </View>
  );
}
