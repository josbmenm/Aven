import React from "react";
import { View, Text } from "react-native";
import Container from "./Container";
import { Link, Button } from "./Buttons";

export default function MainMenu() {
  return (
    <View
      style={{
        paddingVertical: 38
      }}
    >
      <Container>
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row"
          }}
        >
          {/* Logo */}
          <View
            style={{
              width: 84,
              height: 64,
              backgroundColor: "#005151",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text>LOGO IMAGE</Text>
          </View>
          {/* Menu Items */}
          <View
            style={{
              alignItems: "flex-end",
              flexDirection: "row"
            }}
          >
            <Link>menu</Link>
            <Link active>schedule</Link>
            <Link>our story</Link>
            <Button
              outline
              text="book with us"
              type="outline"
              textStyle={{ fontSize: 20 }}
            />
          </View>
        </View>
      </Container>
    </View>
  );
}
