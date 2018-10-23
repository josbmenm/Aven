import Title from './Title';
import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { heroViewStyle, heroIconStyle } from './Styles';

export default class Hero extends Component {
  render() {
    const { icon, title } = this.props;
    return (
      <View style={heroViewStyle}>
        {icon && <Text style={heroIconStyle}>{icon}</Text>}

        <Title>{title}</Title>
      </View>
    );
  }
}
