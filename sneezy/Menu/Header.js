import React from "react";
import { View } from "react-native";
import MainMenu from "../MainMenu";
import GenericHeroHeader from "../GenericHeroHeader";

export default function HeroHeader() {
  return (
    <View style={{ flex: 1, paddingBottom: 38 }}>
      <MainMenu />
      <GenericHeroHeader
        title="Our Blends"
        bodyText="All of our blends are designed thoughfully to provide you. with a
        healthy, balanced, and nutritious meal. All our drinks are made with
        100% organic ingredients, and are guaranteed to make you feel great."
      />
    </View>
  );
}
