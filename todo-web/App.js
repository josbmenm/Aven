import React from 'react';
import { Text, View } from 'react-native';
import useCloud from '../aven-cloud/useCloud';
import Admin from '../aven-admin/Admin';
import createSwitchNavigator from '../navigation-core/navigators/createSwitchNavigator';
import useObservable from '../aven-cloud/useObservable';

function Home() {
  const cloud = useCloud();
  return (
    <View style={{ flex: 1 }}>
      <Text onPress={() => {}}>Hello</Text>
    </View>
  );
}

const App = createSwitchNavigator({
  Home,
  Admin,
});

export default App;
