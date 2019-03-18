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

function AdminScreen(props) {
  return (
    <Admin
      {...props}
      defaultSession={{
        authority: 'localhost:3000',
        useSSL: false,
        domain: 'todo.aven.cloud',
      }}
    />
  );
}
AdminScreen.navigationOptions = Admin.navigationOptions;
AdminScreen.router = Admin.router;

const App = createSwitchNavigator({
  Home,
  Admin: AdminScreen,
});

export default App;
