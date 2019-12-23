import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { rowStyle, primaryFontFace, monsterra80 } from './Styles';
import SharedIcon from './SharedIcon';
import { Spacing, Text } from '../dash-ui';

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
      <View
        style={{
          ...rowStyle,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <Spacing right={16}>
          <SharedIcon theme={{ fontSize: 32, lineHeight: 40 }} icon={icon} />
        </Spacing>

        <Text theme={{ fontSize: 24, lineHeight: 40 }}>{title}</Text>

        {children}
        {rightIcon ? <Text style={{ fontSize: 26 }}>{rightIcon}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

export default LinkRow;
