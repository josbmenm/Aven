import React, { Component, useReducer, useEffect } from 'react';
import Hero from '../../components/Hero';
import BitRow from '../../components/BitRow';
import { withNavigation } from '../../navigation-core';

import GenericPage from '../../components/GenericPage';
import RowSection from '../../components/RowSection';
import { View, ScrollView, Text } from 'react-native';
import LinkRow from '../../components/LinkRow';
import {
  getSubsystemOverview,
  withKitchen,
  withRestaurant,
} from '../../ono-cloud/OnoKitchen';
import useCloud from '../../cloud-core/useCloud';

import withObservables from '@nozbe/with-observables';

const IsConnectedWithState = ({ isConnected }) => (
  <BitRow title="Server Connected" value={isConnected} />
);

const IsConnected = withObservables(['isConnected'], ({ isConnected }) => ({
  isConnected,
}))(IsConnectedWithState);

const IsConnectedRow = withRestaurant(({ restaurantClient }) => (
  <IsConnected isConnected={restaurantClient.isConnected} />
));

const PLCConnectedRow = withKitchen(({ kitchenState }) => (
  <BitRow
    title="PLC Connected"
    value={kitchenState && kitchenState.isPLCConnected}
  />
));

const Subsystems = withNavigation(
  withKitchen(({ navigation, kitchenState, kitchenConfig }) => {
    const subsystems = getSubsystemOverview(kitchenConfig, kitchenState);
    return (
      <RowSection>
        {subsystems.map(system => (
          <LinkRow
            key={system.name}
            onPress={() => {
              navigation.navigate({
                routeName: 'KitchenEngSub',
                params: { system: system.name },
              });
            }}
            icon={system.icon}
            title={`${system.name} ${
              system.noFaults === null ? '' : system.noFaults ? '👍' : '🚨'
            }`}
          />
        ))}
      </RowSection>
    );
  }),
);

function LogView() {
  const [logs, dispatchLogs] = useReducer((state, action) => {
    if (action.event) {
      return [...state, action.event];
    }
    if (action.clear) {
      return [];
    }
    return state;
  }, []);
  const cloud = useCloud();
  const kitchenState = cloud.get('KitchenState');
  useEffect(() => {
    cloud.isConnected.subscribe(isConn => {
      dispatchLogs({
        event: {
          message: isConn ? 'Connected to Server' : 'Disconnected from Server',
        },
      });
    });
    kitchenState.observeValue.subscribe(kitchenState => {
      console.log('yyyyyy', kitchenState);
    });
  }, [cloud.isConnected, kitchenState]);
  return (
    <ScrollView style={{ flex: 1 }}>
      {logs.map(log => (
        <Text>{log.message}</Text>
      ))}
    </ScrollView>
  );
}

export default class KitchenEngScreen extends Component {
  static navigationOptions = GenericPage.navigationOptions;
  render() {
    return (
      <GenericPage {...this.props} disableScrollView={true}>
        <Hero title="Kitchen Engineering" icon="🛠" />
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <LogView />
          <ScrollView style={{ flex: 1 }}>
            <RowSection>
              <PLCConnectedRow />
              <IsConnectedRow />
            </RowSection>
            <Subsystems />
          </ScrollView>
        </View>
      </GenericPage>
    );
  }
}
