import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

export default class CallToActionButton extends Component {
  render() {
    const { onPress, label } = this.props;
    return (
      <TouchableOpacity onPress={onPress} style={{ margin: 30 }}>
        <View
          style={{ padding: 40, backgroundColor: '#222', borderRadius: 30 }}
        >
          <Text
            style={{
              fontSize: 40,
              textAlign: 'center',
              ...genericFont,
              color: 'white',
            }}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}
