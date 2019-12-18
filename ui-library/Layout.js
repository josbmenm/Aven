import React from 'react';
import { View, ScrollView } from 'react-native';
import Heading from '../dash-ui/Heading';
import { Spacing } from '../dash-ui/Theme';

export function Layout({ children, ...rest }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'stretch',
        height: '100%',
      }}
    >
      {children}
    </View>
  );
}

export function Sidebar({ children }) {
  return (
    <View
      style={{
        width: 300,
        borderRightWidth: 1,
        borderRightColor: '#dadada',
        padding: 24,
      }}
    >
      <ScrollView contentContainerStyle={{}}>{children}</ScrollView>
    </View>
  );
}

export function Content({ children }) {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          width: '100%',
          alignItems: 'center',
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function Container({ children }) {
  return <View style={{ maxWidth: 800, width: '100%' }}>{children}</View>;
}

export function ComponentBlock({ children, title }) {
  return (
    <Spacing bottom={80}>
      <Heading title={title} />
      <Spacing top={20}>{children}</Spacing>
    </Spacing>
  );
}
