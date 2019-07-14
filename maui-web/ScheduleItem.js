import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../dashboard/Theme';
import Text from '../dashboard/Text';

function ScheduleItem({ item, style, ...rest }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.white,
          borderRadius: 8,
          borderWidth: 3,
          borderColor: item.active ? theme.colors.monsterra : 'transparent',
          padding: 20,
          ...theme.shadows.medium,
        },
        style,
      ]}
      {...rest}
    >
      <Text
        bold
        style={{
          fontFamily: theme.fonts.bold,
          textTransform: 'uppercase',
        }}
      >
        {item.time}
      </Text>
      <Text style={{ marginBottom: 0, fontSize: 16, lineHeight: 24 }}>
        {item.address}
      </Text>
    </View>
  );
}

export default ScheduleItem;
