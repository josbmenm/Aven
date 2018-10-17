import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TouchableHighlight,
  Image,
  TextInput,
} from 'react-native';
import { genericPageStyle } from '../../ono-components/Styles';

export default class GenericPage extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <View style={{ flex: 1, ...genericPageStyle }}>
        <ScrollView style={{ flex: 1 }}>{children}</ScrollView>
      </View>
    );
  }
}
