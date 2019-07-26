import React from 'react';
import { View } from 'react-native';
import Button from './Button';

export default function MultiSelect({ options, value, onValue }) {
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
      {options.map(opt => {
        return (
          <Button
            type={value === opt.value ? 'solid' : 'outline'}
            title={opt.name}
            onPress={() => {
              onValue(opt.value);
            }}
          />
        );
      })}
    </View>
  );
}
