const fs = require("fs-extra");
const babel = require("babel-core");
const presetReact = require("babel-preset-react");
const restSpread = require("babel-plugin-transform-object-rest-spread");
const pathJoin = require("path").join;
const {
  identifier,
  importSpecifier,
  importDefaultSpecifier,
  expressionStatement,
  nullLiteral
} = require("babel-types");

const makeIndex = (fileName, defaultExports, normalExports) => {
  return {
    toFile: fileName,
    fromRaw: `
module.exports = {
${defaultExports
      .map(anExport => {
        if (anExport.exports) {
          return anExport.exports
            .map(
              innerExportName => `
get ${innerExportName}() {
  return require('${anExport.moduleAlias}').${innerExportName};
},`
            )
            .join("\n");
        }

        return `
get ${anExport}() {
  return require('./${anExport}').default;
},
`;
      })
      .join("")}
      ${(normalExports || [])
        .map(
          exportName => `
  get ${exportName}() {
    return require('./${exportName}');
  },
  `
        )
        .join("")}
}
`
  };
};

const baseDir = ".";

const transforms = [
  { makeDirectory: baseDir + "/react-navigation-core" },
  {
    fromRawJSON: {
      name: "@react-navigation/core"
    },
    toFile: baseDir + "/react-navigation-core/package.json"
  },
  makeIndex(
    baseDir + "/react-navigation-core/index.js",
    [
      "createNavigator",

      "NavigationActions",
      "StackActions",

      "StackRouter",
      "SwitchRouter",
      "TabRouter",

      "NavigationContext",
      "NavigationProvider",
      "NavigationConsumer",
      "getNavigationActionCreators",
      "getNavigation",

      "SceneView",
      "SwitchView",
      "createSwitchNavigator",
      "withNavigation"
    ],
    ["invariant"]
  ),
  {
    fromFile: "node_modules/react-navigation/src/navigators/createNavigator.js",
    toFile: baseDir + "/react-navigation-core/createNavigator.js",
    importMap: {
      "../getChildEventSubscriber": "./getChildEventSubscriber"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/routers/createConfigGetter.js",
    toFile: baseDir + "/react-navigation-core/createConfigGetter.js",
    importMap: {
      "../utils/invariant": "./invariant"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/routers/pathUtils.js",
    toFile: baseDir + "/react-navigation-core/pathUtils.js",
    importMap: {
      "../NavigationActions": "./NavigationActions",
      "../utils/invariant": "./invariant"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/utils/withDefaultValue.js",
    toFile: baseDir + "/react-navigation-core/withDefaultValue.js"
  },
  {
    fromFile: "node_modules/react-navigation/src/StateUtils.js",
    toFile: baseDir + "/react-navigation-core/StateUtils.js",
    importMap: {
      "./utils/invariant": "./invariant"
    }
  },
  {
    fromFile:
      "node_modules/react-navigation/src/routers/validateRouteConfigMap.js",
    toFile: baseDir + "/react-navigation-core/validateRouteConfigMap.js",
    importMap: {
      "../utils/invariant": "./invariant"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/routers/SwitchRouter.js",
    toFile: baseDir + "/react-navigation-core/SwitchRouter.js",
    importMap: {
      "../utils/invariant": "./invariant",
      "../NavigationActions": "./NavigationActions"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/views/NavigationContext.js",
    toFile: baseDir + "/react-navigation-core/NavigationContext.js",
    importMap: {}
  },
  {
    fromFile: "node_modules/react-navigation/src/views/NavigationProvider.js",
    toFile: baseDir + "/react-navigation-core/NavigationProvider.js",
    importMap: {}
  },
  {
    fromFile: "node_modules/react-navigation/src/views/NavigationConsumer.js",
    toFile: baseDir + "/react-navigation-core/NavigationConsumer.js",
    importMap: {}
  },
  {
    fromFile: "node_modules/react-navigation/src/views/SceneView.js",
    toFile: baseDir + "/react-navigation-core/SceneView.js",
    importMap: {}
  },
  {
    fromFile: "node_modules/react-navigation/src/routers/KeyGenerator.js",
    toFile: baseDir + "/react-navigation-core/KeyGenerator.js",
    importMap: {}
  },
  {
    fromFile:
      "node_modules/react-navigation/src/views/SwitchView/SwitchView.js",
    toFile: baseDir + "/react-navigation-core/SwitchView.js",
    importMap: {
      "../SceneView": "./SceneView"
    }
  },

  {
    fromFile:
      "node_modules/react-navigation/src/navigators/createSwitchNavigator.js",
    toFile: baseDir + "/react-navigation-core/createSwitchNavigator.js",
    importMap: {
      "../navigators/createNavigator": "./createNavigator",
      "../routers/SwitchRouter": "./SwitchRouter",
      "../views/SwitchView/SwitchView": "./SwitchView"
    }
  },
  {
    fromFile:
      "node_modules/react-navigation/src/navigators/createSwitchNavigator.js",
    toFile: baseDir + "/react-navigation-core/createSwitchNavigator.js",
    importMap: {
      "../navigators/createNavigator": "./createNavigator",
      "../routers/SwitchRouter": "./SwitchRouter",
      "../views/SwitchView/SwitchView": "./SwitchView"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/routers/TabRouter.js",
    toFile: baseDir + "/react-navigation-core/TabRouter.js",
    importMap: {
      "../utils/withDefaultValue": "./withDefaultValue"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/routers/StackRouter.js",
    toFile: baseDir + "/react-navigation-core/StackRouter.js",
    importMap: {
      "../NavigationActions": "./NavigationActions",
      "../utils/invariant": "./invariant",
      "../StateUtils": "./StateUtils"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/NavigationActions.js",
    toFile: baseDir + "/react-navigation-core/NavigationActions.js",
    importMap: {}
  },
  {
    fromFile: "node_modules/react-navigation/src/routers/StackActions.js",
    toFile: baseDir + "/react-navigation-core/StackActions.js",
    importMap: {}
  },
  {
    fromFile:
      "node_modules/react-navigation/src/routers/getNavigationActionCreators.js",
    toFile: baseDir + "/react-navigation-core/getNavigationActionCreators.js",
    importMap: {
      "../utils/invariant": "./invariant",
      "../NavigationActions": "./NavigationActions"
    }
  },
  {
    fromFile:
      "node_modules/react-navigation/src/routers/validateScreenOptions.js",
    toFile: baseDir + "/react-navigation-core/validateScreenOptions.js",
    importMap: {
      "../utils/invariant": "./invariant"
    }
  },
  {
    fromFile:
      "node_modules/react-navigation/src/routers/getScreenForRouteName.js",
    toFile: baseDir + "/react-navigation-core/getScreenForRouteName.js",
    importMap: { "../utils/invariant": "./invariant" }
  },
  {
    fromFile: "node_modules/react-navigation/src/getNavigation.js",
    toFile: baseDir + "/react-navigation-core/getNavigation.js",
    importMap: {
      "./routers/getNavigationActionCreators": "./getNavigationActionCreators"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/getChildNavigation.js",
    toFile: baseDir + "/react-navigation-core/getChildNavigation.js",
    importMap: {
      "./utils/invariant": "./invariant",
      "./routers/getNavigationActionCreators": "./getNavigationActionCreators"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/getChildRouter.js",
    toFile: baseDir + "/react-navigation-core/getChildRouter.js"
  },
  {
    fromFile: "node_modules/react-navigation/src/utils/invariant.js",
    toFile: baseDir + "/react-navigation-core/invariant.js"
  },
  {
    fromFile: "node_modules/react-navigation/src/getChildEventSubscriber.js",
    toFile: baseDir + "/react-navigation-core/getChildEventSubscriber.js"
  },
  { makeDirectory: baseDir + "/react-navigation-native-container" },
  {
    toFile: baseDir + "/react-navigation-native-container/package.json",
    fromRawJSON: {
      name: "@react-navigation/native-container"
    }
  },
  makeIndex(baseDir + "/react-navigation-native-container/index.js", [
    "createNavigationContainer"
  ]),
  {
    fromFile: "node_modules/react-navigation/src/utils/docsUrl.js",
    toFile: baseDir + "/react-navigation-native-container/docsUrl.js",
    importMap: {
      "./utils/docsUrl": "./docsUrl"
    }
  },

  {
    fromFile: "node_modules/react-navigation/src/routers/pathUtils.js",
    toFile: baseDir + "/react-navigation-native-container/pathUtils.js",
    importMap: {
      "../NavigationActions": "../react-navigation-core"
    },
    nonDefaultImportMap: {
      "../utils/invariant": "../react-navigation-core"
    }
  },
  {
    fromFile: "node_modules/react-navigation/src/createNavigationContainer.js",
    toFile:
      baseDir +
      "/react-navigation-native-container/createNavigationContainer.js",
    importMap: {
      "./utils/docsUrl": "./docsUrl",
      "./routers/pathUtils": "./pathUtils"
    },
    nonDefaultImportMap: {
      "./getNavigation": "../react-navigation-core",
      "./createChildNavigationGetter": "../react-navigation-core",
      "./utils/invariant": "../react-navigation-core",
      "./routers/getNavigationActionCreators": "../react-navigation-core",
      "./NavigationActions": "../react-navigation-core"
    }
  },

  { makeDirectory: baseDir + "/react-navigation-stack" },

  {
    toFile: baseDir + "/react-navigation-stack/package.json",
    fromRawJSON: {
      name: "@react-navigation/stack"
    }
  },
  // makeIndex(baseDir + "/react-navigation-stack/index.js", [
  //   "createStackNavigator",
  //   "StackView",
  //   "Header",
  //   "Transitioner"
  // ]),
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/navigators/createStackNavigator.js",
  //   toFile: baseDir + "/react-navigation-stack/createStackNavigator.js",
  //   importMap: {
  //     "../views/StackView/StackView": "./StackView"
  //   },
  //   nonDefaultImportMap: {
  //     "./createNavigator": "../react-navigation-core",
  //     "../routers/StackRouter": "../react-navigation-core"
  //   }
  // },
  {
    fromFile: "node_modules/react-navigation/src/views/withNavigation.js",
    toFile: baseDir + "/react-navigation-core/withNavigation.js",
    importMap: {
      "../utils/invariant": "./invariant"
    },
    nonDefaultImportMap: {}
  },
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/navigators/createKeyboardAwareNavigator.js",
  //   toFile: baseDir + "/react-navigation-stack/createKeyboardAwareNavigator.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile: "node_modules/react-navigation/src/views/StackView/StackView.js",
  //   toFile: baseDir + "/react-navigation-stack/StackView.js",
  //   importMap: {
  //     "../Transitioner": "./Transitioner"
  //   },
  //   nonDefaultImportMap: {
  //     "../../NavigationActions": "../react-navigation-core",
  //     "../../routers/StackActions": "../react-navigation-core"
  //   }
  // },

  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/views/StackView/StackViewTransitionConfigs.js",
  //   toFile: baseDir + "/react-navigation-stack/StackViewTransitionConfigs.js",
  //   importMap: {
  //     "../../utils/ReactNativeFeatures": "./ReactNativeFeatures"
  //   },
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/views/StackView/StackViewStyleInterpolator.js",
  //   toFile: baseDir + "/react-navigation-stack/StackViewStyleInterpolator.js",
  //   importMap: {
  //     "../../utils/getSceneIndicesForInterpolationInputRange":
  //       "./getSceneIndicesForInterpolationInputRange"
  //   },
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/utils/getSceneIndicesForInterpolationInputRange.js",
  //   toFile:
  //     baseDir +
  //     "/react-navigation-stack/getSceneIndicesForInterpolationInputRange.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile: "node_modules/react-navigation/src/utils/ReactNativeFeatures.js",
  //   toFile: baseDir + "/react-navigation-stack/ReactNativeFeatures.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile: "node_modules/react-navigation/src/views/Transitioner.js",
  //   toFile: baseDir + "/react-navigation-stack/Transitioner.js",
  //   importMap: {},
  //   nonDefaultImportMap: {
  //     "../utils/invariant": "../react-navigation-core"
  //   }
  // },
  // {
  //   fromFile: "node_modules/react-navigation/src/views/ScenesReducer.js",
  //   toFile: baseDir + "/react-navigation-stack/ScenesReducer.js",
  //   importMap: {
  //     "../utils/shallowEqual": "./shallowEqual"
  //   },
  //   nonDefaultImportMap: {
  //     "../utils/invariant": "../react-navigation-core"
  //   }
  // },
  // {
  //   fromFile: "node_modules/react-navigation/src/utils/shallowEqual.js",
  //   toFile: baseDir + "/react-navigation-stack/shallowEqual.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/views/StackView/StackViewLayout.js",
  //   toFile: baseDir + "/react-navigation-stack/StackViewLayout.js",
  //   importMap: {
  //     "../Header/Header": "./Header"
  //   },
  //   nonDefaultImportMap: {
  //     "./withNavigation": "../react-navigation-core",
  //     "./withOrientation": "../react-navigation-area-view",
  //     "../withOrientation": "../react-navigation-area-view",
  //     "../../NavigationActions": "../react-navigation-core",
  //     "../NavigationContext": "../react-navigation-core",
  //     "../SceneView": "../react-navigation-core",
  //     "../../routers/StackActions": "../react-navigation-core",
  //     "../../utils/ReactNativeFeatures": "./ReactNativeFeatures"
  //   }
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/views/StackView/StackViewCard.js",
  //   toFile: baseDir + "/react-navigation-stack/StackViewCard.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/views/StackView/createPointerEventsContainer.js",
  //   toFile: baseDir + "/react-navigation-stack/createPointerEventsContainer.js",
  //   importMap: {
  //     "../AnimatedValueSubscription": "./AnimatedValueSubscription"
  //   },
  //   nonDefaultImportMap: {
  //     "../../utils/invariant": "../react-navigation-core"
  //   }
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/views/AnimatedValueSubscription.js",
  //   toFile: baseDir + "/react-navigation-stack/AnimatedValueSubscription.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile: "node_modules/react-navigation/src/views/Header/Header.js",
  //   toFile: baseDir + "/react-navigation-stack/Header.js",
  //   importMap: {},
  //   nonDefaultImportMap: {
  //     "../withOrientation": "../react-navigation-area-view",
  //     "react-native-safe-area-view": "../react-navigation-area-view"
  //   },
  //   requireMap: {
  //     "../assets/back-icon-mask.png": "./assets/back-icon-mask.png"
  //   }
  // },
  // {
  //   fromFile: "node_modules/react-navigation/src/views/Header/HeaderTitle.js",
  //   toFile: baseDir + "/react-navigation-stack/HeaderTitle.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/views/Header/HeaderBackButton.js",
  //   toFile: baseDir + "/react-navigation-stack/HeaderBackButton.js",
  //   importMap: {
  //     "../TouchableItem": "./TouchableItem"
  //   },
  //   requireMap: {
  //     "../assets/back-icon.png": "./assets/back-icon.png"
  //   },
  //   nonDefaultImportMap: {}
  // },

  // {
  //   fromFile: "node_modules/react-navigation/src/views/TouchableItem.js",
  //   toFile: baseDir + "/react-navigation-stack/TouchableItem.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },

  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/views/Header/ModularHeaderBackButton.js",
  //   toFile: baseDir + "/react-navigation-stack/ModularHeaderBackButton.js",
  //   importMap: {
  //     "../TouchableItem": "./TouchableItem"
  //   },
  //   requireMap: {
  //     "../assets/back-icon.png": "./assets/back-icon.png"
  //   },
  //   nonDefaultImportMap: {}
  // },
  // {
  //   copyDirectory: "node_modules/react-navigation/src/views/assets",
  //   toDirectory: baseDir + "/react-navigation-stack/assets"
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation/src/views/Header/HeaderStyleInterpolator.js",
  //   toFile: baseDir + "/react-navigation-stack/HeaderStyleInterpolator.js",
  //   importMap: {
  //     "../../utils/getSceneIndicesForInterpolationInputRange":
  //       "./getSceneIndicesForInterpolationInputRange"
  //   },
  //   nonDefaultImportMap: {}
  // },

  { makeDirectory: baseDir + "/react-navigation-area-view" },
  {
    toFile: baseDir + "/react-navigation-area-view/package.json",
    fromRawJSON: {
      name: "@react-navigation/area-view"
    }
  },
  makeIndex(baseDir + "/react-navigation-area-view/index.js", [
    "SafeAreaView",
    "withOrientation"
  ]),
  {
    fromFile: "node_modules/react-native-safe-area-view/index.js",
    toFile: baseDir + "/react-navigation-area-view/SafeAreaView.js",
    importMap: {},
    nonDefaultImportMap: {}
  },
  {
    fromFile: "node_modules/react-navigation/src/views/withOrientation.js",
    toFile: baseDir + "/react-navigation-area-view/withOrientation.js"
  },

  { makeDirectory: baseDir + "/react-navigation-tabs" },
  {
    toFile: baseDir + "/react-navigation-tabs/package.json",
    fromRawJSON: {
      name: "@react-navigation/tabs"
    }
  },
  makeIndex(baseDir + "/react-navigation-tabs/index.js", [
    "createBottomTabNavigator"
  ]),
  {
    fromFile:
      "node_modules/react-navigation-tabs/src/navigators/createBottomTabNavigator.js",
    toFile: baseDir + "/react-navigation-tabs/createBottomTabNavigator.js",
    importMap: {
      "../utils/createTabNavigator": "./createTabNavigator",
      "../views/BottomTabBar": "./BottomTabBar",
      "../views/ResourceSavingScene": "./ResourceSavingScene"
    },
    nonDefaultImportMap: {}
  },
  {
    fromFile:
      "node_modules/react-navigation-tabs/src/utils/createTabNavigator.js",
    toFile: baseDir + "/react-navigation-tabs/createTabNavigator.js",
    importMap: {
      "react-navigation": "../react-navigation-core"
    },
    nonDefaultImportMap: {}
  },
  {
    fromFile: "node_modules/react-navigation-tabs/src/utils/withDimensions.js",
    toFile: baseDir + "/react-navigation-tabs/withDimensions.js",
    importMap: {},
    nonDefaultImportMap: {}
  },
  {
    fromFile: "node_modules/react-navigation-tabs/src/views/BottomTabBar.js",
    toFile: baseDir + "/react-navigation-tabs/BottomTabBar.js",
    importMap: {
      "../utils/withDimensions": "./withDimensions"
    },
    nonDefaultImportMap: {
      "react-native-safe-area-view": "../react-navigation-area-view"
    }
  },
  {
    fromFile:
      "node_modules/react-navigation-tabs/src/views/ResourceSavingScene.js",
    toFile: baseDir + "/react-navigation-tabs/ResourceSavingScene.js",
    importMap: {},
    nonDefaultImportMap: {}
  },
  {
    fromFile: "node_modules/react-navigation-tabs/src/views/CrossFadeIcon.js",
    toFile: baseDir + "/react-navigation-tabs/CrossFadeIcon.js",
    importMap: {},
    nonDefaultImportMap: {}
  },

  { makeDirectory: baseDir + "/react-navigation-native-icons" },
  {
    toFile: baseDir + "/react-navigation-native-icons/package.json",
    fromRawJSON: {
      name: "@react-navigation/native-icons"
    }
  },
  makeIndex(baseDir + "/react-navigation-native-icons/index.js", ["Ionicons"]),
  {
    fromFile: "node_modules/@expo/vector-icons/Ionicons.js",
    toFile: baseDir + "/react-navigation-native-icons/Ionicons.js",
    importMap: {
      "./vendor/react-native-vector-icons/glyphmaps/Ionicons.json":
        "./glyphmaps/Ionicons.json"
    },
    nonDefaultImportMap: {}
  },

  {
    copyDirectory: "node_modules/react-native-vector-icons/Fonts",
    toDirectory: "public/fonts"
  },
  {
    copyDirectory: "node_modules/react-native-vector-icons/dist/glyphmaps",
    toDirectory: baseDir + "/react-navigation-icons/glyphmaps"
  },
  {
    copyDirectory:
      "node_modules/@expo/vector-icons/vendor/react-native-vector-icons/glyphmaps",
    toDirectory: baseDir + "/react-navigation-native-icons/glyphmaps"
  },
  {
    copyDirectory:
      "node_modules/@expo/vector-icons/vendor/react-native-vector-icons/lib",
    toDirectory: baseDir + "/react-navigation-native-icons/vector-icons-lib"
  },
  {
    fromFile: "node_modules/@expo/vector-icons/createIconSet.js",
    toFile: baseDir + "/react-navigation-native-icons/createIconSet.js",
    importMap: {
      "./vendor/react-native-vector-icons/lib/create-icon-set":
        "./vector-icons-lib/create-icon-set",
      "./vendor/react-native-vector-icons/lib/icon-button":
        "./vector-icons-lib/icon-button"
    },
    nonDefaultImportMap: {}
  },

  {
    fromFile: "node_modules/react-native-vector-icons/lib/tab-bar-item-ios.js",
    toFile: baseDir + "/react-navigation-icons/tab-bar-item-ios.js",
    importMap: {
      "./react-native": "react-native"
    },
    nonDefaultImportMap: {}
  },

  {
    fromFile: "node_modules/react-native-vector-icons/lib/icon-button.js",
    toFile: baseDir + "/react-navigation-icons/icon-button.js",
    importMap: {
      "./react-native": "react-native"
    },
    nonDefaultImportMap: {}
  },

  {
    fromFile: "node_modules/react-native-vector-icons/lib/toolbar-android.js",
    toFile: baseDir + "/react-navigation-icons/toolbar-android.js",
    importMap: {
      "./react-native": "react-native"
    },
    nonDefaultImportMap: {}
  }

  // { makeDirectory: baseDir + "/react-navigation-fluid" },
  // {
  //   toFile: baseDir + "/react-navigation-fluid/package.json",
  //   fromRawJSON: {
  //     name: "@react-navigation/fluid"
  //   }
  // },
  // makeIndex(baseDir + "/react-navigation-fluid/index.js", [
  //   "createFluidNavigator",
  //   "TransitionView"
  // ]),
  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/FluidNavigator.js",
  //   toFile: baseDir + "/react-navigation-fluid/createFluidNavigator.js",
  //   importMap: {
  //     "react-navigation": "../react-navigation-core"
  //   },
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/FluidTransitioner.js",
  //   toFile: baseDir + "/react-navigation-fluid/FluidTransitioner.js",
  //   importMap: {
  //     "react-navigation": "../react-navigation-stack"
  //   },
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/NavigationActions.js",
  //   toFile: baseDir + "/react-navigation-fluid/NavigationActions.js",
  //   importMap: {
  //     "react-navigation": "../react-navigation-core"
  //   },
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/TransitionView.js",
  //   toFile: baseDir + "/react-navigation-fluid/TransitionView.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/TransitionItemsView.js",
  //   toFile: baseDir + "/react-navigation-fluid/TransitionItemsView.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/TransitionRouteView.js",
  //   toFile: baseDir + "/react-navigation-fluid/TransitionRouteView.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },

  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/TransitionOverlayView.js",
  //   toFile: baseDir + "/react-navigation-fluid/TransitionOverlayView.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/TransitionItems.js",
  //   toFile: baseDir + "/react-navigation-fluid/TransitionItems.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/TransitionItem.js",
  //   toFile: baseDir + "/react-navigation-fluid/TransitionItem.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // {
  //   copyDirectory: "node_modules/react-navigation-fluid-transitions/src/Types",
  //   toDirectory: baseDir + "/react-navigation-fluid/Types"
  // },
  // {
  //   copyDirectory:
  //     "node_modules/react-navigation-fluid-transitions/src/Interpolators",
  //   toDirectory: baseDir + "/react-navigation-fluid/Interpolators"
  // },

  // {
  //   copyDirectory:
  //     "node_modules/react-navigation-fluid-transitions/src/Transitions",
  //   toDirectory: baseDir + "/react-navigation-fluid/Transitions"
  // },

  // {
  //   copyDirectory: "node_modules/react-navigation-fluid-transitions/src/Utils",
  //   toDirectory: baseDir + "/react-navigation-fluid/Utils"
  // },
  // {
  //   fromFile:
  //     "node_modules/react-navigation-fluid-transitions/src/TransitionConstants.js",
  //   toFile: baseDir + "/react-navigation-fluid/TransitionConstants.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // },
  // { makeDirectory: baseDir + "/react-navigation-transitioner" },
  // makeIndex(baseDir + "/react-navigation-transitioner/index.js", [
  //   "Transitioner"
  // ]),
  // {
  //   fromFile: "node_modules/react-navigation-transitioner/Transitioner.js",
  //   toFile: baseDir + "/react-navigation-transitioner/Transitioner.js",
  //   importMap: {
  //     "@react-navigation/core": "../react-navigation-core"
  //   },
  //   nonDefaultImportMap: {}
  // },
  // {
  //   fromFile: "node_modules/react-navigation-transitioner/Animators.js",
  //   toFile: baseDir + "/react-navigation-transitioner/Animators.js",
  //   importMap: {},
  //   nonDefaultImportMap: {}
  // }
];

transforms.forEach(t => {
  let fileData = t.fromRaw;

  if (t.copyDirectory) {
    fs.copySync(t.copyDirectory, t.toDirectory);
    if (t.exclude) {
      t.exclude.forEach(excludePath => {
        fs.removeSync(pathJoin(t.toDirectory, excludePath));
      });
    }
    return;
  }

  if (t.fromRawJSON) {
    fileData = JSON.stringify(t.fromRawJSON, null, 2);
  }

  if (t.makeDirectory) {
    try {
      fs.mkdirSync(t.makeDirectory);
    } catch (e) {}
  }

  if (t.fromFile) {
    fileData = fs.readFileSync(t.fromFile, { encoding: "utf8" });
    fileData = fileData.replace(/__DEV__/, 'process.env === "development"');
  }

  if (t.importMap) {
    const handledBabel = babel.transform(fileData, {
      sourceMaps: true,
      comments: true,
      parserOpts: {
        plugins: ["jsx", "objectRestSpread", "classProperties", "flow"]
      },
      plugins: [
        ({ parse, traverse }) => ({
          visitor: {
            CallExpression(path) {
              if (path.node.callee && path.node.callee.name === "require") {
                if (
                  path.node.arguments.length === 1 &&
                  path.node.arguments[0].value &&
                  t.requireMap &&
                  t.requireMap[path.node.arguments[0].value]
                ) {
                  path.node.arguments[0].value =
                    t.requireMap[path.node.arguments[0].value];
                }
              }
            },
            ImportDeclaration(path) {
              // path.node.specifiers = [
              //   importDefaultSpecifier(identifier('Wat')),
              // ];

              const sourceName = path.node.source.value;
              const importMap = t.importMap || {};
              const nonDefaultImportMap = t.nonDefaultImportMap || {};
              if (importMap[sourceName] === false) {
                path.remove();
              }

              if (importMap[sourceName] || nonDefaultImportMap[sourceName]) {
                if (
                  nonDefaultImportMap[sourceName] &&
                  path.node.specifiers.length === 1 &&
                  path.node.specifiers[0].type === "ImportDefaultSpecifier"
                ) {
                  const local = path.node.specifiers[0].local.name;
                  const imported =
                    path.node.specifiers[0].imported &&
                    path.node.specifiers[0].imported.name;
                  path.node.specifiers = [
                    importSpecifier(
                      identifier(local),
                      identifier(imported || local)
                    )
                  ];
                }

                path.node.source.value =
                  importMap[sourceName] || nonDefaultImportMap[sourceName];
              }
            }
          }
        })
      ]
    });
    fileData = handledBabel.code;
  }

  t.toFile && fileData && fs.writeFileSync(t.toFile, fileData);
});
