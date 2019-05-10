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
import useObservable from '../cloud-core/useObservable';
import useCloud from '../cloud-core/useCloud';
import codePush from 'react-native-code-push';

import FeedbackApp from './FeedbackApp';
import ProductHomeScreen from '../screens/ProductHomeScreen';
import KioskHomeScreen from '../screens/KioskHomeScreen';
import BlendScreen from '../screens/BlendScreen';
import CustomizeBlendScreen from '../screens/CustomizeBlendScreen';
import FeedbackCompleteScreen from '../screens/FeedbackCompleteScreen';
import FeedbackHomeScreen from '../screens/FeedbackHomeScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import FeedbackRatingScreen from '../screens/FeedbackRatingScreen';
import FeedbackReceiptScreen from '../screens/FeedbackReceiptScreen';
import FoodScreen from '../screens/FoodScreen';
import PaymentDebugScreen from '../components/PaymentDebugScreen';
import Spinner from '../components/Spinner';
import SequencingDebugScreen from '../screens/SequencingDebugScreen';

import Button from '../components/Button';
import OrderConfirmScreen from '../screens/OrderConfirmScreen';
import OrderCompleteScreen from '../screens/OrderCompleteScreen';
import CollectNameScreen from '../screens/CollectNameScreen';
import SendReceiptScreen from '../screens/SendReceiptScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AppUpsellScreen from '../screens/AppUpsellScreen';
import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import LinearGradient from 'react-native-linear-gradient';
import CloudContext from '../cloud-core/CloudContext';
import { OrderContextProvider } from '../ono-cloud/OnoKitchen';
import OrderSidebarPage from '../components/OrderSidebarPage';
import { PopoverContainer } from '../views/Popover';
import { registerDispatcher } from '../card-reader/CardReader';
import { setHostConfig } from '../components/AirtableImage';
import createNativeNetworkSource from '../cloud-native/createNativeNetworkSource';
import useCloudProvider from '../components/useCloudProvider';
import FadeTransition from '../components/FadeTransition';
import { titleStyle } from '../components/Styles';

let IS_DEV = process.env.NODE_ENV !== 'production';
// IS_DEV = false;

const RESTAURANT_DEV = {
  useSSL: false,
  authority: '192.168.1.9:8840', // office laptop (skynet)
  // authority: '192.168.1.29:8830', // office laptop
  // authority: 'localhost:8830', // generic simulator
  // authority: 'restaurant0.maui.onofood.co:8830', // prod test
};
const RESTAURANT_PROD = {
  // useSSL: false,
  useSSL: true,
  // authority: 'restaurant0.maui.onofood.co:8830',
  authority: 'onofood.co',
};

const HOST_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

setHostConfig(HOST_CONFIG);

const cloudSource = createNativeNetworkSource(HOST_CONFIG);

YellowBox.ignoreWarnings([
  'background tab',
  'Async Storage has been',
  'with an invalid bridge',
  'CardReaderLog',
]);

registerDispatcher(cloudSource.dispatch);

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
    // Home: HomeScreen,
    // ComponentPlayground: ComponentPlaygroundScreen,
    // KitchenEng: KitchenEngScreen,
    // KitchenEngSub: KitchenEngSubScreen,
    // KioskSettings: KioskSettingsScreen,
    KioskHome: KioskHomeScreen,
    // Blend: BlendScreen,
    // CustomizeBlend: CustomizeBlendScreen,
    // Food: FoodScreen,
    // ProductHome: ProductHomeScreen,
    OrderConfirm: OrderConfirmScreen,
    OrderComplete: OrderCompleteScreen,
    CollectName: CollectNameScreen,
    SendReceipt: SendReceiptScreen,
    Receipt: ReceiptScreen,
    PaymentDebug: PaymentDebugScreen,
    SequencingDebug: SequencingDebugScreen,
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

function KioskApp() {
  return (
    <PopoverContainer>
      <OrderContextProvider>
        <KioskAppContainer />
      </OrderContextProvider>
    </PopoverContainer>
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
  const session = useObservable(cloud.observeSession);
  const isConnected = useObservable(cloud.isConnected);
  const control = session && cloud.get(`@${session.accountId}/ScreenControl`);
  const controlState = useObservable(control && control.observeValue);
  if (!session) {
    return <WaitingPage title="Waiting for session" />;
  }
  const mode = controlState && controlState.mode;
  const name = controlState && controlState.name;

  if (mode === 'feedback') {
    return <FeedbackApp />;
  }
  if (mode === 'kiosk') {
    return <KioskApp />;
  }
  if (mode === 'cardreader') {
    return <SettingsApp />;
  }

  if (!isConnected) {
    return <WaitingPage name={name} title="Kiosk Disconnected" />;
  }

  if (!controlState) {
    return <WaitingPage name={name} title="Loading Configuration" />;
  }

  return <WaitingPage name={name} title="Kiosk Closed" />;
}

function useControlledApp(cloud) {
  const isReady = !!cloud && !!cloud.observeSession.getValue();
  React.useEffect(() => {
    if (!isReady) {
      return;
    }
    const deviceId = cloud.observeSession.getValue().accountId;
    cloud.get('DeviceActions').putTransaction({
      type: 'DeviceOnline',
      deviceId,
    });
  }, [cloud, isReady]);
}

function FullApp() {
  const cloud = useCloudProvider({
    source: cloudSource,
    domain: 'onofood.co',
    establishAnonymousSession: true,
  });
  useControlledApp(cloud);
  if (!cloud) {
    return null;
  }
  return (
    <CloudContext.Provider value={cloud}>
      <SelectModeApp />
    </CloudContext.Provider>
  );
}

// loadImages(PRELOAD_IMAGES)
//   .then(results => {
//     console.log('images preloaded!');
//   })
//   .catch(err => {
//     console.error('Error preloading the images!', err);
//   });

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
