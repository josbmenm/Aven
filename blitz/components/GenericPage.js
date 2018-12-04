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
import { genericPageStyle } from '../../components/Styles';
import { withNavigation } from '@react-navigation/core';

class GenericPage extends React.Component {
  render() {
    const { children, navigation, afterScrollView } = this.props;
    const canGoBack = navigation.dangerouslyGetParent().state.index > 0;
    return (
      <View style={{ flex: 1, ...genericPageStyle }}>
        <ScrollView style={{ flex: 1 }}>{children}</ScrollView>
        {afterScrollView}
        {canGoBack && (
          <TouchableOpacity
            style={{
              width: 140,
              height: 140,
              position: 'absolute',
              left: 0,
              top: 0,
              paddingTop: 50,
            }}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text
              style={{ fontSize: 100, color: '#0009', textAlign: 'center' }}
            >
              ⬅︎
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const GenericPageWithNavigation = withNavigation(GenericPage);

export default GenericPageWithNavigation;
