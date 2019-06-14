import React from "react";
import { View, Text, Image } from "react-native";
import MainMenu from "../MainMenu";
import Container from "../Container";
import { Button } from "../Buttons";
import { useTheme } from "../ThemeContext";

function HeaderContent() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.lightGrey,
        alignItems: "center"
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 40,
          paddingVertical: 120,
          maxWidth: 720
        }}
      >
        <Text style={theme.textStyles.heading}>
          Our Blends
        </Text>
        <Text style={{ ...theme.textStyles.body, textAlign: 'center' }}>
          All of our blends are designed thoughfully to provide you. with a
          healthy, balanced, and nutritious meal. All our drinks are made with
          100% organic ingredients, and are guaranteed to make you feel great.
        </Text>
      </View>
    </View>
  );
}

export default function HeroHeader() {
  return (
    <View style={{ flex: 1, paddingBottom: 38 }}>
      <MainMenu />
      <View
        style={{
          flex: 1
        }}
      >
        <Container
          style={{
            flex: 1,
            flexDirection: "column"
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row"
            }}
          >
            <HeaderContent />
          </View>
        </Container>
      </View>
    </View>
  );
}
