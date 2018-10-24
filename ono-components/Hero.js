import Title from './Title';
import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { heroViewStyle, heroIconStyle, heroSubtitleStyle } from './Styles';

export default class Hero extends Component {
  render() {
    const { icon, title, subtitle } = this.props;
    return (
      <View style={heroViewStyle}>
        {icon && <Text style={heroIconStyle}>{icon}</Text>}

        <Title>{title}</Title>
        {subtitle && <Text style={heroSubtitleStyle}>{subtitle}</Text>}
      </View>
    );
  }
}
