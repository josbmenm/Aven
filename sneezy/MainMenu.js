import React from "react";
import { View, Text } from "react-native";
import Container from "./Container";
import { Link, Button } from "./Buttons";

const menuItemStyle = {
  fontSize: 20,
  fontWeight: "bold",
  fontFamily: "Maax-Bold"
};

function MenuLink({ onPress, children, ...rest }) {
  return (
    <Link onPress={onPress} style={menuItemStyle} {...rest}>
      {children}
    </Link>
  );
}

function MenuButton({ text, onPress, children, ...rest }) {
  return (
    <Button text={text} onPress={onPress} style={menuItemStyle} {...rest} />
  );
}

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
            <MenuLink>menu</MenuLink>
            <MenuLink>schedule</MenuLink>
            <MenuLink>our story</MenuLink>
            <MenuButton text="book with us" />
          </View>
        </View>
      </Container>
    </View>
  );
}
