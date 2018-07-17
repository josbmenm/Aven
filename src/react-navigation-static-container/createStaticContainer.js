import React from 'react';

import {
  NavigationActions,
  getNavigationActionCreators,
  createChildNavigationGetter,
} from '../react-navigation-core';

export default function createStaticContainer(Component) {
  class StaticNavigationContainer extends React.Component {
    constructor() {
      super();
      const state = Component.router
        ? Component.router.getStateForAction(NavigationActions.init())
        : { key: 'static', params: {}, routeName: 'static' };

      const actionCreators = getNavigationActionCreators(state);

      const actionHelpers = {};

      Object.keys(actionCreators).forEach(actionName => {
        actionHelpers[actionName] = (...args) =>
          this.dispatch(actionCreators[actionName](...args));
      });
      this._navigation = {
        ...actionHelpers,
        actions: actionCreators,
        state: state,
        dispatch: this.dispatch,
        getScreenProps: () => this.props.screenProps,
        getChildNavigation: childKey =>
          createChildNavigationGetter(this._navigation, childKey),
        router: Component.router,
        addListener: () => {},
        dangerouslyGetParent: () => null,
      };
    }

    dispatch = () => {};

    render() {
      return <Component navigation={this._navigation} />;
    }
  }

  return StaticNavigationContainer;
}
