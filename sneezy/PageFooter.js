import React from "react";
import { View, Text, StyleSheet } from "react-native-web";
import Container from "./Container";
import { useTheme } from "./ThemeContext";
import OnoBlendsLogo from "./OnoBlendsLogo";
import OnoFoodLogo from "./OnoFoodLogo";

export default function PageFooter() {
  const { colors, fonts } = useTheme();
  return (
    <View>
      <Container
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingVertical: 100,
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingRight: 20
          }}
        >
          <OnoBlendsLogo width={80} style={{ marginRight: 20 }} />
          <OnoFoodLogo style={{ marginRight: 52 }} />
          <Text
            style={{
              color: colors.primary,
              fontSize: 11,
              fontFamily: fonts.Maax
            }}
          >
            © Copyright 2018 Ono Food Co. All Rights Reserved
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 20,
            backgroundColor: "red"
          }}
        >
          <Text>FOOTER MENU</Text>
        </View>
      </Container>
    </View>
  );
}
