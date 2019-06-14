import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemeContext, useTheme } from "./ThemeContext";

export const defaultButtonStyles = {
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  text: {
    fontSize: 20
  }
};

export function Button({
  buttonStyle,
  text = "button",
  onPress,
  type = "solid", // solid | outline
  variant = "primary", // primary | secondary
  textStyle = {},
  ...rest
}) {
  const { colors, fonts } = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          ...defaultButtonStyles.button,
          borderRadius: 4,
          borderWidth: 3,
          borderColor: colors.primary,
          backgroundColor: type === "solid" ? colors.primary : "transparent",
          ...buttonStyle,
          cursor: "pointer"
        }}
      >
        <Text
          style={{
            ...defaultButtonStyles.text,
            color: type === "solid" ? colors.white : colors.primary,
            ...textStyle,
            fontFamily: fonts.button
          }}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function Link({
  buttonStyle = {},
  textStyle = {},
  active = false,
  text,
  onPress,
  ...rest
}) {
  const { colors, fonts } = useTheme();

return ( 
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderBottomWidth: 3,
          borderColor: active ? colors.primary : "transparent",
          ...buttonStyle
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            fontFamily: fonts.button,
            color: colors.primary,
            ...textStyle
          }}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
