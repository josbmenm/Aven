import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from './Theme';
import { opacify } from './utils';

export default function MultiSelect({
  options,
  value,
  onValue,
  theme: themeProp,
}) {
  const theme = useTheme(themeProp);
  const color = opacify(theme.colorPrimary, 0.8);
  return (
    <View
      style={{
        flexDirection: 'row',
        borderRadius: theme.borderRadius,
        borderWidth: 2,
        // flexWrap: 'wrap',
        borderColor: color,
      }}
    >
      {options.map((opt, idx) => {
        const isActive = value === opt.value;
        const isLast = idx === options.length - 1;
        return (
          <React.Fragment>
            <TouchableOpacity
              key={opt.name}
              onPress={() => {
                onValue(opt.value);
              }}
              style={{
                backgroundColor: isActive ? color : null,
                alignSelf: 'stretch',
                paddingVertical: theme.paddingVertical,
                paddingHorizontal: theme.paddingHorizontal,
              }}
            >
              <Text
                style={{
                  fontFamily: theme.fontBold,
                  color: isActive ? 'white' : color,
                  textAlign: 'center',
                  fontSize: theme.buttonFontSize,
                }}
              >
                {opt.name}
              </Text>
            </TouchableOpacity>
            {!isLast && !isActive && options[idx + 1].value !== value && (
              <View
                style={{
                  width: 1,
                  backgroundColor: opacify(theme.colorPrimary, 0.2),
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
