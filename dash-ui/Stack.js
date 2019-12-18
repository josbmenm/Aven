import React from 'react';
import { View } from 'react-native';
import { Spacing, useTheme } from './Theme';

// TODO: stack is consufsing with navigation, we need a better name (Box?, Set?, Group?)
export default function Stack({
  children,
  horizontal = false,
  inline = false,
  // TODO: what is the most common, inline or block?? what is the best name?
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
