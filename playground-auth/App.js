import { View, Text } from 'react-native';
import React from 'react';

const App = ({ env }) => {
  return (
    <View style={{ flex: 1 }}>
      <Text
        onPress={() => {
          alert('Hello, client code!');
        }}
      >
        Aven Web. Env: {env}
      </Text>
    </View>
  );
};

export default App;
