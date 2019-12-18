import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from './Theme';

export default function MultiSelect({
  options,
  value,
  onValue,
  theme: themeProp,
}) {
  const theme = useTheme(themeProp);
  return (
    <View
      style={{
        flexDirection: 'row',
        borderRadius: 4,
        borderWidth: 2,
        flexWrap: 'wrap',
        borderColor: theme.colorHighlight,
      }}
    >
      {options.map(opt => {
        const isActive = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.name}
            onPress={() => {
              onValue(opt.value);
            }}
            style={{
              backgroundColor: isActive ? theme.colorHighlight : null,
              alignSelf: 'stretch',
              padding: theme.spacing,
              paddingHorizontal: theme.paddingHorizontal,
              height: '100%',
            }}
          >
            <Text
              style={{
                fontFamily: theme.fontBold,

                color: isActive ? 'white' : theme.colorHighlight,
                textAlign: 'center',
                fontSize: theme.buttonFontSize,
              }}
            >
              {opt.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
