import { View, Text } from 'react-native';
import React from 'react';

export default class App extends React.Component {
  render() {
    const { env } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <Text
          onPress={() => {
            alert('hello');
          }}
        >
          Ono Kitchen
        </Text>
      </View>
    );
  }
}
