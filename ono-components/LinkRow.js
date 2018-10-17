import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import {
  linkRowStyle,
  linkRowIconTextStyle,
  linkRowTitleTextStyle,
} from './Styles';

const LinkRow = ({ onPress, title, icon }) => {
  return (
    <TouchableHighlight onPress={onPress}>
      <View style={{ ...linkRowStyle, flexDirection: 'row' }}>
        <Text style={linkRowIconTextStyle}>{icon}</Text>
        <Text style={linkRowTitleTextStyle}>{title}</Text>
      </View>
    </TouchableHighlight>
  );
};

export default LinkRow;
