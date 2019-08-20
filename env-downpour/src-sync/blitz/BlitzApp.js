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
import {
  useStreamValue,
  useValue,
  useCloudValue,
  useCloud,
  useCloudReducer,
  CloudContext,
} from '../cloud-core/KiteReact';
import DevicesReducer from '../logic/DevicesReducer';
import codePush from 'react-native-code-push';

import FeedbackApp from './FeedbackApp';
import ProductHomeScreen from '../screens/ProductHomeScreen';
import KioskHomeScreen from '../screens/KioskHomeScreen';
import BlendScreen from '../screens/BlendScreen';
import CustomizeBlendScreen from '../screens/CustomizeBlendScreen';
import FoodScreen from '../screens/FoodScreen';
import PaymentDebugScreen from '../screens/PaymentDebugScreen';
import Spinner from '../components/Spinner';

import Button from '../components/Button';
import OrderConfirmScreen from '../screens/OrderConfirmScreen';
import OrderCompleteScreen from '../screens/OrderCompleteScreen';
import CollectNameScreen from '../screens/CollectNameScreen';
import SendReceiptScreen from '../screens/SendReceiptScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AppUpsellScreen from '../screens/AppUpsellScreen';
import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import LinearGradient from 'react-native-linear-gradient';
import { OrderContextProvider } from '../ono-cloud/OnoKitchen';
import OrderSidebarPage from '../components/OrderSidebarPage';
import { PopoverContainer } from '../views/Popover';
import { registerDispatcher } from '../card-reader/CardReader';
import { HostContextContainer } from '../components/AirtableImage';
import createNativeNetworkSource from '../cloud-native/createNativeNetworkSource';
import useCloudProvider from '../components/useCloudProvider';
import FadeTransition from '../components/FadeTransition';
import { titleStyle } from '../components/Styles';
import { AppEnvContext } from '../components/useBlitzDebugPopover';
import { ThemeProvider } from '../dashboard/Theme';
import OnoTheme from '../logic/OnoTheme';
import cuid from 'cuid';
import useAsyncStorage, { isStateUnloaded } from '../screens/useAsyncStorage';

let VERSE_IS_DEV = process.env.NODE_ENV !== 'production';
let SKYNET_IS_DEV = process.env.NODE_ENV !== 'production';

// uncomment to test prod mode:
// VERSE_IS_DEV = false;
// SKYNET_IS_DEV = false;

const VERSE_HOST_CONFIG = VERSE_IS_DEV
  ? {
      // Verse dev:
      useSSL: false,
      authority: 'localhost:8830',
    }
  : {
      // Verse prod:
      useSSL: false,
      authority: 'restaurant0.maui.onofood.co:8830',
    };
const SKYNET_HOST_CONFIG = SKYNET_IS_DEV
  ? {
      // Skynet dev:
      useSSL: false,
      authority: 'localhost:8840',
    }
  : {
      // Skynet prod:
      useSSL: true,
      authority: 'onoblends.co',
    };

const verseSource = createNativeNetworkSource(VERSE_HOST_CONFIG);

const skynetSource = createNativeNetworkSource(SKYNET_HOST_CONFIG);

YellowBox.ignoreWarnings([
  'background tab',
  'Async Storage has been',
  'with an invalid bridge',
  'CardReaderLog',
]);

registerDispatcher(verseSource.dispatch);

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
    OrderComplete: OrderCompleteScreen,
    KioskHome: KioskHomeScreen,
    OrderConfirm: OrderConfirmScreen,
    OrderComplete: OrderCompleteScreen,
    CollectName: CollectNameScreen,
    SendReceipt: SendReceiptScreen,
    Receipt: ReceiptScreen,
    PaymentDebug: PaymentDebugScreen,
    AppUpsell: AppUpsellScreen,
    OrderNavigator,
  },
  {
    ContainerView: FadeTransition,
  },
);

process.env.REACT_NAV_LOGGING = true;

const KioskAppContainer = createAppContainer(KioskAppNavigator);

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

const NAV_STORAGE_KEY = 'NavigationState-N3e26u1o';
// function FullApp() {
//   return (
//     <PopoverContainer>
//       <CloudContext.Provider value={cloud}>
//         <ErrorContainer
//           renderError={renderAppError}
//           onCatch={async () => {
//             await AsyncStorage.removeItem(NAV_STORAGE_KEY);
//           }}
//         >
//           <OrderContextProvider>
//             <AppContainer persistenceKey={NAV_STORAGE_KEY} />
//           </OrderContextProvider>
//         </ErrorContainer>
//       </CloudContext.Provider>
//     </PopoverContainer>
//   );
// }

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
    <ThemeProvider value={OnoTheme}>
      <HostContextContainer {...hostConfig}>
        <AppEnvContext.Provider value={{ isSkynet, setIsSkynet }}>
          <CloudContext.Provider value={cloud}>
            <PopoverContainer>
              <OrderContextProvider>
                <KioskAppContainer />
              </OrderContextProvider>
            </PopoverContainer>
          </CloudContext.Provider>
        </AppEnvContext.Provider>
      </HostContextContainer>
    </ThemeProvider>
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
      {name && (
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
    const deviceNotActiveYet =
      !!devicesState && !devices.find(d => d.deviceId !== deviceId);
    const isDeviceIdReady = !!deviceId && !isStateUnloaded(deviceId);
    if (isDeviceIdReady && deviceNotActiveYet) {
      dispatch({ type: 'DeviceOnline', deviceId });
    }
  }, [devicesState, deviceId]);
  const controlState = devices.find(d => d.deviceId !== deviceId);
  const mode = controlState && controlState.mode;
  const name = (controlState && controlState.name) || deviceId;

  if (mode === 'feedback') {
    return <FeedbackApp />;
  }
  if (mode === 'kiosk' || mode === 'testKiosk') {
    return <KioskApp mode={mode} />;
  }
  if (mode === 'cardreader') {
    return <SettingsApp />;
  }

  if (!mode || !controlState) {
    return <KioskApp mode={'testKiosk'} />;
  }

  if (!isConnected || isStateUnloaded(deviceId)) {
    return <WaitingPage name={name} title="Kiosk Disconnected" />;
  }

  return <WaitingPage name={name} title="Kiosk Closed" />;
}

function FullApp() {
  const cloud = useCloudProvider({
    source: verseSource,
    domain: 'onofood.co',
    establishAnonymousSession: true,
  });
  if (!cloud) {
    return null;
  }
  return (
    <CloudContext.Provider value={cloud}>
      <SelectModeApp />
    </CloudContext.Provider>
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
