import React, { Component } from 'react';
import { Text } from 'react-native';
import { titleStyle } from './Styles';

export default class TitleView extends Component {
  render() {
    const { children } = this.props;
    return (
      <Text
        style={{
          ...titleStyle,
          fontSize: 48,
        }}
      >
        {children}
      </Text>
    );
  }
}
