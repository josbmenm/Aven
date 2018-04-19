import { createNavigator } from '../react-navigation-core';
import { SwitchRouter } from '../react-navigation-switch-router';

import SwitchView from './SwitchView';

function createSwitchNavigator(routeConfigMap, switchConfig = {}) {
  const router = SwitchRouter(routeConfigMap, switchConfig);
  const Navigator = createNavigator(SwitchView, router, switchConfig);
  return Navigator;
}

export default createSwitchNavigator;
