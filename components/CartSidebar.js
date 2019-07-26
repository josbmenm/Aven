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
  buttonHeight,
} from './Styles';
import formatCurrency from '../utils/formatCurrency';
import Button from './Button';
import {
  useOrder,
  useOrderItem,
  sellPriceOfMenuItem,
  displayNameOfOrderItem,
  getItemCustomizationSummary,
} from '../ono-cloud/OnoKitchen';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import BlockFormTitle from './BlockFormTitle';
import BlockFormMessage from './BlockFormMessage';
import BlockFormInput from './BlockFormInput';
import BlockFormButton from './BlockFormButton';
import BlockFormRow from './BlockFormRow';
import { useCloud } from '../cloud-core/KiteReact';
import { useNavigation } from '../navigation-hooks/Hooks';
import { Easing } from 'react-native-reanimated';
import ListAnimation from './ListAnimation';
import useFocus from '../navigation-hooks/useFocus';

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
      <View style={{}}>
        <Text style={summaryRowCurrencyStyle}>
          {fakeAmount && fakeAmount !== amount && (
            <Text
              style={{
                textDecorationLine: 'line-through',
                paddingHorizontal: 5,
              }}
            >
              {formatCurrency(fakeAmount)}
            </Text>
          )}
          <Text style={{}}>{formatCurrency(amount)}</Text>
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
          <Text style={cartRowCurrencyStyle}>
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
            {item.type === 'blend' && (
              <SmallButton
                title="customize"
                icon={require('./assets/EditIcon.png')}
                onPress={customizeItem}
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

function BlockFormErrorRow({ error }) {
  return (
    <View style={{ minHeight: 45, padding: 10 }}>
      {error && (
        <Text style={{ color: monsterra, ...primaryFontFace, fontSize: 14 }}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

function PromoCodeForm({ onClose, order, cloud }) {
  const [error, setError] = React.useState(null);
  const [promoCode, setPromoCode] = React.useState('');
  const inputRenderers = [
    inputProps => (
      <BlockFormInput
        label="promo code"
        mode="code"
        onValue={setPromoCode}
        value={promoCode}
        upperCase
        {...inputProps}
      />
    ),
  ];

  function handleSubmit() {
    setError(null);
    cloud
      .dispatch({
        type: 'ValidatePromoCode',
        promoCode,
      })
      .then(validPromo => {
        if (!validPromo) {
          setError({
            message: 'This promo code is invalid. Please try again.',
          });
          return;
        }
        onClose();
        return order.transact(lastOrder => ({
          ...lastOrder,
          promo: validPromo,
        }));
      })
      .catch(e => {
        setError(e);
      });
  }
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });
  return (
    <View style={{ padding: 80 }}>
      <BlockFormMessage message="You’ve got a code? Lucky you!" />
      <BlockFormTitle title="whats your promo code?" />
      <BlockFormRow>{inputs}</BlockFormRow>
      <BlockFormErrorRow error={error} />
      <BlockFormRow>
        <BlockFormButton title="cancel" type="outline" onPress={onClose} />
        <BlockFormButton title="add code" onPress={handleSubmit} />
      </BlockFormRow>
    </View>
  );
}

function usePromoPopover() {
  const { order } = useOrder();
  const cloud = useCloud();

  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <PromoCodeForm onClose={onClose} order={order} cloud={cloud} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return onPopover;
}

function PromoCode({ promo }) {
  const { order } = useOrder();
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
            order.transact(o => ({
              ...o,
              promo: null,
            }));
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
      </View>
      <Button
        title="checkout"
        style={{
          flex: 1,
          marginHorizontal: 10,
          marginVertical: 12,
          maxWidth: 488,
          margin: 20,
        }}
        buttonStyle={{ height: buttonHeight }}
        titleStyle={{ fontSize: 24 }}
        onPress={() => {
          navigate('CollectName');
        }}
      />
    </ScrollView>
  );
}
