import React from 'react';
import { Text, View } from 'react-native';
import { heroViewStyle, heroIconStyle, heroSubtitleStyle } from './Styles';
import SharedIcon from './SharedIcon';
import Heading from '../dash-ui/Heading';

export default function Hero({ icon, title, subtitle }) {
  return (
    <View style={heroViewStyle}>
      <SharedIcon icon={icon} style={heroIconStyle} />
      <View style={{ paddingLeft: 25 }}>
        <Heading title={title} />
      </View>
      {subtitle && (
        <Heading
          title={subtitle}
          theme={{ headingFontSize: 48, headingLineHeight: 56 }}
        />
      )}
    </View>
  );
}
