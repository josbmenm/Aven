import { View } from 'react-native';
import React from 'react';
import Admin from '../aven-admin/Admin';

const App = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <Admin navigation={navigation} />
    </View>
  );
};

App.router = Admin.router;

export default App;
