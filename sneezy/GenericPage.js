import React from "react";
import { View, Text } from "react-native-web";

export default ({ children }) => (
  <View style={{ width: "100%", overflowX: 'hidden' }}>{children}</View>
);
