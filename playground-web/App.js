import React from 'react';
import { Text, View } from 'react-native';

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
