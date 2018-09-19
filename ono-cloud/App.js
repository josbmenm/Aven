import { View, Text } from 'react-native';
import React from 'react';

const _pubConfig =
  process.env.PUBLIC_CONFIG_JSON && JSON.parse(process.env.PUBLIC_CONFIG_JSON);
const getPublicConfig = valueName => {
  if (_pubConfig && _pubConfig[valueName] !== undefined) {
    return _pubConfig[valueName];
  }
  return process.env[valueName];
};
const _privConfig =
  process.env.PUBLIC_CONFIG_JSON && JSON.parse(process.env.PUBLIC_CONFIG_JSON);
const getPrivateConfig = valueName => {
  if (_privConfig && _privConfig[valueName] !== undefined) {
    return _privConfig[valueName];
  }
  return process.env[valueName];
};

const App = () => {
  return (
    <View style={{ flex: 1, backgroundColor: 'green' }}>
      <Text>Hello globe!</Text>
      <Text>My pub config is {getPublicConfig('FOO')}</Text>
      <Text>My priv config is {getPrivateConfig('AIRTABLE_API_KEY')}</Text>
    </View>
  );
};

export default App;
