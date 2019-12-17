import React from 'react';
import { View } from 'react-native';
import { Spacing, useTheme } from '../Theme';

export default function Stack({
  children,
  horizontal = false,
  inline = false,
  theme: themeProp,
}) {
  const theme = useTheme(themeProp);
  return (
    <View
      style={{
        flexDirection: horizontal ? 'row' : 'column',
      }}
    >
      {/* TODO: WTF is happening here? if I render twice the `item` it renders properly but this does not :( */}
      {React.Children.map(children, item => {
        return (
          <Spacing
            horizontal={horizontal ? theme.spacing : null}
            vertical={horizontal ? null : theme.spacing}
            flex={!inline}
          >
            {item}
          </Spacing>
        );
      })}
    </View>
  );
}
