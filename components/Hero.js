import Title from './Title';
import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { heroViewStyle, heroIconStyle, heroSubtitleStyle } from './Styles';
import SharedIcon from './SharedIcon';

export default class Hero extends Component {
  render() {
    const { icon, title, subtitle } = this.props;
    return (
      <View style={heroViewStyle}>
        <SharedIcon icon={icon} style={heroIconStyle} />
        <View style={{ paddingLeft: 25 }}>
          <Title>{title}</Title>
        </View>
        {subtitle && <Text style={heroSubtitleStyle}>{subtitle}</Text>}
      </View>
    );
  }
}
