import React from "react";
import { View, Text } from "react-native";
import MainMenu from "../MainMenu";
import Container from "../Container";

export default function HeroHeader() {
  return (
    <View style={{ flex: 1, height: "100vh", paddingBottom: 38 }}>
      <MainMenu />
      <View
        style={{
          flex: 1,
          alignItems: "stretch"
        }}
      >
        <Container
          style={{
            flex: 1,
            backgroundColor: "red",
            flexDirection: "column",
            alignItems: "stretch"
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "stretch",
              backgroundColor: "peru"
            }}
          >
            <View
              style={{ flex: 1, backgroundColor: "#F8F8F8", height: "100%" }}
            >
              <Text>HERO CONTENT</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "white" }}>
              <Text>HERO IMAGE</Text>
            </View>
          </View>
        </Container>
      </View>
    </View>
  );
}
