import { createBrowserHistory } from 'history';
import React from 'react';
import {
  NavigationActions,
  createChildNavigationGetter,
  getNavigationActionCreators,
} from '../react-navigation-core';
const queryString = require('query-string');

const history = createBrowserHistory();

const getPathAndParamsFromLocation = location => {
  const path = location.pathname.substr(1);
  const params = queryString.parse(location.search);
  return { path, params };
};

const matchPathAndParams = (a, b) => {
  if (a.path !== b.path) {
    return false;
  }
  if (queryString.stringify(a.params) !== queryString.stringify(b.params)) {
    return false;
  }
  return true;
};

let currentPathAndParams = getPathAndParamsFromLocation(history.location);

export default function createBrowserApp(App) {
  const setHistoryListener = dispatch => {
    history.listen(location => {
      const pathAndParams = getPathAndParamsFromLocation(location);
      if (matchPathAndParams(pathAndParams, currentPathAndParams)) {
        return;
      }
      currentPathAndParams = pathAndParams;
      const action = App.router.getActionForPathAndParams(
        pathAndParams.path,
        pathAndParams.params,
      );
      dispatch(action);
    });
  };

  const initAction =
    App.router.getActionForPathAndParams(
      currentPathAndParams.path,
      currentPathAndParams.params,
    ) || NavigationActions.init();

  class WebApp extends React.Component {
    state = { nav: App.router.getStateForAction(initAction) };
    _title = document.title;
    componentDidMount() {
      setHistoryListener(this._dispatch);
    }
    componentDidUpdate() {
      document.title = this._title;
    }
    render() {
      const state = this.state.nav;
      this._navigation = {
        state,
        dispatch: this._dispatch,
        addListener: () => {},
        router: App.router,
        getScreenProps: () => this.props.screenProps,
        getChildNavigation: childKey =>
          createChildNavigationGetter(this._navigation, childKey),
      };
      const activeKey = state.routes[state.index].key;
      const activeChildNavigation = this._navigation.getChildNavigation(
        activeKey,
      );
      const options = App.router.getScreenOptions(activeChildNavigation);
      this._title = options.title || options.headerTitle;

      const actionCreators = getNavigationActionCreators(
        this._navigation.state,
      );

      Object.keys(actionCreators).forEach(actionName => {
        this._navigation[actionName] = (...args) =>
          this._navigation.dispatch(actionCreators[actionName](...args));
      });

      return <App navigation={this._navigation} />;
    }
    _dispatch = action => {
      const newState = App.router.getStateForAction(action, this.state.nav);
      if (newState && newState !== this.state.nav) {
        this.setState({ nav: newState });
        const pathAndParams = App.router.getPathAndParamsForState(newState);
        if (!matchPathAndParams(pathAndParams, currentPathAndParams)) {
          currentPathAndParams = pathAndParams;
          history.push(
            `/${pathAndParams.path}?${queryString.stringify(
              pathAndParams.params,
            )}`,
          );
        }
      }
    };
  }
  return WebApp;
}
