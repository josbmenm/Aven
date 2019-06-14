import React from "react";
import { View, Image } from "react-native";
import Container from "./Container";

export default function HeroHeader({ source }) {
  return (
    <View style={{ flex: 1, height: "100vh", paddingVertical: 38 }}>
      <View
        style={{
          flex: 1,
          alignItems: "stretch"
        }}
      >
        <Container
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "stretch"
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "stretch"
            }}
          >
            <View style={{ flex: 1 }}>
              <Image
                source={source}
                resizeMode="cover"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </Container>
      </View>
    </View>
  );
}
