import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../dashboard-ui-deprecated/Theme';
import BaseText from '../dashboard-ui-deprecated/BaseText';
import FunctionalLink from '../navigation-web/Link';

function ScheduleItem({ item, style, today, ...rest }) {
  const now = new Date();
  const start = new Date(item.start);
  start.setDate(now.getDate());
  start.setMonth(now.getMonth());
  start.setFullYear(now.getFullYear());
  const end = new Date(item.end);
  end.setDate(now.getDate());
  end.setMonth(now.getMonth());
  end.setFullYear(now.getFullYear());
  const active = today && start < now && end > now;
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.white,
          borderRadius: 8,
          borderWidth: 3,
          borderColor: active ? theme.colors.monsterra : 'transparent',
          padding: 20,
          ...theme.shadows.medium,
        },
        style,
      ]}
      {...rest}
    >
      <BaseText
        style={{
          fontSize: 20,
          lineHeight: 24,
          marginBottom: 12,
        }}
      >
        {item.name}
      </BaseText>
      <BaseText
        bold
        size="medium"
        style={{
          fontFamily: theme.fonts.bold,
          textTransform: 'uppercase',
        }}
      >
        {item.timeText}
      </BaseText>
      <FunctionalLink url={item.addressLink} target="_blank">
        <BaseText
          style={{
            marginBottom: 0,
            fontSize: 16,
            lineHeight: 24,
            textDecorationLine: 'underline',
          }}
        >
          {item.address}
        </BaseText>
      </FunctionalLink>
    </View>
  );
}

export default ScheduleItem;
