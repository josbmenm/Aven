import React from 'react';
import { View } from 'react-native';
import { Button } from '@aven/dash';

export default function App() {
  React.useEffect(() => {
    console.log('app did mount');
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: 'blue' }}>
      <Button />
    </View>
  );
}
