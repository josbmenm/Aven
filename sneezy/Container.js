import React from "react";
import { View } from "react-native";

const Container = ({ children, style = {} }) => (
  <View
    style={{
      width: "90%",
      maxWidth: 1280,
      alignItems: "stretch",
      alignSelf: "center",
      ...style
    }}
  >
    {children}
  </View>
);

export default Container;
