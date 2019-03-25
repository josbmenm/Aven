import { View, Text } from 'react-native';
import React, { useState } from 'react';

import createAppContainer from '../navigation-native/createAppContainer';
import createSwitchNavigator from '../navigation-core/navigators/createSwitchNavigator';
import NetworkCloudProvider from '../cloud-native/createNativeNetworkSource';
import useCloud from '../cloud-core/useCloud';
import useCloudValue from '../cloud-core/useCloudValue';
import useObservable from '../cloud-core/useObservable';

function ConnectedMessage() {
  const cloud = useCloud();
  const isConnected = useObservable(cloud.isConnected);
  return <Text>{isConnected ? 'Connected' : 'Not Connected'}</Text>;
}

function Thing() {
  const cloud = useCloud();
  const foo = useCloudValue(cloud.get('foo'));
  return <Text>{JSON.stringify(foo)}</Text>;
}

const Home = () => {
  const [fo, setFo] = useState(null);
  return (
    <NetworkCloudProvider
      authority="localhost:3000"
      useSSL={false}
      domain="todo.aven.cloud"
    >
      <ConnectedMessage />
      <Thing />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          onPress={() => {
            alert('hello');
          }}
        >
          Test me!
        </Text>
      </View>
    </NetworkCloudProvider>
  );
};

const AppNavigator = createSwitchNavigator({ Home });

const App = createAppContainer(AppNavigator);

export default App;
