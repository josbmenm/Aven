const fs = require('fs-extra');
const babel = require('babel-core');
const presetReact = require('babel-preset-react');
const restSpread = require('babel-plugin-transform-object-rest-spread');
const {
  identifier,
  importSpecifier,
  importDefaultSpecifier,
  expressionStatement,
  nullLiteral,
} = require('babel-types');

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
},`,
            )
            .join('\n');
        }

        return `
get ${anExport}() {
  return require('./${anExport}').default;
},
`;
      })
      .join('')}
      ${(normalExports || [])
        .map(
          exportName => `
  get ${exportName}() {
    return require('./${exportName}');
  },
  `,
        )
        .join('')}
}
`,
  };
};

const transforms = [
  { makeDirectory: 'src/react-navigation-core' },
  {
    fromRawJSON: {
      name: '@react-navigation/core',
      subdependencies: ['react', 'path-to-regexp', 'create-react-context'],
    },
    toFile: 'src/react-navigation-core/subpackage.json',
  },
  makeIndex(
    'src/react-navigation-core/index.js',
    [
      'createNavigator',

      'NavigationActions',
      'StackActions',
      'DrawerActions',

      'StackRouter',
      'SwitchRouter',
      'TabRouter',
      // 'DrawerRouter',

      'NavigationContext',
      'NavigationProvider',
      'NavigationConsumer',
      'getNavigationActionCreators',
      'createChildNavigationGetter',

      'SceneView',
      'SwitchView',
      'createSwitchNavigator',
    ],
    ['invariant'],
  ),
  {
    fromFile: 'node_modules/react-navigation/src/navigators/createNavigator.js',
    toFile: 'src/react-navigation-core/createNavigator.js',
    importMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/routers/createConfigGetter.js',
    toFile: 'src/react-navigation-core/createConfigGetter.js',
    importMap: {
      '../utils/invariant': './invariant',
    },
  },
  {
    fromFile: 'node_modules/react-navigation/src/utils/withDefaultValue.js',
    toFile: 'src/react-navigation-core/withDefaultValue.js',
  },
  {
    fromFile: 'node_modules/react-navigation/src/StateUtils.js',
    toFile: 'src/react-navigation-core/StateUtils.js',
    importMap: {
      './utils/invariant': './invariant',
    },
  },
  {
    fromFile:
      'node_modules/react-navigation/src/routers/validateRouteConfigMap.js',
    toFile: 'src/react-navigation-core/validateRouteConfigMap.js',
    importMap: {
      '../utils/invariant': './invariant',
    },
  },
  {
    fromFile: 'node_modules/react-navigation/src/routers/SwitchRouter.js',
    toFile: 'src/react-navigation-core/SwitchRouter.js',
    importMap: {
      '../utils/invariant': './invariant',
      '../NavigationActions': './NavigationActions',
    },
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/NavigationContext.js',
    toFile: 'src/react-navigation-core/NavigationContext.js',
    importMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/NavigationProvider.js',
    toFile: 'src/react-navigation-core/NavigationProvider.js',
    importMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/NavigationConsumer.js',
    toFile: 'src/react-navigation-core/NavigationConsumer.js',
    importMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/SceneView.js',
    toFile: 'src/react-navigation-core/SceneView.js',
    importMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/routers/KeyGenerator.js',
    toFile: 'src/react-navigation-core/KeyGenerator.js',
    importMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation/src/views/SwitchView/SwitchView.js',
    toFile: 'src/react-navigation-core/SwitchView.js',
    importMap: {
      '../SceneView': './SceneView',
    },
  },

  {
    fromFile:
      'node_modules/react-navigation/src/navigators/createSwitchNavigator.js',
    toFile: 'src/react-navigation-core/createSwitchNavigator.js',
    importMap: {
      '../navigators/createNavigator': './createNavigator',
      '../routers/SwitchRouter': './SwitchRouter',
      '../views/SwitchView/SwitchView': './SwitchView',
    },
  },
  {
    fromFile:
      'node_modules/react-navigation/src/navigators/createSwitchNavigator.js',
    toFile: 'src/react-navigation-core/createSwitchNavigator.js',
    importMap: {
      '../navigators/createNavigator': './createNavigator',
      '../routers/SwitchRouter': './SwitchRouter',
      '../views/SwitchView/SwitchView': './SwitchView',
    },
  },
  {
    fromFile: 'node_modules/react-navigation/src/routers/TabRouter.js',
    toFile: 'src/react-navigation-core/TabRouter.js',
    importMap: {
      '../utils/withDefaultValue': './withDefaultValue',
    },
  },
  {
    fromFile: 'node_modules/react-navigation/src/routers/StackRouter.js',
    toFile: 'src/react-navigation-core/StackRouter.js',
    importMap: {
      '../NavigationActions': './NavigationActions',
      '../utils/invariant': './invariant',
      '../StateUtils': './StateUtils',
    },
  },
  {
    fromFile: 'node_modules/react-navigation/src/NavigationActions.js',
    toFile: 'src/react-navigation-core/NavigationActions.js',
    importMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/routers/StackActions.js',
    toFile: 'src/react-navigation-core/StackActions.js',
    importMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/routers/DrawerActions.js',
    toFile: 'src/react-navigation-core/DrawerActions.js',
    importMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation/src/routers/getNavigationActionCreators.js',
    toFile: 'src/react-navigation-core/getNavigationActionCreators.js',
    importMap: {
      '../utils/invariant': './invariant',
      '../NavigationActions': './NavigationActions',
    },
  },
  {
    fromFile:
      'node_modules/react-navigation/src/routers/validateScreenOptions.js',
    toFile: 'src/react-navigation-core/validateScreenOptions.js',
    importMap: {
      '../utils/invariant': './invariant',
    },
  },
  {
    fromFile:
      'node_modules/react-navigation/src/routers/getScreenForRouteName.js',
    toFile: 'src/react-navigation-core/getScreenForRouteName.js',
    importMap: { '../utils/invariant': './invariant' },
  },
  {
    fromFile:
      'node_modules/react-navigation/src/createChildNavigationGetter.js',
    toFile: 'src/react-navigation-core/createChildNavigationGetter.js',
  },
  {
    fromFile: 'node_modules/react-navigation/src/utils/invariant.js',
    toFile: 'src/react-navigation-core/invariant.js',
  },
  {
    fromFile: 'node_modules/react-navigation/src/getChildEventSubscriber.js',
    toFile: 'src/react-navigation-core/getChildEventSubscriber.js',
  },
  { makeDirectory: 'src/react-navigation-native-container' },
  {
    toFile: 'src/react-navigation-native-container/subpackage.json',
    fromRawJSON: {
      name: '@react-navigation/native-container',
      subDependencies: ['react', 'react-native', 'react-lifecycles-compat'],
    },
  },
  makeIndex('src/react-navigation-native-container/index.js', [
    'createNavigationContainer',
  ]),
  {
    fromFile: 'node_modules/react-navigation/src/utils/docsUrl.js',
    toFile: 'src/react-navigation-native-container/docsUrl.js',
    importMap: {
      './utils/docsUrl': './docsUrl',
    },
  },

  {
    fromFile: 'node_modules/react-navigation/src/createNavigationContainer.js',
    toFile:
      'src/react-navigation-native-container/createNavigationContainer.js',
    importMap: {
      './utils/docsUrl': './docsUrl',
    },
    nonDefaultImportMap: {
      './createChildNavigationGetter': '../react-navigation-core',
      './utils/invariant': '../react-navigation-core',
      './routers/getNavigationActionCreators': '../react-navigation-core',
      './NavigationActions': '../react-navigation-core',
    },
  },

  {
    fromFile: 'node_modules/react-navigation/src/PlatformHelpers.native.js',
    toFile: 'src/react-navigation-native-container/PlatformHelpers.js',
    importMap: {},
  },
  {
    // for now, copy PlatformHelpers to stack and native container
    fromFile: 'node_modules/react-navigation/src/PlatformHelpers.native.js',
    toFile: 'src/react-navigation-stack/PlatformHelpers.js',
    importMap: {},
  },

  { makeDirectory: 'src/react-navigation-stack' },
  {
    toFile: 'src/react-navigation-stack/subpackage.json',
    fromRawJSON: {
      name: '@react-navigation/stack',
      subDependencies: [
        'react',
        'react-native',
        'hoist-non-react-statics',
        'clamp', // header needs this
      ],
    },
  },
  makeIndex('src/react-navigation-stack/index.js', [
    'createStackNavigator',
    'StackView',
    'Header',
    'Transitioner',
  ]),
  {
    fromFile:
      'node_modules/react-navigation/src/navigators/createStackNavigator.js',
    toFile: 'src/react-navigation-stack/createStackNavigator.js',
    importMap: {
      '../views/StackView/StackView': './StackView',
    },
    nonDefaultImportMap: {
      './createNavigator': '../react-navigation-core',
      '../routers/StackRouter': '../react-navigation-core',
    },
  },
  {
    fromFile:
      'node_modules/react-navigation/src/navigators/createKeyboardAwareNavigator.js',
    toFile: 'src/react-navigation-stack/createKeyboardAwareNavigator.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/StackView/StackView.js',
    toFile: 'src/react-navigation-stack/StackView.js',
    importMap: {
      '../Transitioner': './Transitioner',
    },
    nonDefaultImportMap: {
      '../../NavigationActions': '../react-navigation-core',
      '../../routers/StackActions': '../react-navigation-core',
    },
  },

  {
    fromFile:
      'node_modules/react-navigation/src/views/StackView/StackViewTransitionConfigs.js',
    toFile: 'src/react-navigation-stack/StackViewTransitionConfigs.js',
    importMap: {
      '../../utils/ReactNativeFeatures': './ReactNativeFeatures',
    },
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation/src/views/StackView/StackViewStyleInterpolator.js',
    toFile: 'src/react-navigation-stack/StackViewStyleInterpolator.js',
    importMap: {
      '../../utils/getSceneIndicesForInterpolationInputRange':
        './getSceneIndicesForInterpolationInputRange',
    },
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation/src/utils/getSceneIndicesForInterpolationInputRange.js',
    toFile:
      'src/react-navigation-stack/getSceneIndicesForInterpolationInputRange.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/utils/ReactNativeFeatures.js',
    toFile: 'src/react-navigation-stack/ReactNativeFeatures.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/Transitioner.js',
    toFile: 'src/react-navigation-stack/Transitioner.js',
    importMap: {},
    nonDefaultImportMap: {
      '../utils/invariant': '../react-navigation-core',
    },
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/ScenesReducer.js',
    toFile: 'src/react-navigation-stack/ScenesReducer.js',
    importMap: {
      '../utils/shallowEqual': './shallowEqual',
    },
    nonDefaultImportMap: {
      '../utils/invariant': '../react-navigation-core',
    },
  },
  {
    fromFile: 'node_modules/react-navigation/src/utils/shallowEqual.js',
    toFile: 'src/react-navigation-stack/shallowEqual.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation/src/views/StackView/StackViewLayout.js',
    toFile: 'src/react-navigation-stack/StackViewLayout.js',
    importMap: {
      '../Header/Header': './Header',
    },
    nonDefaultImportMap: {
      '../withOrientation': '../react-navigation-area-view',
      '../../NavigationActions': '../react-navigation-core',
      '../NavigationContext': '../react-navigation-core',
      '../SceneView': '../react-navigation-core',
      '../../routers/StackActions': '../react-navigation-core',
      '../../utils/ReactNativeFeatures': './ReactNativeFeatures',
    },
  },
  {
    fromFile:
      'node_modules/react-navigation/src/views/StackView/StackViewCard.js',
    toFile: 'src/react-navigation-stack/StackViewCard.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation/src/views/StackView/createPointerEventsContainer.js',
    toFile: 'src/react-navigation-stack/createPointerEventsContainer.js',
    importMap: {
      '../AnimatedValueSubscription': './AnimatedValueSubscription',
    },
    nonDefaultImportMap: {
      '../../utils/invariant': '../react-navigation-core',
    },
  },
  {
    fromFile:
      'node_modules/react-navigation/src/views/AnimatedValueSubscription.js',
    toFile: 'src/react-navigation-stack/AnimatedValueSubscription.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/Header/Header.js',
    toFile: 'src/react-navigation-stack/Header.js',
    importMap: {
      '../withOrientation': './withOrientation',
      '../../PlatformHelpers': './PlatformHelpers',
    },
    nonDefaultImportMap: {
      'react-native-safe-area-view': '../react-navigation-area-view',
    },
    requireMap: {
      '../assets/back-icon-mask.png': './assets/back-icon-mask.png',
    },
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/Header/HeaderTitle.js',
    toFile: 'src/react-navigation-stack/HeaderTitle.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation/src/views/Header/HeaderBackButton.js',
    toFile: 'src/react-navigation-stack/HeaderBackButton.js',
    importMap: {
      '../TouchableItem': './TouchableItem',
    },
    requireMap: {
      '../assets/back-icon.png': './assets/back-icon.png',
    },
    nonDefaultImportMap: {},
  },

  {
    fromFile: 'node_modules/react-navigation/src/views/TouchableItem.js',
    toFile: 'src/react-navigation-stack/TouchableItem.js',
    importMap: {},
    nonDefaultImportMap: {},
  },

  {
    fromFile:
      'node_modules/react-navigation/src/views/Header/ModularHeaderBackButton.js',
    toFile: 'src/react-navigation-stack/ModularHeaderBackButton.js',
    importMap: {
      '../TouchableItem': './TouchableItem',
    },
    requireMap: {
      '../assets/back-icon.png': './assets/back-icon.png',
    },
    nonDefaultImportMap: {},
  },
  {
    copyDirectory: 'node_modules/react-navigation/src/views/assets',
    toDirectory: 'src/react-navigation-stack/assets',
  },
  {
    fromFile:
      'node_modules/react-navigation/src/views/Header/HeaderStyleInterpolator.js',
    toFile: 'src/react-navigation-stack/HeaderStyleInterpolator.js',
    importMap: {
      '../../utils/getSceneIndicesForInterpolationInputRange':
        './getSceneIndicesForInterpolationInputRange',
    },
    nonDefaultImportMap: {},
  },

  { makeDirectory: 'src/react-navigation-area-view' },
  {
    toFile: 'src/react-navigation-area-view/subpackage.json',
    fromRawJSON: {
      name: '@react-navigation/area-view',
      subDependencies: ['react', 'react-native', 'hoist-non-react-statics'],
    },
  },
  makeIndex('src/react-navigation-area-view/index.js', [
    'SafeAreaView',
    'withOrientation',
  ]),
  {
    fromFile: 'node_modules/react-native-safe-area-view/index.js',
    toFile: 'src/react-navigation-area-view/SafeAreaView.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation/src/views/withOrientation.js',
    toFile: 'src/react-navigation-area-view/withOrientation.js',
  },

  { makeDirectory: 'src/react-navigation-tabs' },
  {
    toFile: 'src/react-navigation-tabs/subpackage.json',
    fromRawJSON: {
      name: '@react-navigation/tabs',
      subDependencies: ['react', 'react-native', 'hoist-non-react-statics'],
    },
  },
  makeIndex('src/react-navigation-tabs/index.js', ['createBottomTabNavigator']),
  {
    fromFile:
      'node_modules/react-navigation-tabs/src/navigators/createBottomTabNavigator.js',
    toFile: 'src/react-navigation-tabs/createBottomTabNavigator.js',
    importMap: {
      '../utils/createTabNavigator': './createTabNavigator',
      '../views/BottomTabBar': './BottomTabBar',
      '../views/ResourceSavingScene': './ResourceSavingScene',
    },
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation-tabs/src/utils/createTabNavigator.js',
    toFile: 'src/react-navigation-tabs/createTabNavigator.js',
    importMap: {
      'react-navigation': '../react-navigation-core',
    },
    nonDefaultImportMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation-tabs/src/utils/withDimensions.js',
    toFile: 'src/react-navigation-tabs/withDimensions.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation-tabs/src/views/BottomTabBar.js',
    toFile: 'src/react-navigation-tabs/BottomTabBar.js',
    importMap: {
      '../utils/withDimensions': './withDimensions',
    },
    nonDefaultImportMap: {
      'react-native-safe-area-view': '../react-navigation-area-view',
    },
  },
  {
    fromFile:
      'node_modules/react-navigation-tabs/src/views/ResourceSavingScene.js',
    toFile: 'src/react-navigation-tabs/ResourceSavingScene.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile: 'node_modules/react-navigation-tabs/src/views/CrossFadeIcon.js',
    toFile: 'src/react-navigation-tabs/CrossFadeIcon.js',
    importMap: {},
    nonDefaultImportMap: {},
  },

  // { makeDirectory: 'src/react-navigation-native' },
  // {
  //   toFile: 'src/react-navigation-native/subpackage.json',
  //   fromRawJSON: {
  //     name: '@react-navigation/native',
  //     subDependencies: [],
  //   },
  // },
  // makeIndex('src/react-navigation-native/index.js', [
  //   {
  //     exports: [
  //       'TabRouter',
  //       'StackActions',
  //       'SceneView',
  //       'createNavigator',
  //       'createNavigationContainer',
  //       'NavigationActions',
  //     ],
  //     moduleAlias: '../react-navigation-core',
  //     moduleName: 'ReactNavigation',
  //   },
  //   {
  //     exports: ['createNavigationContainer'],
  //     moduleAlias: '../react-navigation-native-container',
  //     moduleName: 'NavigationContainer',
  //   },
  // ]),

  { makeDirectory: 'src/react-navigation-native-icons' },
  {
    toFile: 'src/react-navigation-native-icons/subpackage.json',
    fromRawJSON: {
      name: '@react-navigation/native-icons',
      subDependencies: [
        'react',
        'react-native',
        'expo', // ??
      ],
    },
  },
  makeIndex('src/react-navigation-native-icons/index.js', ['Ionicons']),
  {
    fromFile: 'node_modules/@expo/vector-icons/Ionicons.js',
    toFile: 'src/react-navigation-native-icons/Ionicons.js',
    importMap: {},
    nonDefaultImportMap: {},
  },

  {
    copyDirectory: 'node_modules/@expo/vector-icons/fonts',
    toDirectory: 'src/react-navigation-native-icons/fonts',
  },

  {
    copyDirectory: 'node_modules/@expo/vector-icons/vendor',
    toDirectory: 'src/react-navigation-native-icons/vendor',
  },
  {
    fromFile: 'node_modules/@expo/vector-icons/createIconSet.js',
    toFile: 'src/react-navigation-native-icons/createIconSet.js',
    importMap: {},
    nonDefaultImportMap: {},
  },

  { makeDirectory: 'src/react-navigation-fluid' },
  {
    toFile: 'src/react-navigation-fluid/subpackage.json',
    fromRawJSON: {
      name: '@react-navigation/fluid',
      subDependencies: ['react', 'react-native', 'clamp', 'prop-types'],
    },
  },
  makeIndex('src/react-navigation-fluid/index.js', [
    'createFluidNavigator',
    'TransitionView',
  ]),
  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/FluidNavigator.js',
    toFile: 'src/react-navigation-fluid/createFluidNavigator.js',
    importMap: {
      'react-navigation': '../react-navigation-core',
    },
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/FluidTransitioner.js',
    toFile: 'src/react-navigation-fluid/FluidTransitioner.js',
    importMap: {
      'react-navigation': '../react-navigation-stack',
    },
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/NavigationActions.js',
    toFile: 'src/react-navigation-fluid/NavigationActions.js',
    importMap: {
      'react-navigation': '../react-navigation-core',
    },
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/TransitionView.js',
    toFile: 'src/react-navigation-fluid/TransitionView.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/TransitionItemsView.js',
    toFile: 'src/react-navigation-fluid/TransitionItemsView.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/TransitionRouteView.js',
    toFile: 'src/react-navigation-fluid/TransitionRouteView.js',
    importMap: {},
    nonDefaultImportMap: {},
  },

  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/TransitionOverlayView.js',
    toFile: 'src/react-navigation-fluid/TransitionOverlayView.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/TransitionItems.js',
    toFile: 'src/react-navigation-fluid/TransitionItems.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/TransitionItem.js',
    toFile: 'src/react-navigation-fluid/TransitionItem.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
  {
    copyDirectory: 'node_modules/react-navigation-fluid-transitions/src/Types',
    toDirectory: 'src/react-navigation-fluid/Types',
  },
  {
    copyDirectory:
      'node_modules/react-navigation-fluid-transitions/src/Interpolators',
    toDirectory: 'src/react-navigation-fluid/Interpolators',
  },

  {
    copyDirectory:
      'node_modules/react-navigation-fluid-transitions/src/Transitions',
    toDirectory: 'src/react-navigation-fluid/Transitions',
  },

  {
    copyDirectory: 'node_modules/react-navigation-fluid-transitions/src/Utils',
    toDirectory: 'src/react-navigation-fluid/Utils',
  },
  {
    fromFile:
      'node_modules/react-navigation-fluid-transitions/src/TransitionConstants.js',
    toFile: 'src/react-navigation-fluid/TransitionConstants.js',
    importMap: {},
    nonDefaultImportMap: {},
  },
];

