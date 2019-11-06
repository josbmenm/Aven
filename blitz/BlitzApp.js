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
import { useCloudValue, useCloud, CloudContext } from '../cloud-core/KiteReact';
import DevicesReducer from '../logic/DevicesReducer';
import codePush from 'react-native-code-push';

import FeedbackApp from '../components/FeedbackApp';
import ProductHomeScreen from '../screens/ProductHomeScreen';
import KioskHomeScreen from '../screens/KioskHomeScreen';
import BlendScreen from '../screens/BlendScreen';
import CustomizeBlendScreen from '../screens/CustomizeBlendScreen';
import FoodScreen from '../screens/FoodScreen';
import PaymentDebugScreen from '../screens/PaymentDebugScreen';
import Spinner from '../components/Spinner';
import ErrorContainer from '../cloud-react/ErrorContainer';
import Button from '../components/Button';
import OrderConfirmScreen from '../screens/OrderConfirmScreen';
import OrderCompleteScreen from '../screens/OrderCompleteScreen';
import CollectNameScreen from '../screens/CollectNameScreen';
import SendReceiptScreen from '../screens/SendReceiptScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AppUpsellScreen from '../screens/AppUpsellScreen';
import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import LinearGradient from 'react-native-linear-gradient';
import { OrderContextProvider } from '../ono-cloud/OrderContext';
import OrderSidebarPage from '../components/OrderSidebarPage';
import { PopoverContainer } from '../views/Popover';
import { registerDispatcher } from '../card-reader/CardReader';
import { HostContextContainer } from '../components/AirtableImage';
import createNativeNetworkSource from '../cloud-native/createNativeNetworkSource';
import useCloudProvider from '../components/useCloudProvider';
import FadeTransition from '../components/FadeTransition';
import { titleStyle, proseFontFace, monsterra } from '../components/Styles';
import { AppEnvContext } from '../components/useBlitzDebugPopover';
import { ThemeProvider } from '../dashboard/Theme';
import OnoTheme from '../logic/OnoTheme';
import cuid from 'cuid';
import useAsyncStorage, { isStateUnloaded } from '../screens/useAsyncStorage';
import { useIsRestaurantOpen, useRestaurantState } from '../ono-cloud/Kitchen';

import * as Sentry from '@sentry/react-native';

const appPackage = require('../app.json');

let VERSE_IS_DEV = process.env.NODE_ENV !== 'production';
let SKYNET_IS_DEV = process.env.NODE_ENV !== 'production';

let IS_DEV = process.env.NODE_ENV !== 'production';
// IS_DEV = false;

// uncomment to test prod mode while developing
// VERSE_IS_DEV = false;
// SKYNET_IS_DEV = false;
// ^^ ALWAYS COMMENT THIS OUT BEFORE COMMIT AND DEPLOY! ^^

// uncomment to test dev server in release mode:
// VERSE_IS_DEV = true;
// SKYNET_IS_DEV = true;
// ^^ ALWAYS COMMENT THIS OUT BEFORE COMMIT AND DEPLOY! ^^

const VERSE_HOST_CONFIG = VERSE_IS_DEV
  ? {
      // Verse dev:
      useSSL: false,
      // authority: 'localhost:8830',
      // authority: '10.10.10.40:8830',
      authority: '192.168.1.81:8830',
    }
  : {
      // Verse prod:
      useSSL: false,
      authority: '10.10.1.200:8830',
    };

const SKYNET_HOST_CONFIG = SKYNET_IS_DEV
  ? {
      // Skynet dev:
      // useSSL: false,
      // authority: 'localhost:8840',
      // authority: '10.10.10.40:8840',
      // authority: '192.168.1.81:8830', // ev laptop
      useSSL: true,
      authority: 'onoblends.co',
    }
  : {
      // Skynet prod:
      useSSL: true,
      authority: 'onoblends.co',
    };

const verseSource = createNativeNetworkSource(VERSE_HOST_CONFIG);

const skynetSource = createNativeNetworkSource(SKYNET_HOST_CONFIG);

const isProduction = process.env.NODE_ENV !== 'development';

if (isProduction) {
  Sentry.init({
    dsn: appPackage.sentryDSN,
  });
  codePush
    .getUpdateMetadata()
    .then(update => {
      console.log('Codepush metadata: ', update);
      if (update) {
        const releaseString = `${update.appVersion}-codepush:${update.label}`;
        Sentry.setRelease(releaseString);
        console.log('Set Sentry release string to: ' + releaseString);
      }
    })
    .catch(err => {
      console.error('Failed to get codepush metadata!');
      console.error(err);
    });
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
}

YellowBox.ignoreWarnings([
  'background tab',
  'Async Storage has been',
  'with an invalid bridge',
  'CardReaderLog',
]);

registerDispatcher(verseSource.dispatch);

const codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

StatusBar.setHidden(true, 'none');

const OrderNavigator = createStackTransitionNavigator(
  {
    ProductHome: ProductHomeScreen,
    Blend: BlendScreen,
    CustomizeBlend: CustomizeBlendScreen,
    Food: FoodScreen,
  },
  {
    alwaysTopRoute: null,
    ContainerView: OrderSidebarPage,
  },
);

