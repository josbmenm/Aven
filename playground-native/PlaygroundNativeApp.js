if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

import React from 'react';
import {
  View,
  Text,
  StatusBar,
  AsyncStorage,
  ScrollView,
  YellowBox,
} from 'react-native';
import { createAppContainer } from '../navigation-native';
import codePush from 'react-native-code-push';
import ComponentPlaygroundScreen from '../screens/ComponentPlaygroundScreen';
import useCloudProvider from '../components/useCloudProvider';
import Button from '../components/Button';
import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import LinearGradient from 'react-native-linear-gradient';
import { CloudContext } from '../cloud-core/KiteReact';
import ErrorContainer from '../cloud-react/ErrorContainer';
import { PopoverContainer } from '../views/Popover';
import { HostContextContainer } from '../components/AirtableImage';
import createNativeNetworkSource from '../cloud-native/createNativeNetworkSource';
import { ThemeProvider } from '../dashboard/Theme';
import OnoTheme from '../logic/OnoTheme';

let IS_DEV = process.env.NODE_ENV !== 'production';
// IS_DEV = false;

const RESTAURANT_DEV = {
  useSSL: false,
  authority: '192.168.1.81:8830',
};
const RESTAURANT_PROD = {
  useSSL: false,
  authority: 'restaurant0.maui.onofood.co:8830',
};

const HOST_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

const cloudSource = createNativeNetworkSource(HOST_CONFIG);

YellowBox.ignoreWarnings([
  'background tab',
  'Async Storage has been',
  'with an invalid bridge',
  'CardReaderLog',
]);

let codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

const isProduction = process.env.NODE_ENV !== 'development';

isProduction &&
  setInterval(() => {
    codePush
      .sync({
        updateDialog: false,
        installMode: codePush.InstallMode.IMMEDIATE,
      })
      .then(() => {})
      .catch(e => {
        console.error('Code update check failed');
        console.error(e);
      });
  }, 10000);

StatusBar.setHidden(true, 'none');

process.env.REACT_NAV_LOGGING = true;

const App = createStackTransitionNavigator({
  ComponentPlayground: ComponentPlaygroundScreen,
});

const AppContainer = createAppContainer(App);

function RetryButton({ onRetry }) {
  return <Button title="Try again.." onPress={onRetry} />;
}

function renderAppError({ error, errorInfo, onRetry }) {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Text>O, no!</Text>
      <Text>{error.message}</Text>
      <RetryButton onRetry={onRetry} />
    </ScrollView>
  );
}

const NAV_STORAGE_KEY = 'PlaygroundNavigationState';
function FullApp() {
  const cloud = useCloudProvider({
    source: cloudSource,
    domain: 'onofood.co',
  });
  if (!cloud) {
    return null;
  }
  return (
    <ThemeProvider value={OnoTheme}>
      <HostContextContainer {...HOST_CONFIG}>
        <PopoverContainer>
          <CloudContext.Provider value={cloud}>
            <ErrorContainer
              renderError={renderAppError}
              onCatch={async (e, info, onRetry) => {
                if (e.type === 'SessionInvalid') {
                  cloud.destroySession({ ignoreRemoteError: true });
                  onRetry();
                }

                await AsyncStorage.removeItem(NAV_STORAGE_KEY);
              }}
            >
              <AppContainer persistenceKey={NAV_STORAGE_KEY} />
            </ErrorContainer>
          </CloudContext.Provider>
        </PopoverContainer>
      </HostContextContainer>
    </ThemeProvider>
  );
}

const ENABLE_DEV_OVERLAY = false;

function withDevOverlay(FullApp) {
  if (__DEV__ && ENABLE_DEV_OVERLAY) {
    function FullAppDev() {
      return (
        <View style={{ flex: 1 }}>
          <FullApp />
          <LinearGradient
            colors={['#ffffffff', '#ffffff00']}
            style={{
              position: 'absolute',
              right: 250,
              left: 250,
              height: 50,
              top: 0,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Button
              title="refresh"
              onPress={() => {
                codePush.restartApp();
              }}
            />
            <Button
              title="clear nav"
              onPress={() => {
                AsyncStorage.removeItem(NAV_STORAGE_KEY);
              }}
            />
          </LinearGradient>
        </View>
      );
    }
    return FullAppDev;
  }
  return FullApp;
}

const AutoUpdatingApp = codePush(codePushOptions)(withDevOverlay(FullApp));

export default AutoUpdatingApp;
