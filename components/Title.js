import React, { Component } from 'react';
import { Text } from 'react-native';
import { titleFontStyle } from './Styles';

export default class TitleView extends Component {
  render() {
    const { children } = this.props;
    return (
      <Text
        style={{
          ...titleFontStyle,
        }}
      >
        {children}
      </Text>
    );
  }
}
