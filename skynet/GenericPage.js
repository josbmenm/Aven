import { View, Text } from 'react-native';
import React from 'react';

export default function GenericPage({ children }) {
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          alignSelf: 'stretch',
          minHeight: 60,
          padding: 15,
          backgroundColor: '#f8f8f8',
        }}
      >
        <Text>Ono Blends</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <View
          style={{ maxWidth: 600, flex: 1, alignSelf: 'center', margin: 40 }}
        >
          {children}
        </View>
      </View>
      <View
        style={{
          alignSelf: 'stretch',
          minHeight: 80,
          padding: 15,
          backgroundColor: '#f8f8f8',
        }}
      />
    </View>
  );
}
