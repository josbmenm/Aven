import {
  NavigationActions,
  createChildNavigationGetter,
} from '../react-navigation-core';

export default function handleServerRequest(
  Router,
  pathWithLeadingSlash,
  query,
) {
  const path = pathWithLeadingSlash.slice(1);

  // Get initial action from the URL
  const navigationAction =
    Router.getActionForPathAndParams(path, query) || NavigationActions.init();

  // Get state from reducer
  const navigationState = Router.getStateForAction(navigationAction);
  // Prepare top-level navigation prop
  const navigation = {
    state: navigationState,
    addListener: () => {},
    dispatch: () => {},
    isFocused: () => true,
    router: Router,
    getScreenProps: () => {},
    getChildNavigation: childKey =>
      createChildNavigationGetter(navigation, childKey),
  };

  // Get title from active screen options
  const activeKey = navigationState.routes[navigationState.index].key;
  const activeChildNavigation = navigation.getChildNavigation(activeKey);
  const options = Router.getScreenOptions(activeChildNavigation);
  const title = options.title || options.headerTitle;

  return { navigation, title };
}
