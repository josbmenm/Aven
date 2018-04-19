module.exports = {
  get invariant() {
    return require('./invariant');
  },

  get createConfigGetter() {
    return require('./createConfigGetter').default;
  },
  get createNavigator() {
    return require('./createNavigator').default;
  },
  get getNavigationActionCreators() {
    return require('./getNavigationActionCreators').default;
  },
  get withNavigation() {
    return require('./withNavigation').default;
  },
  get withNavigationFocus() {
    return require('./withNavigationFocus').default;
  },

  get SceneView() {
    return require('./SceneView').default;
  },

  get validateRouteConfigMap() {
    return require('./validateRouteConfigMap').default;
  },

  get NavigationActions() {
    return require('./NavigationActions').default;
  },
  get PlatformHelpers() {
    return require('./PlatformHelpers');
  },

  get getScreenForRouteName() {
    return require('./getScreenForRouteName').default;
  },
};
