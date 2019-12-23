import React from 'react';
import { View } from 'react-native';
import SharedIcon from './SharedIcon';
import { Stack, Heading, useTheme, Spacing } from '../dash-ui';

export default function Hero({ icon, title, subtitle, theme: themeProp }) {
  const theme = useTheme(themeProp);
  return (
    <Spacing horizontal={32} top={80} bottom={40}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Spacing right={16}>
          <SharedIcon
            icon={icon}
            theme={{
              fontSize: theme.headingFontSize,
              lineHeight: theme.headingLineHeight,
            }}
          />
        </Spacing>
        <Stack debug>
          <Heading title={title} />
          {subtitle && (
            <Heading
              title={subtitle}
              theme={{ headingFontSize: 32, headingLineHeight: 40 }}
            />
          )}
        </Stack>
      </View>
    </Spacing>
  );
}
