import { View, Text } from "react-native";
import React, { useContext } from "react";
import CloudContext from "../aven-cloud/CloudContext";

const App = ({ env }) => {
  const cloud = useContext(CloudContext);
  const test = cloud.getRef("TestRef");
  debugger;
  return (
    <View style={{ flex: 1 }}>
      <Text
        onPress={() => {
          alert("Hello, client code!");
        }}
      >
        Aven Web. Env: {env}
      </Text>
    </View>
  );
};

export default App;
