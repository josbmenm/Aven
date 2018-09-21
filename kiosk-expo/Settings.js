import React, { Component } from 'react';
import { View, Text } from 'react-native';

import { Page, ButtonRow, TitleView } from './Components';

export default class Debug extends Component {
  static path = '';
  render() {
    return (
      <Page title="App Settings" {...this.props}>
        <TitleView>App Settings</TitleView>
        <ButtonRow
          onPress={() => {
            console.log('asdf');
          }}
          title={'do something'}
        />
      </Page>
    );
  }
}
