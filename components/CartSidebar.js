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
  titleStyle,
  monsterra80,
  monsterra5,
  monsterraLight,
} from './Styles';
import formatCurrency from '../utils/formatCurrency';
import { useOrder, useOrderItem } from '../ono-cloud/OrderContext';
import {
  displayNameOfOrderItem,
  getItemCustomizationSummary,
} from '../ono-cloud/OnoKitchen';
import { useRestaurantConfig } from '../logic/RestaurantConfig';
import { useNavigation } from '../navigation-hooks/Hooks';
import ListAnimation from './ListAnimation';
import usePromoPopover from './usePromoPopover';
import { Spacing, Button } from '../dash-ui';

const summaryRowLabelStyle = {
  color: highlightPrimaryColor,
  fontSize: 15,
  ...primaryFontFace,
};
const cartRowCurrencyStyle = {
  marginTop: 20,
  marginBottom: 5,
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

function SummaryRow({ label, amount, fakeAmount }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 20,
        marginTop: 9,
      }}
    >
      <View style={{}}>
        <Text style={summaryRowLabelStyle}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {!!fakeAmount && fakeAmount !== amount && (
          <Text
            style={{
              textDecorationLine: 'line-through',
              marginHorizontal: 8,
              ...summaryRowLabelStyle,
            }}
          >
            {formatCurrency(fakeAmount)}
          </Text>
        )}
        <Text
          style={{
            ...summaryRowLabelStyle,
            ...boldPrimaryFontFace,
          }}
        >
          {formatCurrency(amount)}
        </Text>
      </View>
    </View>
  );
}

function SmallButton({ icon, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ left: 5, top: 5, right: 20, bottom: 20 }}
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
      hitSlop={{ left: 60, right: 60, top: 25, bottom: 25 }}
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

function CartRow({ itemId, item, hideMoney }) {
  let { navigate } = useNavigation();
  let { orderDispatch } = useOrderItem(itemId);
  console.log('sooooo', item, itemId);
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
          id: item.foodItemId,
        },
        key: `food-item-${item.menuItem.id}`,
      });
    }
  }
  function customizeItem() {
    navigate({
      routeName: 'CustomizeBlend',
      key: `Customize-${itemId}`,
      params: {
        orderItemId: itemId,
        menuItemId: item.menuItem.id,
      },
    });
  }
  return (
    <TouchableWithoutFeedback onPress={goToItem}>
      <View
        style={{
          paddingRight: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
          borderBottomWidth: 1,
          borderBottomColor: black8,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...cartRowCurrencyStyle,
              opacity: hideMoney ? 0 : 1,
            }}
          >
            {formatCurrency(item.itemPrice)}
          </Text>
          <View style={{}}>
            <Text style={cartRowTitleStyle}>
              {displayNameOfOrderItem(item, item.menuItem)}
            </Text>
          </View>
          {getItemCustomizationSummary(item).map((summaryItem, index) => (
            <Text
              key={index}
              style={{
                color: monsterra,
                ...primaryFontFace,
                marginBottom: 8,
                lineHeight: 12,
                fontSize: 13,
              }}
            >
              - {summaryItem}
            </Text>
          ))}
          <View
            style={{ flexDirection: 'row', marginBottom: 20, marginTop: 4 }}
          >
            {item.type === 'blend' && false && (
              <SmallButton
                title="customize"
                icon={require('./assets/EditIcon.png')}
                onPress={customizeItem}
              />
            )}
            <SmallButton
              title="remove"
              icon={require('./assets/DeleteIcon.png')}
              onPress={() => {
                orderDispatch({
                  type: 'RemoveItem',
                  itemId,
                });
              }}
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
              orderDispatch({
                type: 'IncrementQuantity',
                itemId,
                increment: 1,
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
              orderDispatch({
                type: 'IncrementQuantity',
                itemId,
                increment: -1,
              });
            }}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

function PromoCode({ promo }) {
  const { orderDispatch } = useOrder();
  const onPopover = usePromoPopover();
  if (promo) {
    return (
      <View
        style={{
          backgroundColor: monsterra5,
          padding: 8,
          margin: 16,
          marginLeft: 0,
          borderRadius: 4,
          flexDirection: 'row',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...primaryFontFace,
              color: monsterra80,
              fontSize: 14,
            }}
          >
            promo code{' '}
            <Text style={{ ...boldPrimaryFontFace }}>{promo.promoCode}</Text>
          </Text>
          <Text
            style={{
              fontSize: 12,
              ...primaryFontFace,
              color: monsterra80,
            }}
          >
            {promo.count} free blend{promo.count > 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={{ padding: 8 }}
          hitSlop={{ top: 15, right: 15, left: 15, right: 15 }}
          onPress={() => {
            orderDispatch({
              type: 'SetPromo',
              promo: null,
            }).catch(e => {
              error('ClearPromoFailure', { code: e.message });
            });
          }}
        >
          <Image
            source={require('./assets/DeleteIcon.png')}
            style={{ width: 10, height: 13, tintColor: monsterraLight }}
          />
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPopover}
      style={{
        backgroundColor: monsterra5,
        paddingTop: 16,
        height: 45,
        margin: 16,
        marginLeft: 0,
        borderRadius: 4,
      }}
    >
      <Text
        style={{
          ...titleStyle,
          color: monsterra80,
          textAlign: 'center',
        }}
      >
        add promo code
      </Text>
    </TouchableOpacity>
  );
}

export default function Cart({ summary }) {
  const { navigate } = useNavigation();
  const restaurantConfig = useRestaurantConfig();
  if (!summary) {
    return null;
  }
  const shouldHideMoney =
    restaurantConfig && restaurantConfig.mode === 'catering';
  console.log('whey buddy', summary.items);
  return (
    <ScrollView
      style={{ marginTop: headerHeight, maxWidth: rightSidebarWidth }}
      contentContainerStyle={{ paddingVertical: 20 }}
    >
      <Spacing top={20} left={20}>
        <ListAnimation
          list={summary.items}
          renderItem={item => (
            <CartRow
              key={item.id}
              item={item}
              itemId={item.id}
              hideMoney={shouldHideMoney}
            />
          )}
        />
        {!shouldHideMoney && (
          <View style={{ marginTop: 9, marginBottom: 4 }}>
            <PromoCode promo={summary.promo} />
            <SummaryRow label="taxes" amount={summary.tax} />
            <SummaryRow
              label="total"
              amount={summary.total}
              fakeAmount={summary.totalBeforeDiscount}
              emphasize
            />
          </View>
        )}
        <Spacing right={16} top={12}>
          <Button
            title={shouldHideMoney ? 'place order' : 'checkout'}
            onPress={() => {
              navigate('CollectName');
            }}
            onLongPress={() => {
              navigate('CollectName', { freePendantOrder: true });
            }}
          />
        </Spacing>
      </Spacing>
    </ScrollView>
  );
}
