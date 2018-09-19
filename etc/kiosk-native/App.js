/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  Modal,
  View,
  NativeModules,
  NativeEventEmitter
} from "react-native";

const OPaymentManager = NativeModules.OPaymentManager;

const AppEmitter = new NativeEventEmitter(
  NativeModules.ReactNativeEventEmitter
);

AppEmitter.addListener("OPaymentCancelled", response =>
  alert("ono payment cancelled! " + JSON.stringify(response))
);
AppEmitter.addListener("OPaymentComplete", response =>
  alert("YAY, ono payment complete! " + JSON.stringify(response))
);
AppEmitter.addListener("OPaymentError", response =>
  alert("ono payment error! " + JSON.stringify(response))
);

// subscription.remove();

export default class App extends Component {
  componentDidMount() {
    OPaymentManager.setup();
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>
          {JSON.stringify(OPaymentManager)}
        </Text>
        <Text
          style={styles.instructions}
          onPress={async () => {
            const result = await new Promise(resolve => {
              OPaymentManager.getPermissions(resolve);
            });

            alert(JSON.stringify(result));
          }}
        >
          Get permissions
        </Text>
        <Text
          style={styles.instructions}
          onPress={() => {
            OPaymentManager.getPayment(100, "yes react native");
          }}
        >
          Pay me!
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