transforms.forEach(t => {
  let fileData = t.fromRaw;

  if (t.copyDirectory) {
    fs.copySync(t.copyDirectory, t.toDirectory);
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
    fileData = fs.readFileSync(t.fromFile, { encoding: 'utf8' });
    fileData = fileData.replace(/__DEV__/, 'process.env === "development"');
  }

  if (t.importMap) {
    const handledBabel = babel.transform(fileData, {
      sourceMaps: true,
      comments: true,
      parserOpts: {
        plugins: ['jsx', 'objectRestSpread', 'classProperties', 'flow'],
      },
      plugins: [
        ({ parse, traverse }) => ({
          visitor: {
            CallExpression(path) {
              if (path.node.callee && path.node.callee.name === 'require') {
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
                  path.node.specifiers[0].type === 'ImportDefaultSpecifier'
                ) {
                  const local = path.node.specifiers[0].local.name;
                  const imported =
                    path.node.specifiers[0].imported &&
                    path.node.specifiers[0].imported.name;
                  path.node.specifiers = [
                    importSpecifier(
                      identifier(local),
                      identifier(imported || local),
                    ),
                  ];
                }

                path.node.source.value =
                  importMap[sourceName] || nonDefaultImportMap[sourceName];
              }
            },
          },
        }),
      ],
    });
    fileData = handledBabel.code;
  }

  t.toFile && fileData && fs.writeFileSync(t.toFile, fileData);
});
