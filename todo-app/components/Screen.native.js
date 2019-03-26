import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';

export default function Screen({ children }) {
  return (
    <ScrollView>
      <SafeAreaView>{children}</SafeAreaView>
    </ScrollView>
  );
}
