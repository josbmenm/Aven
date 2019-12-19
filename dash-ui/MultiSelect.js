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
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {options.map((opt, idx) => {
        const isActive = value === opt.value;
        const isLast = idx === options.length - 1;
        const isFirst = idx === 0;
        return (
          <TouchableOpacity
            key={opt.name}
            onPress={() => {
              onValue(opt.value);
            }}
          >
            <View
              style={{
                backgroundColor: isActive ? color : null,
                alignSelf: 'stretch',
                paddingVertical: theme.paddingVertical,
                paddingHorizontal: theme.paddingHorizontal,
                borderTopLeftRadius: isFirst ? theme.borderRadius : 0,
                borderBottomLeftRadius: isFirst ? theme.borderRadius : 0,
                borderTopRightRadius: isLast ? theme.borderRadius : 0,
                borderBottomRightRadius: isLast ? theme.borderRadius : 0,
                borderTopWidth: 2,
                borderColor: color,
                borderBottomWidth: 2,
                borderLeftWidth: isFirst ? 2 : 0,
                borderRightWidth: isLast ? 2 : 0,
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
            </View>
            {!isLast && !isActive && options[idx + 1].value !== value && (
              <View
                style={{
                  width: 1,
                  backgroundColor: opacify(theme.colorTint, 0.2),
                  height: '100%',
                  position: 'absolute',
                  right: 0,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
