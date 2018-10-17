import { View, Text } from 'react-native';
import React from 'react';

const App = ({}) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text
        onPress={() => {
          alert('hello');
        }}
      >
        Test me
      </Text>
    </View>
  );
};

export default App;
