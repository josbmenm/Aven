import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../dashboard/Theme';
import BaseText from '../dashboard/BaseText';

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
      <BaseText
        bold
        size="medium"
        style={{
          fontFamily: theme.fonts.bold,
          textTransform: 'uppercase',
        }}
      >
        {item.time}
      </BaseText>
      <BaseText style={{ marginBottom: 0, fontSize: 16, lineHeight: 24 }}>
        {item.address}
      </BaseText>
    </View>
  );
}

export default ScheduleItem;
