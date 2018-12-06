import { View, Text } from 'react-native';
import React from 'react';

import { createAppContainer } from '@react-navigation/native';
import createSwitchNavigator from '../navigation-core/navigators/createSwitchNavigator';

const Home = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text
        onPress={() => {
          alert('hello');
        }}
      >
        Test me!
      </Text>
    </View>
  );
};

const AppNavigator = createSwitchNavigator({ Home });

const App = createAppContainer(AppNavigator);

export default App;
