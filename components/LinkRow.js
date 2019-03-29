import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import {
  linkRowStyle,
  linkRowIconTextStyle,
  linkRowTitleTextStyle,
} from './Styles';
import SharedIcon from './SharedIcon';

const LinkRow = ({ onPress, title, icon, children, rightIcon }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ ...linkRowStyle, flexDirection: 'row' }}>
        <SharedIcon style={linkRowIconTextStyle} icon={icon} />
        <Text style={linkRowTitleTextStyle}>{title}</Text>
        {children}
        {rightIcon ? <Text style={{ fontSize: 42 }}>{rightIcon}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

export default LinkRow;
