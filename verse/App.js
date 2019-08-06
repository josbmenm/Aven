import React, { useEffect } from 'react';
import { useCloud } from '../cloud-core/KiteReact';
import Admin from '../admin/Admin';
import StatusDisplay from '../shoneys/StatusDisplay';
import { createSwitchNavigator } from '../navigation-core';
import { HostContextContainer } from '../components/AirtableImage';

let HOST_CONFIG = {};
if (global.window) {
  HOST_CONFIG = {
    useSSL: window.location.protocol !== 'http:',
    authority: window.location.host,
  };
}

function AdminScreen({ navigation }) {
  return (
    <Admin
      navigation={navigation}
      defaultSession={{
        ...HOST_CONFIG,
        domain: 'onofood.co',
      }}
    />
  );
}

AdminScreen.router = Admin.router;

const fontsCSS = `
@font-face {
  src: url('/fonts/Maax-Bold.ttf');
  font-family: Maax-Bold;
}
@font-face {
  src: url('/fonts/Maax.ttf');
  font-family: Maax;
}
@font-face {
  src: url('/fonts/Lora.ttf');
  font-family: Lora;
}
`;

const App = createSwitchNavigator(
  {
    Admin: {
      screen: AdminScreen,
      navigationOptions: { title: 'Maui Status' },
    },
    StatusDisplay,
  },
  {
    defaultNavigationOptions: {
      customCSS: fontsCSS,
    },
  },
);

function FullApp(props) {
  const cloud = useCloud();
  useEffect(() => {
    let hasConnectedOnce = cloud.connected.get();
    let wasConnected = hasConnectedOnce;
    const listener = {
      next: isConnected => {
        if (isConnected && hasConnectedOnce && !wasConnected) {
          window.location.reload();
        }
        if (isConnected) {
          hasConnectedOnce = true;
        }
        wasConnected = isConnected;
      },
    };
    cloud.connected.stream.addListener(listener);
    return () => cloud.connected.stream.removeListener(listener);
  }, [cloud]);
  return (
    <HostContextContainer {...HOST_CONFIG}>
      <App {...props} />
    </HostContextContainer>
  );
}

FullApp.router = App.router;
FullApp.navigationOptions = App.navigationOptions;

export default FullApp;
