import React from 'react';
import { View } from 'react-native';
import { Responsive } from './Responsive';
import { useTheme } from '../dashboard/Theme';
import BodyText from './BodyText';

function ScheduleItem({ item, style, ...rest }) {
  const theme = useTheme();
  return (
    <View
      style={[{
        // flex: 1,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: item.active ? theme.colors.primary : 'transparent',
        padding: 20,
        ...theme.shadows.medium,
      }, style]}
      {...rest}
    >
      <BodyText
        bold
        style={{
          fontSize: 12,
          lineHeight: 16,
          fontFamily: theme.fontFamily.title,
          margin: 0,
        }}
      >
        {item.time}
      </BodyText>
      <BodyText style={{ marginBottom: 0 }}>{item.address}</BodyText>
    </View>
  );
}

export default ScheduleItem;
