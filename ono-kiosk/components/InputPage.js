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
import { inputPageStyle } from '../../ono-components/Styles';

export default class InputPage extends React.Component {
  state = { value: '' };
  componentDidMount() {
    this.refs.ti.focus();
  }
  render() {
    return (
      <View style={{ flex: 1, ...inputPageStyle }}>
        <TitleView>{this.props.title}</TitleView>
        <TextInput
          ref="ti"
          autoCorrect={false}
          autoCapitalize={this.props.type !== 'email-address'}
          keyboardType={this.props.type}
          keyboardAppearance={Styles.keyboardAppearance}
          onSubmitEditing={() => this.props.onSubmit(this.state.value)}
          onChangeText={t => this.setState({ value: t })}
          enablesReturnKeyAutomatically
          returnKeyType="done"
          style={{ textAlign: 'center', ...Styles.textInputLargeStyle }}
        />
      </View>
    );
  }
}
