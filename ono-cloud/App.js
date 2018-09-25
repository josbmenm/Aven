import { View, Text } from 'react-native';
import React from 'react';

const App = ({ env }) => {
  return (
    <View style={{ flex: 1 }}>
      <Text
        onPress={() => {
          console.log('DUUDE');
          alert('hello');
        }}
      >
        Ono API Server {env}
      </Text>
    </View>
  );
};

export default App;
