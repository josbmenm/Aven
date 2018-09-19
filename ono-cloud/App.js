import { View, Text } from 'react-native';
import React from 'react';

const App = () => {
  return (
    <View style={{ flex: 1, backgroundColor: 'green' }}>
      <Text>Hello globe! My secret is {process.env.APP_CONFIG_JSON}</Text>
    </View>
  );
};

export default App;
