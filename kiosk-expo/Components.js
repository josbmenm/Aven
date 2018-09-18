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

const placeholderTitleSize = 68;
const placeholderPadding = 30;

const genericFont = {
  fontFamily: 'Courier New',
  color: '#111',
};

export const TitleView = ({ children, secondary }) => (
  <Text
    style={{
      ...genericFont,
      fontSize: placeholderTitleSize,
      textAlign: 'center',
      padding: 100,
      color: '#111',
    }}
  >
    {children}
  </Text>
);

export const Page = ({ children, title, navigation, disableScroll }) => (
  <View style={{ flex: 1 }}>
    <View
      style={{
        backgroundColor: '#ccc',
        alignSelf: 'stretch',
        flexDirection: 'column',
      }}
    >
      <View
        style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center' }}
      >
        <Text
          style={{
            ...genericFont,
            color: '#111',
            fontSize: placeholderTitleSize,
            textAlign: 'center',
            paddingHorizontal: 60,
            paddingVertical: 20,
          }}
        >
          {title}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          paddingVertical: 20,
        }}
      >
        <Text
          style={{
            marginVertical: 20,
            marginHorizontal: 20 + placeholderPadding,
            fontSize: 80,
            color: '#222',
          }}
        >
          ←
        </Text>
      </TouchableOpacity>
    </View>

      {children}
  </View>
);

export class InputPage extends React.Component {
  state = {value: ''}
  componentDidMount() {
    this.refs.ti.focus();
  }
  render() {
    return <Page>
    <TitleView>{this.props.title}</TitleView>
    <TextInput ref="ti" autoCorrect={false} autoCapitalize={this.props.type !== 'email-address'} keyboardType={this.props.type} keyboardAppearance="dark" onSubmitEditing={() => this.props.onSubmit(this.state.value)} onChangeText={t => this.setState({value: t})} enablesReturnKeyAutomatically returnKeyType="done" style={{textAlign: 'center', fontSize: placeholderTitleSize}} />
  </Page>
}
}


export const ButtonRow = ({ onPress, title }) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={{
        alignSelf: 'center',
        borderRadius: 70,
        backgroundColor: '#111',
        marginTop: 10,
        paddingHorizontal: 50,
        paddingVertical: 15,
      }}
    >
      <Text
        style={{
          ...genericFont,
          fontSize: 36,
          color: '#fff',
          fontWeight: 'bold',
        }}
      >
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);
