import React from "react";
import { View, Text } from "react-native-web";

export function Button({ style, text = "button", onPress, ...rest }) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 4,
        borderWidth: 3,
        borderColor: "#005151",
        ...style
      }}
    >
      <Text style={{ color: "#005151" }}>{text}</Text>
    </View>
  );
}

export function Link({ style, active = false, children, onPress, ...rest }) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 4,
        borderBottomWidth: 3,
        borderColor: active ? "#005151" : "transparent",
        ...style
      }}
    >
      <Text style={{ color: "#005151" }}>{children}</Text>
    </View>
  );
}
