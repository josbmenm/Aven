import React from 'react';
import { View, Text } from 'react-native';

import {
  titleStyle,
  menuZonePaddingBottom,
  largeHorizontalPadding,
  midPageHorizPadding,
  rightSidebarWidth,
  cardLargeWidth,
} from './Styles';

const titleLargeStyle = {
  fontSize: 52,
  ...titleStyle,
  marginLeft: largeHorizontalPadding,
  lineHeight: 49,
};
const titleSmallStyle = {
  fontSize: 42,
  ...titleStyle,
  lineHeight: 40,
  marginLeft: largeHorizontalPadding,
};

function TitleLarge({ title }) {
  return <Text style={titleLargeStyle}>{title}</Text>;
}

function TitleSmall({ title }) {
  return <Text style={titleSmallStyle}>{title}</Text>;
}

export function MenuHLayout({ side, children }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        paddingLeft: largeHorizontalPadding,
        marginRight: rightSidebarWidth,
      }}
    >
      <View
        style={{
          marginRight: midPageHorizPadding,
          width: cardLargeWidth,
        }}
      >
        {side}
      </View>
      <View
        style={{
          flex: 1,
          minWidth: 100,
          alignSelf: 'stretch',
        }}
      >
        {children}
      </View>
    </View>
  );
}

export function MenuZone({ title, children, small }) {
  const TitleComponent = small ? TitleSmall : TitleLarge;
  return (
    <View
      style={{
        flex: 1,
        paddingTop: 160,
      }}
    >
      {title && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 73,
          }}
        >
          <TitleComponent title={title} />
        </View>
      )}
      {children}
      <View
        style={{
          height: 1,
          alignSelf: 'stretch',
          marginHorizontal: largeHorizontalPadding,
          backgroundColor: '#00000014',
        }}
      />
    </View>
  );
}
