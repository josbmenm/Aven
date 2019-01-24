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
} from '../../components/Styles';
import AirtableImage from '../components/AirtableImage';
import { formatCurrency } from '../../components/Utils';
import Animated from 'react-native-reanimated';

const { interpolate, multiply, add } = Animated;

const cardSmallWidth = 240;
const cardHeightRatio = 25 / 17;
const cardHeaderMargin = 100;
const carouselPaddingLarge = largeHorizontalPadding;
const carouselPaddingSmall = 32;

const cardsScrollWidth = cardSmallWidth + carouselPaddingSmall;
const cardBorderRadius = 6;
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
            flex: 1,
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
        alignSelf: 'stretch',
        resizeMode: 'contain',
        alignItems: 'stretch',
        borderRadius: cardBorderRadius,
      }}
    >
      <AirtableImage
        image={photo}
        style={{
          flex: 1,
        }}
      />
    </Animated.View>
  );
}

export function MenuCard({ photo, title, price, tag, onPress }) {
  return (
    <CardContainer
      onPress={onPress}
      style={{
        width: cardLargeWidth,
        height: cardLargeWidth * cardHeightRatio,
      }}
    >
      <CardHeader title={title} price={price} tag={tag} />
      {photo && (
        <CardPhoto
          photo={photo}
          style={{
            width: cardLargeWidth,
            height: cardLargeWidth * cardHeightRatio - cardHeaderMargin,
          }}
        />
      )}
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
        const growthOffset = (cardMaybeLargeWidth - cardSmallWidth) / 2;
        const cardTranslateX = interpolate(scrollPosition, {
          inputRange,
          outputRange: [
            growthOffset +
              carouselPaddingLarge +
              (growthOffset + carouselPaddingMaybeLarge) -
              carouselPaddingSmall,
            growthOffset + carouselPaddingLarge,
            carouselPaddingSmall,
          ],
          extrapolate: 'clamp',
        });
        const cardScale = interpolate(scrollPosition, {
          inputRange,
          outputRange: [1, cardMaybeLargeWidth / cardSmallWidth, 1],
          extrapolate: 'clamp',
        });
        const headerTranslateX = interpolate(scrollPosition, {
          inputRange,
          outputRange: [
            growthOffset +
              carouselPaddingLarge +
              (growthOffset + carouselPaddingMaybeLarge) -
              carouselPaddingSmall,
            growthOffset * 2 + carouselPaddingLarge,
            carouselPaddingSmall,
          ],
          extrapolate: 'clamp',
        });
        const smallCardTopMargin =
          ((cardMaybeLargeWidth - cardSmallWidth) * cardHeightRatio) / 2;
        const headerTranslateY = interpolate(scrollPosition, {
          inputRange,
          outputRange: [0, -smallCardTopMargin, 0],
          extrapolate: 'clamp',
        });

        const photoTranslateX = interpolate(scrollPosition, {
          inputRange,
          outputRange: [
            growthOffset +
              carouselPaddingLarge +
              carouselPaddingMaybeLarge -
              carouselPaddingSmall,
            carouselPaddingLarge,

            carouselPaddingSmall - growthOffset,
          ],
          extrapolate: 'clamp',
        });
        const photoTranslateY = interpolate(scrollPosition, {
          inputRange,
          outputRange: [0, 0, 0],
          extrapolate: 'clamp',
        });
        const photoScale = interpolate(scrollPosition, {
          inputRange,
          outputRange: [
            cardSmallWidth / cardMaybeLargeWidth,
            1,
            cardSmallWidth / cardMaybeLargeWidth,
          ],
          extrapolate: 'clamp',
        });

        return (
          <View
            key={item.key}
            pointerEvents="box-none"
            style={{
              width: cardSmallWidth,
              height: cardSmallWidth * cardHeightRatio,
              marginVertical: smallCardTopMargin,
              marginRight: carouselPaddingSmall,
            }}
          >
            <CardContainer
              onPress={item.onPress}
              style={{
                width: cardSmallWidth,
                height: cardSmallWidth * cardHeightRatio,

                transform: [
                  {
                    translateX: cardTranslateX,
                  },
                  {
                    scale: cardScale,
                  },
                ],
              }}
            />

            {item.photo && (
              <CardPhoto
                photo={item.photo}
                style={{
                  position: 'absolute',
                  bottom: -smallCardTopMargin,
                  left: 0,
                  width: cardMaybeLargeWidth,
                  height:
                    cardMaybeLargeWidth * cardHeightRatio - cardHeaderMargin,
                  transform: [
                    {
                      translateX: photoTranslateX,
                      translateY: photoTranslateY,
                    },
                    { scale: photoScale },
                  ],
                }}
              />
            )}
            <CardHeader
              {...item}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                transform: [
                  {
                    translateX: headerTranslateX,
                    translateY: headerTranslateY,
                  },
                ],
              }}
            />
          </View>
        );
      })}
    </Animated.ScrollView>
  );
}
