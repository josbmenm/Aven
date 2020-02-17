import React from 'react';
import { Text, TouchableOpacity } from '@rn';
import { Image } from '@aven/views';

console.log('heyooy', require('./Spinner.png'));

export default function Button({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: 'blue' }}>
      <Image
        style={{ width: 108, height: 108 }}
        source={require('./Spinner.png')}
      />
      <Text style={{ color: 'white' }}>lolwot {title}</Text>
    </TouchableOpacity>
  );
}
