import createNativeNetworkSource from '../aven-cloud-native/createNativeNetworkSource';

const IS_DEV = process.env.NODE_ENV !== 'production';

const RESTAURANT_DEV = {
  useSSL: false,
  authority: 'restaurant0.maui.onofood.co:8830', // prod test
  // authority: '192.168.1.9:8830', // office laptop
  // authority: '10.0.1.6:8830', // home laptop
  // authority: 'localhost:8830', // generic simulator
};

const RESTAURANT_PROD = {
  useSSL: false,
  authority: 'restaurant0.maui.onofood.co:8830',
  // authority: '192.168.1.200:8830',
};

const HOST_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

const dataSource = createNativeNetworkSource(HOST_CONFIG);

export default dataSource;
