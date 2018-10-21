import React, { Component } from 'react';
import { Text, View } from 'react-native';
import Title from '../../ono-components/Title';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import LinkRow from '../../ono-components/LinkRow';
import withObservables from '@nozbe/with-observables';
import { Client } from '../../ono-data-client/OnoDataClient';

const StatusRow = ({ title, value }) => (
  <View style={{}}>
    <Text style={{}}>
      {title} {value ? 'True' : 'False'}
    </Text>
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: value ? '#8c8' : '#c88',
      }}
    />
  </View>
);
const ConnectionStatusRow = withObservables([], () => ({
  isConnected: Client.isConnected,
}))(({ isConnected }) => <StatusRow title="Connected" value={isConnected} />);

export default class KitchenEngScreen extends Component {
  render() {
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Title>Kitchen Engineering</Title>
        <ConnectionStatusRow />
        <RowSection />
      </GenericPage>
    );
  }
}
