import { View, Text } from 'react-native';
import React from 'react';

// const { Controller, Tag, EthernetIP } = require('ethernet-ip');
// const { INT, BOOL } = EthernetIP.CIP.DataTypes.Types;
// const PLC = new Controller();

const App = ({ env }) => {
  return (
    <View style={{ flex: 1 }}>
      <Text
        onPress={() => {
          alert('hello');
        }}
      >
        Ono Kitchen Server2
      </Text>
    </View>
  );
};

export default App;
