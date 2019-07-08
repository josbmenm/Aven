import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../dashboard/Theme';
import BodyText from '../dashboard/BodyText';
import SmallText from '../dashboard/SmallText';

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
      <SmallText
        bold
        style={{
          fontFamily: theme.fonts.bold,
          textTransform: 'uppercase',
        }}
      >
        {item.time}
      </SmallText>
      <BodyText style={{ marginBottom: 0, fontSize: 16, lineHeight: 24 }}>
        {item.address}
      </BodyText>
    </View>
  );
}

export default ScheduleItem;
