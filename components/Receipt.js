import React from 'react';
import { Text, View } from 'react-native';
import {
  sellPriceOfMenuItem,
  displayNameOfOrderItem,
  getItemCustomizationSummary,
} from '../ono-cloud/OnoKitchen';
import { titleStyle, boldPrimaryFontFace, primaryFontFace } from './Styles';
import formatCurrency from '../utils/formatCurrency';

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

function ReceiptRow({ label, amount, quantity, summary }) {
  return (
    <View
      style={{ flexDirection: 'row', marginVertical: 8, alignSelf: 'stretch' }}
    >
      <View style={{ marginTop: 2 }}>
        <Text style={receiptRowQuantityTextStyle}>{quantity}x</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text style={receiptRowTextStyle}>{label}</Text>
        {summary.map((summaryItem, index) => (
          <Text key={index} style={receiptRowTextStyle}>
            - {summaryItem}
          </Text>
        ))}
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
export default function Receipt({ summary }) {
  if (!summary) {
    return null;
  }
  return (
    <View style={{ padding: 30, width: 520, alignSelf: 'center' }}>
      <SummarySubTitle title={getOrderName(summary)} />
      <SummaryTitle title="order summary" />
      <HorizontalRule />
      {summary.items.map(item => (
        <ReceiptRow
          label={displayNameOfOrderItem(item, item.menuItem)}
          amount={item.itemPrice}
          quantity={item.quantity}
          key={item.id}
          summary={getItemCustomizationSummary(item)}
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
