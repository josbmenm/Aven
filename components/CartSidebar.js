import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  highlightPrimaryColor,
  monsterra60,
  headerHeight,
  rightSidebarWidth,
  monsterra30,
  black8,
  primaryFontFace,
  boldPrimaryFontFace,
  monsterra,
} from './Styles';
import { formatCurrency } from './Utils';
import useObservable from '../aven-cloud/useObservable';
import Button from './Button';
import {
  useOrderItem,
  sellPriceOfMenuItem,
  displayNameOfOrderItem,
  getItemCustomizationSummary,
} from '../ono-cloud/OnoKitchen';
import { useNavigation } from '../navigation-hooks/Hooks';
import ListAnimation from './ListAnimation';

const summaryRowLabelStyle = {
  color: highlightPrimaryColor,
  fontSize: 15,
  ...primaryFontFace,
};
const summaryRowCurrencyStyle = {
  ...summaryRowLabelStyle,
  ...boldPrimaryFontFace,
};
const cartRowCurrencyStyle = {
  marginTop: 20,
  marginBottom: 10,
  color: highlightPrimaryColor,
  fontSize: 12,
  ...primaryFontFace,
};
const cartRowTitleStyle = {
  color: highlightPrimaryColor,
  fontSize: 16,
  lineHeight: 15,
  ...boldPrimaryFontFace,
  marginBottom: 5,
};

function SummaryRow({ label, amount, emphasize }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 20,
      }}
    >
      <View style={{}}>
        <Text style={summaryRowLabelStyle}>{label}</Text>
      </View>
      <View style={{}}>
        <Text style={summaryRowCurrencyStyle}>{formatCurrency(amount)}</Text>
      </View>
    </View>
  );
}

function SmallButton({ icon, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderRadius: 4,
        marginRight: 4,
        borderColor: monsterra30,
        width: 40,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        source={icon}
        style={{ tintColor: monsterra60, width: 14, height: 14 }}
        resizeMode="contain"
      />
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

function CartRow({ itemId, item }) {
  let { navigate } = useNavigation();
  let { setItemState, removeItem } = useOrderItem(itemId);
  if (!item || !item.menuItem) {
    return null;
  }
  function goToItem() {
    if (item.type === 'blend') {
      navigate({
        routeName: 'Blend',
        params: {
          orderItemId: itemId,
          menuItemId: item.menuItem.id,
        },
        key: `blend-item-${itemId}`,
      });
    } else if (item.type === 'food') {
      navigate({
        routeName: 'Food',
        params: {
          id: item.menuItem.id,
        },
        key: `food-item-${item.menuItem.id}`,
      });
    }
  }
  return (
    <TouchableWithoutFeedback onPress={goToItem}>
      <View
        style={{
          paddingRight: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
          borderBottomWidth: 1,
          borderBottomColor: black8,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={cartRowCurrencyStyle}>
            {formatCurrency(sellPriceOfMenuItem(item.menuItem))}
          </Text>
          <View style={{}}>
            <Text style={cartRowTitleStyle}>
              {displayNameOfOrderItem(item, item.menuItem)}
            </Text>
          </View>
          {getItemCustomizationSummary(item).map((summaryItem, index) => (
            <Text
              key={index}
              style={{ color: monsterra, ...primaryFontFace, marginBottom: 8 }}
            >
              - {summaryItem}
            </Text>
          ))}
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            {item.type === 'blend' && (
              <SmallButton
                title="customize"
                icon={require('./assets/EditIcon.png')}
                onPress={goToItem}
              />
            )}
            <SmallButton
              title="remove"
              icon={require('./assets/DeleteIcon.png')}
              onPress={removeItem}
            />
          </View>
        </View>
        <View
          style={{
            marginVertical: 20,
            width: 40,
            alignItems: 'center',
          }}
        >
          <StepperButton
            disabled={false}
            onPress={() => {
              setItemState({
                ...item.state,
                quantity: item.quantity + 1,
              });
            }}
          />
          <Text
            style={{
              marginTop: 20,
              marginBottom: 20,
              marginHorizontal: 5,
              fontSize: 15,
              color: highlightPrimaryColor,
              ...primaryFontFace,
            }}
          >
            {item.quantity}
          </Text>
          <StepperButton
            isDown
            disabled={item.quantity <= 1}
            onPress={() => {
              setItemState({
                ...item.state,
                quantity: item.quantity - 1,
              });
            }}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default function Cart({ summary }) {
  const { navigate } = useNavigation();
  if (!summary) {
    return null;
  }
  return (
    <ScrollView
      style={{ marginTop: headerHeight, maxWidth: rightSidebarWidth }}
      contentContainerStyle={{ paddingVertical: 20 }}
    >
      <View style={{ backgroundColor: 'white', paddingLeft: 20 }}>
        <ListAnimation
          list={summary.items}
          renderItem={item => (
            <CartRow key={item.id} item={item} itemId={item.id} />
          )}
        />
        <View style={{ height: 80 }} />
        <SummaryRow label="taxes" amount={summary.tax} />
        <SummaryRow label="total" amount={summary.total} emphasize />
      </View>
      <Button
        title="checkout"
        style={{ margin: 20 }}
        onPress={() => {
          navigate('CollectName');
        }}
      />
    </ScrollView>
  );
}
