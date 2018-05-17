import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { withNavigation } from '../react-navigation-core';

import { createStackNavigator } from '../react-navigation-stack';

const Sass = ({ children }) => (
  <Text style={{ color: 'white', fontSize: 64, margin: 20 }}>{children}</Text>
);
const Input = ({ name }) => (
  <TextInput
    placeholder={name}
    secureTextEntry={name === 'password'}
    style={{
      margin: 20,
      marginVertical: 10,
      height: 40,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#ccc',
      backgroundColor: 'white',
      paddingLeft: 20,
    }}
  />
);

const SassScreen = ({ children, color }) => (
  <View style={{ flex: 1, backgroundColor: color || '#3c3', paddingTop: 90 }}>
    {children}
  </View>
);

const Button = withNavigation(({ navigation, children, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={{
        borderRadius: 20,
        height: 40,
        backgroundColor: '#fffa',
        margin: 20,
      }}>
      <Text
        style={{
          fontSize: 24,
          paddingTop: 6,
          textAlign: 'center',
          color: '#333',
        }}>
        {children}
      </Text>
    </View>
  </TouchableOpacity>
));

const LinkText = withNavigation(({ navigation, children, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={{ marginHorizontal: 20 }}>
      <Text
        style={{
          color: 'white',
          fontSize: 24,
          textAlign: 'right',
          textDecorationLine: 'underline',
        }}>
        {children}
      </Text>
    </View>
  </TouchableOpacity>
));

export default function createLogin(options) {
  class LoginMain extends React.Component {
    static navigationOptions = ({ navigation }) => {
      const title = 'Login';
      return { title };
    };
    render() {
      return (
        <SassScreen>
          <Sass>New phone, who dis?</Sass>
          <Input name="phone" />
          <LinkText
            onPress={() => {
              this.props.navigation.navigate('Register');
            }}>
            Yo I'm new here
          </LinkText>
          <Input name="password" />
          <LinkText
            onPress={() => {
              this.props.navigation.navigate('LostPassword');
            }}>
            Dude, I don't remember
          </LinkText>
          <Button
            onPress={() => {
              this.props.navigation.navigate('Main');
            }}>
            Let me in!
          </Button>
        </SassScreen>
      );
    }
  }

  class Register extends React.Component {
    render() {
      return (
        <SassScreen color="#33a">
          <Sass>Let me holla at dem digits</Sass>
          <Input name="name" />
          <Input name="phone" />
          <Input name="password" />
          <Button
            onPress={() => {
              this.props.navigation.navigate('Main');
            }}>
            Register
          </Button>
        </SassScreen>
      );
    }
  }

  class LostPassword extends React.Component {
    render() {
      return (
        <SassScreen color="#a33">
          <Sass>forgot password, you kidding me!?</Sass>
          <Input name="phone" />
          <Button
            onPress={() => {
              this.props.navigation.navigate('Verify');
            }}>
            Verify, yo
          </Button>
        </SassScreen>
      );
    }
  }

  class Verify extends React.Component {
    render() {
      return (
        <SassScreen color="#644">
          <Sass>you know what to do</Sass>
          <Input name="code" />
          <Button
            onPress={() => {
              this.props.navigation.navigate('Main');
            }}>
            Ok there
          </Button>
        </SassScreen>
      );
    }
  }

  const Navigator = createStackNavigator(
    {
      LoginMain,
      Register,
      LostPassword,
      Verify,
    },
    {
      navigationOptions: { header: null },
    },
  );

  return Navigator;
}
