import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';

import { Page, ButtonRow } from './Components';

import truck from './Truck';

const DebugRow = ({ label, letter }) => (
  <ButtonRow
    onPress={() => {
      truck.sendDebugCommand(letter);
    }}
    title={label + ' (' + letter + ')'}
  />
);

export default class Debug extends Component {
  static path = '';
  render() {
    return (
      <Page title="debug" {...this.props}>
        <ScrollView style={{ flex: 1 }}>
          <DebugRow label="Home Machine" letter="a" />
          <DebugRow label="Toggle Water Valve (5s)" letter="b" />
          <DebugRow label="Toggle Milk Valve (5s)" letter="c" />
          <DebugRow label="Toggle Coffee Valve (5s)" letter="d" />
          <DebugRow label="Run Fruit 1 (10K)" letter="e" />
          <DebugRow label="Run Fruit 2 (10K)" letter="f" />
          <DebugRow label="Run Gran 1 (200)" letter="g" />
          <DebugRow label="Run Gran 2 (200)" letter="h" />
          <DebugRow label="Run Gran 3 (200)" letter="i" />
          <DebugRow label="Run Gran 4 (200)" letter="j" />
          <DebugRow label="Run Gran 5 (200)" letter="k" />
          <DebugRow label="Run Peanut Butter (Down 500)" letter="l" />
          <DebugRow label="Move Positioner (-500)" letter="m" />
          <DebugRow label="Move Positioner (500)" letter="n" />
          <DebugRow label="Make Smoothie- Focus" letter="o" />
          <DebugRow label="Make Smoothie- Fitness" letter="p" />
          <DebugRow label="Query Readyness" letter="q" />
        </ScrollView>
      </Page>
    );
  }
}
