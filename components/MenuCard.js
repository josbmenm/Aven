import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import {
  menuItemNameText,
  menuItemDescriptionText,
  boldPrimaryFontFace,
  primaryFontFace,
  highlightPrimaryColor,
  mutedPrimaryColor,
  prettyShadow,
  prettyExtraShadow,
  largeHorizontalPadding,
  prettyShadowRespectedRadius,
  titleStyle,
  cardLargeWidth,
  monsterra70,
} from './Styles';
import AirtableImage from './AirtableImage';
import { formatCurrency } from './Utils';
import Animated from 'react-native-reanimated';

const { interpolate, multiply, add } = Animated;

const cardSmallWidth = 240;
const cardHeightRatio = 25 / 17;
const cardHeaderMargin = 100;
const carouselPaddingLarge = largeHorizontalPadding;
const carouselPaddingSmall = 32;

const cardsScrollWidth = cardSmallWidth + carouselPaddingSmall;
const cardBorderRadius = 8;
const cardShadowRadius = prettyShadowRespectedRadius;

function CardContainer({ children, style, onPress }) {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress && onPress();
      }}
    >
      <Animated.View
        style={[
          {
            ...prettyShadow,
            backgroundColor: 'white',
            borderRadius: cardBorderRadius,
            width: cardLargeWidth,
            height: cardLargeWidth * cardHeightRatio,
            position: 'relative',
            justifyContent: 'space-between',
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

function Tag({ label }) {
  return (
    <View
      style={{
        backgroundColor: monsterra70,
        padding: 2,
        borderRadius: 4,
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          ...boldPrimaryFontFace,
          color: 'white',
          fontSize: 11,
        }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function CardHeader({ title, price, tag, style }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        alignItems: 'flex-end',
        maxWidth: cardSmallWidth,
        alignSelf: 'flex-end',
        paddingTop: 20,
        paddingHorizontal: 20,
        ...style,
      }}
    >
      {tag && <Tag label={tag} />}
      {title && (
        <Text
          style={{
            alignSelf: 'stretch',
            fontSize: 24,
            paddingTop: 8,
            color: highlightPrimaryColor,
            textAlign: 'right',
            lineHeight: 22,
            ...boldPrimaryFontFace,
          }}
        >
          {title}
        </Text>
      )}
      {price && (
        <Text
          style={{
            fontSize: 16,
            ...boldPrimaryFontFace,
            color: mutedPrimaryColor,
          }}
        >
          {formatCurrency(price)}
        </Text>
      )}
    </Animated.View>
  );
}

function CardPhoto({ photo, style }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        ...style,
        borderRadius: cardBorderRadius,
        overflow: 'hidden',
      }}
    >
      <AirtableImage
        image={photo}
        resizeMode={'cover'}
        style={{
          width: cardLargeWidth * 2,
          height: cardLargeWidth * cardHeightRatio,
          position: 'absolute',
          right: -120,
          top: 0,
        }}
      />
    </Animated.View>
  );
}

export function MenuCard({ photo, title, price, tag, onPress, style }) {
  return (
    <CardContainer
      onPress={onPress}
      style={{
        width: cardLargeWidth,
        height: cardLargeWidth * cardHeightRatio,
        ...style,
      }}
    >
      {photo && (
        <CardPhoto
          photo={photo}
          style={{
            position: 'absolute',
            width: cardLargeWidth,
            height: cardLargeWidth * cardHeightRatio,
          }}
        />
      )}
      <CardHeader title={title} price={price} tag={tag} />
    </CardContainer>
  );
}

export function MenuCardCarousel({ items, large, style }) {
  let [scrollPosition] = useState(new Animated.Value(0));
  let [scrollWidth, setScrollWidth] = useState(1366);

  const carouselPaddingMaybeLarge = large
    ? carouselPaddingLarge
    : carouselPaddingSmall;
  const cardMaybeLargeWidth = large ? cardLargeWidth : cardSmallWidth;

  const largeShadowRadius = cardShadowRadius * 2; // used to keep the shadow visible under other views

  return (
    <Animated.ScrollView
      onLayout={e => {
        const width = e.nativeEvent.layout.width;
        scrollWidth !== width && setScrollWidth(width);
      }}
      pagingEnabled={true}
      snapToInterval={cardsScrollWidth}
      horizontal
      style={{
        flex: 1,
        position: 'relative',
        marginTop: -largeShadowRadius,
        ...style,
      }}
      contentInset={{ left: 0 }}
      contentContainerStyle={{
        paddingRight: scrollWidth - cardSmallWidth - carouselPaddingSmall, // makes sure we can scroll to the last item and not past
        paddingVertical: largeShadowRadius,
      }}
      scrollEventThrottle={1}
      onScroll={Animated.event(
        [
          {
            nativeEvent: { contentOffset: { x: scrollPosition } },
          },
        ],
        {
          useNativeDriver: true,
        },
      )}
      showsHorizontalScrollIndicator={false}
    >
      {items.map((item, index) => {
        const beforeIndex = index - 1;
        const afterIndex = index + 1;
        const inputRange = [
          cardsScrollWidth * beforeIndex, // small card
          cardsScrollWidth * index, // large card
          cardsScrollWidth * afterIndex, // offscreen left
        ];
        const cardTranslateX = interpolate(scrollPosition, {
          inputRange,
          outputRange: [
            cardMaybeLargeWidth - cardSmallWidth + carouselPaddingMaybeLarge,
            carouselPaddingMaybeLarge,
            -30, // for shadow
          ],
          extrapolate: 'clamp',
        });
        const cardScale = interpolate(scrollPosition, {
          inputRange,
          outputRange: [
            cardSmallWidth / cardLargeWidth,
            large ? 1 : cardSmallWidth / cardLargeWidth,
            cardSmallWidth / cardLargeWidth,
          ],
          extrapolate: 'clamp',
        });
        const smallCardTopMargin =
          ((cardMaybeLargeWidth - cardSmallWidth) * cardHeightRatio) / 2;

        return (
          <Animated.View
            key={item.key}
            pointerEvents="box-none"
            style={{
              width: cardSmallWidth,
              height:
                cardSmallWidth * cardHeightRatio +
                2 * prettyShadowRespectedRadius,
              paddingVertical: prettyShadowRespectedRadius,
              marginVertical: smallCardTopMargin,
              marginRight: carouselPaddingSmall,
              transform: [
                {
                  translateX: cardTranslateX,
                },
                {
                  scale: cardScale,
                },
              ],
            }}
          >
            <MenuCard {...item} style={{}} />
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );
}
