import React from 'react';
import { View, Text } from '@rn';
import { Button } from '@aven/plane';
import { createFullscreenSwitchNavigator } from '@aven/navigation-web';
// import { Button } from "../plane";

function Home() {
  React.useEffect(() => {
    console.log('app did mount');
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <Button title="ugh me" />
      <Text>Hello?</Text>
    </View>
  );
}

function Tasks() {
  React.useEffect(() => {
    console.log('app did mount');
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <Button title="tasks!" />
    </View>
  );
}

export default createFullscreenSwitchNavigator({
  Home: {
    path: '',
    screen: Home,
  },
  Tasks: {
    path: 'tasks',
    screen: Tasks,
  },
});
