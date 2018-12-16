import { setHostConfig } from './components/AirtableImage';
import createNativeNetworkSource from '../aven-cloud-native/createNativeNetworkSource';

const IS_DEV = process.env.NODE_ENV !== 'production';

const RESTAURANT_DEV = {
  useSSL: false,
  authority: 'localhost:8830',
};
const RESTAURANT_PROD = {
  useSSL: false,
  authority: '192.168.1.200:8830',
};

const HOST_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

setHostConfig(HOST_CONFIG);

const dataSource = createNativeNetworkSource(HOST_CONFIG);

export default dataSource;
