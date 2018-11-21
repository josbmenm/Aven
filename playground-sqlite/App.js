import { View, Text } from "react-native";
import React, { useContext } from "react";
import Admin from "../aven-admin/Admin";

const App = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <Admin navigation={navigation} />
    </View>
  );
};

App.router = Admin.router;

export default App;
