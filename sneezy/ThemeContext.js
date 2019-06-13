import React from "react";

export const theme = {
  colors: {
    primary: "#005151",
    secondary: "",
    white: "#fff",
    lightGrey: "#F8F8F8",
    border: "rgba(0,0,0,0.1)"
  },
  fonts: {
    Maax: "Maax",
    MaaxBold: "Maax-Bold",
    Lora: "Lora"
  }
};

export const ThemeContext = React.createContext(theme);
