import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { createSwitchNavigator } from '../react-navigation-switch-navigator';
import { createAppContainer } from '../react-navigation-native-container';

class ScreenA extends React.Component {
  render() {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>Hello, screen A!</Text>
        <Button
          onPress={() => {
            this.props.navigation.navigate('ScreenB');
          }}
          title="Go Screen B"
        />
      </View>
    );
  }
}

class ScreenB extends React.Component {
  render() {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>Hello, screen B!</Text>
        <Button
          onPress={() => {
            this.props.navigation.navigate('ScreenA');
          }}
          title="Go Back"
        />
      </View>
    );
  }
}

const App = createAppContainer(
  createSwitchNavigator({
    ScreenA,
    ScreenB,
  })
);

export default App;

const styles = StyleSheet.create({
  box: {
    padding: 10,
    borderWidth: 3,
    borderColor: 'blue',
    flex: 1,
  },
  text: { fontWeight: 'bold' },
});
