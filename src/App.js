import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

class App extends React.Component {
  render() {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>WOW now it works</Text>
        <Text style={styles.text}>Hello, world!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box: { padding: 10, borderWidth: 3, flex: 1 },
  text: { fontWeight: 'bold' },
});

export default App;
