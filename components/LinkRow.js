import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { rowStyle, primaryFontFace, monsterra80 } from './Styles';
import SharedIcon from './SharedIcon';

const LinkRow = ({
  onPress,
  onLongPress,
  title,
  icon,
  children,
  rightIcon,
}) => {
  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <View style={{ ...rowStyle, flexDirection: 'row', padding: 16 }}>
        <SharedIcon
          style={{
            fontSize: 26,
          }}
          icon={icon}
        />
        <Text
          style={{
            ...primaryFontFace,
            flex: 1,
            color: monsterra80,
            paddingLeft: 16,
            fontSize: 26,
          }}
        >
          {title}
        </Text>
        {children}
        {rightIcon ? <Text style={{ fontSize: 26 }}>{rightIcon}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

export default LinkRow;
