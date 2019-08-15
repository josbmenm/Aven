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
        flexWrap: 'wrap',
        borderColor: monsterra80,
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
              backgroundColor: isActive ? monsterra80 : null,
              // alignSelf: 'stretch',
              padding: 10,
              height: '100%',
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
