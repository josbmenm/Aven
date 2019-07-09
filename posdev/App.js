import React from 'react';
import { StatusBar, YellowBox } from 'react-native';
import { createAppContainer } from '../navigation-native';
import PaymentDebugScreen from '../components/PaymentDebugScreen';
import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import { CloudContext } from '../cloud-core/KiteReact';
import { createClient } from '../cloud-core/Kite';
import { PopoverContainer } from '../views/Popover';
import { registerDispatcher } from '../card-reader/CardReader';
import createNativeNetworkSource from '../cloud-native/createNativeNetworkSource';

YellowBox.ignoreWarnings([
  'background tab',
  'Async Storage has been',
  'with an invalid bridge',
]);

const cloudSource = createNativeNetworkSource({
  useSSL: false,
  authority: '192.168.1.9:8808',
});

registerDispatcher(cloudSource.dispatch);

StatusBar.setHidden(true, 'none');

const App = createStackTransitionNavigator({
  PaymentDebug: PaymentDebugScreen,
});

const AppContainer = createAppContainer(App);

const cloud = createClient({
  source: cloudSource,
  domain: 'onofood.co',
});

const NAV_STORAGE_KEY = 'NavigationState';
function FullApp() {
  return (
    <PopoverContainer>
      <CloudContext.Provider value={cloud}>
        <AppContainer persistenceKey={NAV_STORAGE_KEY} />
      </CloudContext.Provider>
    </PopoverContainer>
  );
}

export default FullApp;
