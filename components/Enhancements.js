import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import AirtableImage from './AirtableImage';
import { sortByField } from '../ono-cloud/OnoKitchen';
import { PopoverTarget, useTargetPopover } from '../views/Popover';
import Interleave from '../views/Interleave';
import {
  prettyShadowSmall,
  titleStyle,
  proseFontFace,
  monsterra,
  monsterra40,
  prettyShadow,
  boldPrimaryFontFace,
  monsterraBlack,
  primaryFontFace,
} from './Styles';
import Animated, { Easing } from 'react-native-reanimated';
import { formatCurrency } from './Utils';

export function EnhancementDetail({ enhancement, price, chevronRef }) {
  if (!enhancement || !enhancement.Name) {
    return null;
  }
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        padding: 12,
      }}
    >
      <AirtableImage
        image={enhancement.Icon}
        style={{
          width: 50,
          height: 50,
          left: 16,
          top: 16,
          resizeMode: 'contain',
          position: 'absolute',
        }}
        tintColor={monsterra}
      />
      <View style={{ flex: 1, marginLeft: 70, paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ ...titleStyle, fontSize: 12 }}>
            {enhancement.Name.toUpperCase()}
          </Text>
          {chevronRef && (
            <Image
              ref={chevronRef}
              style={{
                width: 7,
                height: 11,
                tintColor: monsterra40,
                marginTop: 2,
                marginLeft: 8,
              }}
              source={require('./assets/RightChevronSmall.png')}
            />
          )}
          {!!price && (
            <Text
              style={{
                color: monsterraBlack,
                ...primaryFontFace,
                fontSize: 12,
                marginLeft: 6,
              }}
            >
              {formatCurrency(price)}
            </Text>
          )}
        </View>
        <Text style={{ ...proseFontFace, fontSize: 13, color: monsterra }}>
          {enhancement.Description}
        </Text>
      </View>
    </View>
  );
}

function EnhancementSelectorRow({ enhancement, onSelect, onClose }) {
  return (
    <TouchableOpacity
      key={enhancement.id}
      style={{ alignSelf: 'stretch' }}
      onPress={() => {
        onSelect(enhancement.id);
        onClose();
      }}
    >
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <AirtableImage
          image={enhancement.Icon}
          style={{ width: 24, height: 24, margin: 3, marginRight: 20 }}
          tintColor={monsterra}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 13,
              color: monsterra,
              ...boldPrimaryFontFace,
            }}
          >
            {enhancement.Name.toUpperCase()}
          </Text>
          <Text style={{ fontSize: 13, color: monsterra, ...proseFontFace }}>
            {enhancement.Description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function EnhancementSelector({
  activeEnhancement,
  enhancementCustomization,
  onSelect,
}) {
  const selectorHeight = 400;
  const enhancements = sortByField(enhancementCustomization, '_index');

  const { onPopover, targetRef } = useTargetPopover(
    ({ location, onClose, popoverOpenValue }) => {
      const chevronRightMiddle = {
        left: location.pageX + location.width,
        top: location.pageY + location.height / 2,
      };
      return (
        <Animated.View
          style={{
            position: 'absolute',
            left: chevronRightMiddle.left + 20,
            top: chevronRightMiddle.top - selectorHeight / 2,
            backgroundColor: 'white',
            transform: [
              {
                translateX: Animated.interpolate(popoverOpenValue, {
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
            ...prettyShadow,
            height: selectorHeight,
            width: 320,
            borderRadius: 8,
            opacity: popoverOpenValue,
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              opacity: Animated.interpolate(popoverOpenValue, {
                inputRange: [0.7, 1],
                outputRange: [0, 1],
              }),
            }}
          >
            <Image
              source={require('./assets/PopoverBump.png')}
              style={{
                tintColor: 'white',
                width: 13,
                height: 37,
                position: 'absolute',
                left: -13,
                top: selectorHeight / 2 - 18,
              }}
            />
            <Interleave
              renderDivider={({ key }) => (
                <View
                  key={key}
                  style={{
                    height: 1,
                    alignSelf: 'stretch',
                    backgroundColor: '#0002',
                  }}
                />
              )}
              items={enhancements.map(enhancement => (
                <EnhancementSelectorRow
                  key={enhancement.id}
                  enhancement={enhancement}
                  onSelect={onSelect}
                  onClose={onClose}
                />
              ))}
            />
          </Animated.View>
        </Animated.View>
      );
    },
    { duration: 300, easing: Easing.quad },
  );
  if (!activeEnhancement) {
    return <Text>No enhancement</Text>;
  }
  return (
    <TouchableOpacity
      style={{ marginTop: 16, flexDirection: 'row' }}
      onPress={onPopover}
    >
      <EnhancementDetail
        enhancement={activeEnhancement}
        chevronRef={targetRef}
      />
    </TouchableOpacity>
  );
}
