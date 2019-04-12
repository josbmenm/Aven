import React, { Component, useReducer, useEffect } from 'react';
import Hero from '../../components/Hero';
import BitRow from '../../components/BitRow';
import { withNavigation } from '../../navigation-core';

import GenericPage from '../../components/GenericPage';
import RowSection from '../../components/RowSection';
import { View, ScrollView, Text } from 'react-native';
import LinkRow from '../../components/LinkRow';
import { getSubsystemOverview, withKitchen } from '../../ono-cloud/OnoKitchen';
import useCloud from '../../cloud-core/useCloud';
import useObservable from '../../cloud-core/useObservable';

function IsConnectedRow() {
  const cloud = useCloud();
  const isConnected = useObservable(cloud.isConnected);
  return <BitRow title="Server Connected" value={isConnected} />;
}

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
            title={system.name}
            rightIcon={
              system.noFaults === null ? '' : system.noFaults ? '👍' : '🚨'
            }
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
    // kitchenState.observeValue.subscribe(kitchenState => {
    //   console.log('yyyyyy', kitchenState);
    // });
  }, [cloud.isConnected, kitchenState]);
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 40 }}>
        {logs.map(log => (
          <Text style={{ fontSize: 28 }}>{log.message}</Text>
        ))}
      </View>
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
