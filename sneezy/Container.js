import React from "react";
import { View } from "react-native-web";

const Container = ({ children, style = {} }) => (
  <View
    style={{
      width: "100%",
      alignItems: "center",
      justifyContent: "flex-start",
      ...style
    }}
  >
    <View
      style={{
        width: "90%",
        maxWidth: 1280
      }}
    >
      {children}
    </View>
  </View>
);

export default Container;
