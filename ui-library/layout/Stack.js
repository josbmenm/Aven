import React from 'react';
import View from '../../views/View';
import { Spacing, useTheme } from '../Theme';

export default function Stack({
  children,
  horizontal = false,
  flex = true,
  theme: themeProp,
}) {
  const theme = useTheme(themeProp);

  return (
    <View style={{ flexDirection: horizontal ? 'row' : 'column' }}>
      {React.Children.map(children, item => (
        <Spacing
          horizontal={horizontal ? theme.spacing : null}
          vertical={horizontal ? null : theme.spacing}
          flex={flex}
        >
          {item}
        </Spacing>
      ))}
    </View>
  );
}
