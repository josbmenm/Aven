import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { titleStyle, monsterra80, monsterra } from './Styles';

export default function MultiSelect({ options, value, onValue }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: monsterra80,
      }}
    >
      {options.map(opt => {
        const isActive = value === opt.value;
        return (
          <TouchableOpacity
            onPress={() => {
              onValue(opt.value);
            }}
            style={{
              backgroundColor: isActive ? monsterra80 : null,
              flex: 1,
              alignSelf: 'stretch',
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                ...titleStyle,
                color: isActive ? 'white' : monsterra,
                textAlign: 'center',
                fontSize: 18,
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
