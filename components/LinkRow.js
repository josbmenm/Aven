import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import {
  linkRowStyle,
  linkRowIconTextStyle,
  linkRowTitleTextStyle,
} from './Styles';
import SharedIcon from './SharedIcon';

const LinkRow = ({ onPress, title, icon, children }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ ...linkRowStyle, flexDirection: 'row' }}>
        <SharedIcon style={linkRowIconTextStyle} icon={icon} />
        <Text style={linkRowTitleTextStyle}>{title}</Text>
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default LinkRow;
