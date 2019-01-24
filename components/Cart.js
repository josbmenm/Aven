import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { highlightPrimaryColor, monsterra60 } from './Styles';
import { formatCurrency } from './Utils';
import useObservable from '../aven-cloud/useObservable';
import {
  useOrderItem,
  sellPriceOfMenuItem,
  displayNameOfMenuItem,
} from '../ono-cloud/OnoKitchen';
import { useNavigation } from '../navigation-hooks/Hooks';

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
        <Text style={{ color: highlightPrimaryColor }}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function StepperButton({ onPress, disabled, isDown }) {
  const buttonOpacity = disabled ? 0.5 : 1;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ opacity: buttonOpacity }}
      hitSlop={{ left: 40, right: 40, top: 40, bottom: 40 }}
    >
      <Image
        source={require('./Up.png')}
        style={{
          width: 30,
          height: 12,
          tintColor: monsterra60,
          transform: [{ rotate: isDown ? '180deg' : '0deg' }],
        }}
      />
    </TouchableOpacity>
  );
}

function CartRow({ itemId }) {
  let { navigate } = useNavigation();
  let { orderItem, setItem, removeItem } = useOrderItem(itemId);
  const item = useObservable(orderItem && orderItem.observeValue);
  if (!item || !item.menuItem) {
    return null;
  }
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={cartRowCurrencyStyle}>
          {formatCurrency(sellPriceOfMenuItem(item.menuItem))}
        </Text>
        <View style={{}}>
          <Text style={cartRowTitleStyle}>
            {displayNameOfMenuItem(item.menuItem)}
          </Text>
        </View>
        <View style={{}}>
          <SmallButton
            title="customize"
            onPress={() => {
              navigate('CustomizeBlend', {
                orderItemId: itemId,
                menuItemId: item.menuItem.id,
              });
            }}
          />
          <SmallButton title="remove" onPress={removeItem} />
        </View>
      </View>
      <View
        style={{
          width: 40,
          alignSelf: 'stretch',
          alignItems: 'flex-end',
        }}
      >
        <StepperButton
          disabled={false}
          onPress={() => {
            setItem({
              ...item.state,
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
          isDown
          disabled={item.quantity <= 1}
          onPress={() => {
            setItem({
              ...item.state,
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
    <View style={{ backgroundColor: 'white', paddingHorizontal: 20 }}>
      {summary.items.map(item => (
        <CartRow itemId={item.id} key={item.id} />
      ))}
      <View style={{ height: 80 }} />
      <SummaryRow label="taxes" amount={summary.tax} />
      <SummaryRow label="total" amount={summary.total} emphasize />
    </View>
  );
}
