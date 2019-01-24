import React from 'react';
import { Text, View } from 'react-native';
import {
  sellPriceOfMenuItem,
  displayNameOfMenuItem,
} from '../ono-cloud/OnoKitchen';
import { titleStyle, boldPrimaryFontFace, primaryFontFace } from './Styles';
import { formatCurrency } from './Utils';

const receiptTextStyle = {
  color: 'white',
};

function SummaryTitle({ title }) {
  return (
    <Text style={{ fontSize: 36, ...titleStyle, ...receiptTextStyle }}>
      {title}
    </Text>
  );
}
function SummarySubTitle({ title }) {
  return (
    <Text style={{ fontSize: 24, ...titleStyle, ...receiptTextStyle }}>
      {title}
    </Text>
  );
}

const receiptRowTextStyle = {
  ...receiptTextStyle,
  ...boldPrimaryFontFace,
  fontSize: 18,
};

const receiptRowQuantityTextStyle = {
  ...receiptTextStyle,
  ...primaryFontFace,
  fontSize: 15,
};

function ReceiptRow({ label, amount, quantity }) {
  return (
    <View
      style={{ flexDirection: 'row', marginVertical: 8, alignSelf: 'stretch' }}
    >
      <View style={{ marginTop: 2 }}>
        <Text style={receiptRowQuantityTextStyle}>{quantity}x</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text style={receiptRowTextStyle}>{label}</Text>
      </View>
      <View style={{}}>
        <Text style={receiptRowTextStyle}>{formatCurrency(amount)}</Text>
      </View>
    </View>
  );
}

const rollupRowTextSmallStyle = {
  ...titleStyle,
  ...receiptTextStyle,
  fontSize: 18,
};
const rollupRowTextLargeStyle = {
  ...titleStyle,
  ...receiptTextStyle,
  fontSize: 24,
};

function RollupRow({ label, amount, textStyle }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{}}>
        <Text style={textStyle}>{label}</Text>
      </View>
      <View style={{}}>
        <Text style={textStyle}>{formatCurrency(amount)}</Text>
      </View>
    </View>
  );
}

export function getOrderName(summary) {
  const { name } = summary;
  if (typeof name === 'object' && name.firstName) {
    if (name.lastName) {
      return `${name.firstName} ${name.lastName}`;
    }
    return name.firstName;
  }
  if (typeof name === 'string') {
    return name;
  }
  throw new Error('No name on this order summary!');
}

function HorizontalRule() {
  return (
    <View
      style={{
        alignSelf: 'stretch',
        height: 1,
        backgroundColor: 'white',
        marginVertical: 15,
      }}
    />
  );
}
export default function Receipt({ summary, readerState }) {
  if (!summary) {
    return null;
  }
  return (
    <View style={{ padding: 30, width: 520, alignSelf: 'center' }}>
      <SummarySubTitle title={getOrderName(summary)} />
      <SummaryTitle title="order summary" />
      <SummaryTitle title={JSON.stringify(readerState)} />
      <HorizontalRule />
      {summary.items.map(item => (
        <ReceiptRow
          label={displayNameOfMenuItem(item.menuItem)}
          amount={sellPriceOfMenuItem(item.menuItem)}
          quantity={item.quantity}
          key={item.id}
        />
      ))}
      <HorizontalRule />
      <RollupRow
        label="Tax"
        amount={summary.tax}
        textStyle={rollupRowTextSmallStyle}
      />
      <RollupRow
        label="Total"
        amount={summary.total}
        textStyle={rollupRowTextLargeStyle}
      />
    </View>
  );
}
