import React from 'react';

import { createStackNavigator } from '../react-navigation-stack';

export default function createLogin(options) {
  class LoginMain extends React.Component {
    render() {
      // Its login time!
      // Dont worry, it will be over soon
      return null;
    }
  }

  class Register extends React.Component {
    // Lemmie get dat numba
    render() {
      return null;
    }
  }

  class LostPassword extends React.Component {
    // Lost password, seriously!?
    render() {
      return null;
    }
  }

  class Verify extends React.Component {
    // Who dis?
    render() {
      return null;
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
