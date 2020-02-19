import React from 'react';
import { Text, TouchableOpacity } from '@rn';
import { Image } from '@aven/views';

export default function Button({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{}}>
      <Image
        style={{ width: 108, height: 108, tintColor: 'blue' }}
        source={require('./Spinner.png')}
      />
      <Text style={{}}>{title}</Text>
    </TouchableOpacity>
  );
}