const KioskAppNavigator = createStackTransitionNavigator(
  {
    KioskHome: KioskHomeScreen,
    OrderConfirm: OrderConfirmScreen,
    OrderComplete: OrderCompleteScreen,
    CollectName: CollectNameScreen,
    SendReceipt: SendReceiptScreen,
    Receipt: ReceiptScreen,
    PaymentDebug: PaymentDebugScreen,
    AppUpsell: AppUpsellScreen,
    OrderNavigator,
    OrderComplete: OrderCompleteScreen,
  },
  {
    ContainerView: FadeTransition,
  },
);

process.env.REACT_NAV_LOGGING = true;

const KioskAppContainer = React.memo(createAppContainer(KioskAppNavigator));

function RetryButton({ onRetry }) {
  return (
    <Button title="try again.." onPress={onRetry} style={{ alignSelf: 'ce' }} />
  );
}

function renderAppError({ error, errorInfo, onRetry }) {
  let message = IS_DEV
    ? error.message
    : 'The app broke. Please retry or ask your guide to help';
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text
          style={{
            ...titleStyle,
            fontSize: 48,
            marginTop: 100,
            textAlign: 'center',
          }}
        >
          uh oh!
        </Text>
        <Text
          style={{
            ...proseFontFace,
            fontSize: 32,
            color: monsterra,
            textAlign: 'center',
            marginVertical: 40,
          }}
        >
          {message}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <RetryButton onRetry={onRetry} />
        </View>
      </View>
    </ScrollView>
  );
}

function ClosableKioskContainer({ children }) {
  const [restaurantState] = useRestaurantState();
  const { isTraveling, isClosed, closingSoon } = useIsRestaurantOpen(
    restaurantState,
  );

  if (isTraveling) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }
  return children;
}

const NAV_STORAGE_KEY = 'NavigationState-N3e26u1o';

const PRELOAD_IMAGES = [
  require('../components/assets/BgHome.png'),
  require('../components/assets/BgGeneric.png'),
];

function KioskApp({ mode }) {
  // const isTestKiosk = mode === 'testKiosk';
  const isTestKiosk = false;
  const [isSkynet, setIsSkynet] = React.useState(isTestKiosk);
  const hostConfig = isSkynet ? SKYNET_HOST_CONFIG : VERSE_HOST_CONFIG;
  const cloud = useCloudProvider({
    source: isSkynet ? skynetSource : verseSource,
    domain: 'onofood.co',
    establishAnonymousSession: true,
  });
  if (!cloud) {
    return <Spinner />;
  }

  return (
    <HostContextContainer {...hostConfig}>
      <CloudContext.Provider value={cloud}>
        <PopoverContainer>
          <ClosableKioskContainer>
            <OrderContextProvider>
              <KioskAppContainer />
            </OrderContextProvider>
          </ClosableKioskContainer>
        </PopoverContainer>
      </CloudContext.Provider>
    </HostContextContainer>
  );
}

const SettingsAppNavigator = createStackTransitionNavigator({
  PaymentDebug: PaymentDebugScreen,
});

const SettingsAppContainer = createAppContainer(SettingsAppNavigator);

function SettingsApp() {
  return (
    <PopoverContainer>
      <SettingsAppContainer />
    </PopoverContainer>
  );
}

function WaitingPage({ title, name }) {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <View style={{ marginVertical: 30 }}>
        <Spinner />
      </View>
      {!!name && (
        <Text
          style={{ ...titleStyle, textAlign: 'center', marginVertical: 10 }}
        >
          {name}
        </Text>
      )}
      <Text style={{ ...titleStyle, textAlign: 'center' }}>{title}</Text>
    </View>
  );
}

function SelectModeApp() {
  const cloud = useCloud();
  const [deviceId, setDeviceId] = useAsyncStorage('BlitzDeviceId', null);
  React.useEffect(() => {
    if (!isStateUnloaded(deviceId) && !deviceId) {
      setDeviceId(cuid());
    }
  }, [deviceId]);
  const dispatch = useCloud().get('DeviceActions').putTransactionValue;
  const devicesState = useCloudValue('DevicesState');
  const devices = (devicesState && devicesState.devices) || [];
  React.useEffect(() => {
    const isDeviceIdReady = !!deviceId && !isStateUnloaded(deviceId);
    if (isDeviceIdReady) {
      dispatch({ type: 'DeviceOnline', deviceId });
    }
  }, [deviceId]);
  const controlState = devices.find(d => d.deviceId === deviceId);
  const mode = controlState && controlState.mode;
  const name = controlState && controlState.name;

  // let content = <KioskApp mode={'kiosk'} />;
  let content = <WaitingPage name={name} title="hang tight..." />;

  if (mode === 'feedback') {
    content = <FeedbackApp />;
  }
  if (true || mode === 'kiosk' || mode === 'testKiosk') {
    content = <KioskApp mode={mode} />;
  }
  return (
    <AppEnvContext.Provider value={{ mode, deviceId }}>
      {content}
    </AppEnvContext.Provider>
  );
}

function FullApp() {
  const cloud = useCloudProvider({
    source: skynetSource,
    domain: 'onofood.co',
    establishAnonymousSession: true,
  });
  if (!cloud) {
    return null;
  }
  return (
    <ThemeProvider value={OnoTheme}>
      <ErrorContainer
        renderError={renderAppError}
        onCatch={async () => {
          await AsyncStorage.removeItem(NAV_STORAGE_KEY);
        }}
      >
        <CloudContext.Provider value={cloud}>
          <SelectModeApp />
        </CloudContext.Provider>
      </ErrorContainer>
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
