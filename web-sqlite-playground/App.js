import { View, Text } from "react-native";
import React, { useContext } from "react";
import Admin from "../aven-admin/Admin";

const App = ({ env }) => {
  return (
    <View style={{ flex: 1 }}>
      <Admin />
    </View>
  );
};

export default App;
