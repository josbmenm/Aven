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
  monsterra,
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

function CardHeader({ title, price, style, benefits }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        alignItems: 'flex-end',
        alignSelf: 'stretch',
        paddingTop: 20,
        paddingHorizontal: 20,
        ...style,
      }}
    >
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
      {benefits && (
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {benefits.map(b => (
            <View
              key={b.id}
              style={{
                borderRadius: 14,
                height: 28,
                width: 28,
                borderWidth: 1,
                marginLeft: 6,
                borderColor: monsterra,
              }}
            >
              <AirtableImage
                image={b.Icon}
                style={{
                  height: 30,
                  width: 30,
                  left: -1,
                  top: -1,
                }}
                tintColor={monsterra}
              />
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

function CardPhoto({ photo, style, isZoomed }) {
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
          width: isZoomed ? 400 : cardLargeWidth,
          height: cardLargeWidth * cardHeightRatio,
          position: 'absolute',
          right: isZoomed ? 30 : 0,
          top: isZoomed ? 30 : 0,
        }}
      />
    </Animated.View>
  );
}

export function MenuCard({
  photo,
  title,
  price,
  tag,
  benefits,
  onPress,
  isPhotoZoomed,
  style,
}) {
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
          isZoomed={isPhotoZoomed}
          style={{
            position: 'absolute',
            width: cardLargeWidth,
            height: cardLargeWidth * cardHeightRatio,
          }}
        />
      )}
      <CardHeader title={title} price={price} tag={tag} benefits={benefits} />
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
        height: 700,
      }}
      contentInset={{ left: 0 }}
      contentContainerStyle={{
        paddingRight: scrollWidth - cardSmallWidth - carouselPaddingSmall, // makes sure we can scroll to the last item and not past
        paddingVertical: largeShadowRadius,
        justifyContent: 'center',
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
            <MenuCard {...item} style={{}} isPhotoZoomed={large} />
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );
}
