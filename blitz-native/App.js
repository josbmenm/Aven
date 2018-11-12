/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import codePush from 'react-native-code-push';
import { Platform, TouchableOpacity, Text, View } from 'react-native';
let codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

setInterval(() => {
  codePush
    .sync({
      updateDialog: false,
      installMode: codePush.InstallMode.IMMEDIATE,
    })
    .then(() => {
      console.log('Code update check success');
    })
    .catch(e => {
      console.error('Code update check failed');
      console.error(e);
    });
}, 10000);

class MyApp extends Component {
  render() {
    return (
      <View>
        <Text>updates are automatic!</Text>
      </View>
    );
  }
}

export default codePush(codePushOptions)(MyApp);
