import React from 'react';
import { View, Text } from 'react-native-web';
import { Button } from '@aven/dash';
export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: 'blue' }}>
      <Text>Hello, world!</Text>
      <Button />
    </View>
  );
}
