import React from 'react';
import { ScrollView, SafeAreaView } from '@rn';

export default function Screen({ children }) {
  return (
    <ScrollView>
      <SafeAreaView>{children}</SafeAreaView>
    </ScrollView>
  );
}
