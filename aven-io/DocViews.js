import React from 'react';
import { Text, View, ScrollView } from 'react-native';

import InnerLink from '../navigation-web/Link';

export function Link({ children, ...props }) {
  return <InnerLink {...props}>{children}</InnerLink>;
}

export function Title({ children }) {
  return <Text style={{ fontSize: 42, marginBottom: 30 }}>{children}</Text>;
}

export function Body({ children }) {
  return <Text style={{ fontSize: 14, paddingVertical: 10 }}>{children}</Text>;
}

export function Page({ children }) {
  return (
    <ScrollView>
      <View style={{ flex: 1, padding: 40 }}>{children}</View>
    </ScrollView>
  );
}

export function List({ children }) {
  return <View style={{ flex: 1, marginVertical: 10 }}>{children}</View>;
}

export function ListItem({ children }) {
  return (
    <View style={{}}>
      <Text style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 5 }}>
        {children}
      </Text>
      <Text
        style={{ position: 'absolute', left: 5, top: 5 }}
        selectable={false}
      >
        •
      </Text>
    </View>
  );
}
