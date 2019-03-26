import React from 'react';
import { TextInput } from 'react-native';

export default function TodoTextInput({ ...props }) {
  return (
    <TextInput
      style={{
        fontSize: 32,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        margin: 20,
        color: '#222',
      }}
      placeholderTextColor="#345"
      {...props}
    />
  );
}
