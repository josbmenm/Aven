import { RNDomInstance } from 'react-native-dom';

// Path to RN Bundle Entrypoint ================================================
const rnBundlePath = './entry.bundle?platform=dom&dev=true&hot=true';

// React Native DOM Runtime Options =============================================
const ReactNativeDomOptions = {
  enableHotReload: true,
  nativeModules: [],
};

// App Initialization ============================================================
const app = new RNDomInstance(
  rnBundlePath,
  'domapp',
  document.body,
  ReactNativeDomOptions,
);

app.start();