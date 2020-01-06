import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import Text from '../dash-ui/Text';
import { useNavigation } from '../navigation-hooks/Hooks';
import { Spacing, useTheme } from '../dash-ui/Theme';

export default function BackButton({ style, onLongPress, backBehavior }) {
  const { goBack } = useNavigation();
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={{
        width: 88,
        height: 40,
        position: 'absolute',
        top: 26,
        left: 32,
        flexDirection: 'row',
        ...style,
      }}
      hitSlop={{
        top: 60,
        right: 100,
        bottom: 60,
        left: 100,
      }}
      onPress={backBehavior || goBack}
      onLongPress={onLongPress}
    >
      <Image
        style={{ width: 12, height: 20, tintColor: theme.colorPrimary }}
        source={require('./assets/BackChevron.png')}
      />
      <Spacing left={16}>
        <Text
          theme={{
            fontSize: 22,
            fontWeight: 'bold',
            lineHeight: 22,
            colorForeground: theme.colorPrimary,
          }}
        >
          back
        </Text>
      </Spacing>
    </TouchableOpacity>
  );
}
