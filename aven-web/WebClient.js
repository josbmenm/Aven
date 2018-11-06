import React from "react";

// this will actually resolve to react-native-web... *eyeroll*
import { AppRegistry } from "react-native";

import { createBrowserApp } from "@react-navigation/web";

const emptyMap = new Map();

export default function startWebClient(App, context = emptyMap) {
  const AppWithNavigation = App.router ? createBrowserApp(App) : App;

  function AppWithContext(props) {
    let el = <AppWithNavigation {...props} />;
    context.forEach((value, C) => {
      el = <C.Provider value={value}>{el}</C.Provider>;
    });
    return el;
  }

  AppRegistry.registerComponent("App", () => AppWithContext);

  AppRegistry.runApplication("App", {
    initialProps: {
      env: "browser"
    },
    rootTag: document.getElementById("root")
  });
}
