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
  const idxValue = options.findIndex(item => item.value === value);

  return (
    <View
      style={{
        flexDirection: 'row',
        borderRadius: 3,
        borderWidth: 2,
        flexWrap: 'wrap',
        borderColor: theme.colorPrimary,
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
                backgroundColor: isActive ? theme.colorPrimary : null,
                alignSelf: 'stretch',
                paddingVertical: theme.paddingVertical,
                paddingHorizontal: theme.paddingHorizontal,
              }}
            >
              <Text
                style={{
                  fontFamily: theme.fontBold,
                  color: isActive ? 'white' : theme.colorPrimary,
                  textAlign: 'center',
                  fontSize: 16,
                }}
              >
                {opt.name}
              </Text>
            </TouchableOpacity>
            {!isLast && !isActive && options[idx + 1].value !== value && (
              <View
                style={{
                  width: 1,
                  opacity: 0.5,
                  backgroundColor: theme.colorPrimary,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
