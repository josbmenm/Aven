import React from 'react';
import { View, ScrollView } from '@rn';

export default function Screen({ children }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f9' }}>
      <ScrollView
        style={{
          alignSelf: 'center',
          flex: 1,
          maxWidth: 500,
          backgroundColor: 'white',
          shadowOffset: { width: 0, height: 0 },
          shadowColor: 'black',
          shadowOpacity: 0.08,
          shadowRadius: 22,
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
