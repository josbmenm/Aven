exports.id = "main";
exports.modules = {

/***/ "./src/react-navigation-native-container/createAppContainer.js":
/*!*********************************************************************!*\
  !*** ./src/react-navigation-native-container/createAppContainer.js ***!
  \*********************************************************************/
/*! exports provided: _TESTING_ONLY_reset_container_count, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_TESTING_ONLY_reset_container_count", function() { return _TESTING_ONLY_reset_container_count; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createNavigationContainer; });
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "babel-runtime/helpers/extends");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/regenerator */ "babel-runtime/regenerator");
/* harmony import */ var babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/core-js/json/stringify */ "babel-runtime/core-js/json/stringify");
/* harmony import */ var babel_runtime_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babel-runtime/helpers/asyncToGenerator */ "babel-runtime/helpers/asyncToGenerator");
/* harmony import */ var babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! babel-runtime/core-js/set */ "babel-runtime/core-js/set");
/* harmony import */ var babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! babel-runtime/core-js/object/get-prototype-of */ "babel-runtime/core-js/object/get-prototype-of");
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ "babel-runtime/helpers/classCallCheck");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! babel-runtime/helpers/possibleConstructorReturn */ "babel-runtime/helpers/possibleConstructorReturn");
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! babel-runtime/helpers/createClass */ "babel-runtime/helpers/createClass");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! babel-runtime/helpers/inherits */ "babel-runtime/helpers/inherits");
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! babel-runtime/core-js/object/keys */ "babel-runtime/core-js/object/keys");
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! babel-runtime/helpers/objectWithoutProperties */ "babel-runtime/helpers/objectWithoutProperties");
/* harmony import */ var babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react-native-web/dist/exports/Linking */ "react-native-web/dist/exports/Linking");
/* harmony import */ var react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react-native-web/dist/exports/AsyncStorage */ "react-native-web/dist/exports/AsyncStorage");
/* harmony import */ var react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var react_lifecycles_compat__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react-lifecycles-compat */ "react-lifecycles-compat");
/* harmony import */ var react_lifecycles_compat__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(react_lifecycles_compat__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../react-navigation-core */ "./src/react-navigation-core/index.js");
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var _docsUrl__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./docsUrl */ "./src/react-navigation-native-container/docsUrl.js");












var _jsxFileName = '/Users/ericvicenti/navigation/sailor/versal/src/react-navigation-native-container/createAppContainer.js';









function isStateful(props) {
  return !props.navigation;
}

function validateProps(props) {
  if (isStateful(props)) {
    return;
  }

  var navigation = props.navigation,
      screenProps = props.screenProps,
      containerProps = babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11___default()(props, ['navigation', 'screenProps']);

  var keys = babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10___default()(containerProps);

  if (keys.length !== 0) {
    throw new Error('This navigator has both navigation and container props, so it is ' + ('unclear if it should own its own state. Remove props: "' + keys.join(', ') + '" ') + 'if the navigator should get its state from the navigation prop. If the ' + 'navigator should maintain its own state, do not pass a navigation prop.');
  }
}

// Track the number of stateful container instances. Warn if >0 and not using the
// detached prop to explicitly acknowledge the behavior. We should deprecated implicit
// stateful navigation containers in a future release and require a provider style pattern
// instead in order to eliminate confusion entirely.
var _statefulContainerCount = 0;
function _TESTING_ONLY_reset_container_count() {
  _statefulContainerCount = 0;
}

// We keep a global flag to catch errors during the state persistence hydrating scenario.
// The innermost navigator who catches the error will dispatch a new init action.
var _reactNavigationIsHydratingState = false;
// Unfortunate to use global state here, but it seems necessesary for the time
// being. There seems to be some problems with cascading componentDidCatch
// handlers. Ideally the inner non-stateful navigator catches the error and
// re-throws it, to be caught by the top-level stateful navigator.

/**
 * Create an HOC that injects the navigation and manages the navigation state
 * in case it's not passed from above.
 * This allows to use e.g. the StackNavigator and TabNavigator as root-level
 * components.
 */
function createNavigationContainer(Component) {
  var NavigationContainer = function (_React$Component) {
    babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_9___default()(NavigationContainer, _React$Component);

    babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8___default()(NavigationContainer, null, [{
      key: 'getDerivedStateFromProps',
      value: function getDerivedStateFromProps(nextProps, prevState) {
        validateProps(nextProps);
        return null;
      }
    }]);

    function NavigationContainer(props) {
      var _this2 = this;

      babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_6___default()(this, NavigationContainer);

      var _this = babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_7___default()(this, (NavigationContainer.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_5___default()(NavigationContainer)).call(this, props));

      _this.subs = null;
      _this._actionEventSubscribers = new babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_4___default.a();

      _this._handleOpenURL = function (_ref) {
        var url = _ref.url;

        var parsedUrl = _this._urlToPathAndParams(url);
        if (parsedUrl) {
          var path = parsedUrl.path,
              params = parsedUrl.params;

          var action = Component.router.getActionForPathAndParams(path, params);
          if (action) {
            _this.dispatch(action);
          }
        }
      };

      _this._persistNavigationState = function () {
        var _ref2 = babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3___default()( /*#__PURE__*/babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee(nav) {
          var persistenceKey;
          return babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  persistenceKey = _this.props.persistenceKey;

                  if (persistenceKey) {
                    _context.next = 3;
                    break;
                  }

                  return _context.abrupt('return');

                case 3:
                  _context.next = 5;
                  return react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14___default.a.setItem(persistenceKey, babel_runtime_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_2___default()(nav));

                case 5:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2);
        }));

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      }();

      _this.dispatch = function (action) {
        if (_this.props.navigation) {
          return _this.props.navigation.dispatch(action);
        }
        _this._nav = _this._nav || _this.state.nav;
        var oldNav = _this._nav;
        Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["invariant"])(oldNav, 'should be set in constructor if stateful');
        var nav = Component.router.getStateForAction(action, oldNav);
        var dispatchActionEvents = function dispatchActionEvents() {
          _this._actionEventSubscribers.forEach(function (subscriber) {
            return subscriber({
              type: 'action',
              action: action,
              state: nav,
              lastState: oldNav
            });
          });
        };
        if (nav && nav !== oldNav) {
          // Cache updates to state.nav during the tick to ensure that subsequent calls will not discard this change
          _this._nav = nav;
          _this.setState({ nav: nav }, function () {
            _this._onNavigationStateChange(oldNav, nav, action);
            dispatchActionEvents();
            _this._persistNavigationState(nav);
          });
          return true;
        } else {
          dispatchActionEvents();
        }
        return false;
      };

      validateProps(props);

      _this._initialAction = _react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["NavigationActions"].init();

      if (_this._isStateful()) {
        _this.subs = _react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["PlatformHelpers"].BackHandler.addEventListener('hardwareBackPress', function () {
          if (!_this._isMounted) {
            _this.subs && _this.subs.remove();
          } else {
            // dispatch returns true if the action results in a state change,
            // and false otherwise. This maps well to what BackHandler expects
            // from a callback -- true if handled, false if not handled
            return _this.dispatch(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["NavigationActions"].back());
          }
        });
      }

      _this.state = {
        nav: _this._isStateful() && !props.persistenceKey ? Component.router.getStateForAction(_this._initialAction) : null
      };
      return _this;
    }

    babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8___default()(NavigationContainer, [{
      key: '_renderLoading',
      value: function _renderLoading() {
        return this.props.renderLoadingExperimental ? this.props.renderLoadingExperimental() : null;
      }
    }, {
      key: '_isStateful',
      value: function _isStateful() {
        return isStateful(this.props);
      }
    }, {
      key: '_validateProps',
      value: function _validateProps(props) {
        if (this._isStateful()) {
          return;
        }

        var navigation = props.navigation,
            screenProps = props.screenProps,
            containerProps = babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11___default()(props, ['navigation', 'screenProps']);

        var keys = babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10___default()(containerProps);

        if (keys.length !== 0) {
          throw new Error('This navigator has both navigation and container props, so it is ' + ('unclear if it should own its own state. Remove props: "' + keys.join(', ') + '" ') + 'if the navigator should get its state from the navigation prop. If the ' + 'navigator should maintain its own state, do not pass a navigation prop.');
        }
      }
    }, {
      key: '_urlToPathAndParams',
      value: function _urlToPathAndParams(url) {
        var params = {};
        var delimiter = this.props.uriPrefix || '://';
        var path = url.split(delimiter)[1];
        if (typeof path === 'undefined') {
          path = url;
        } else if (path === '') {
          path = '/';
        }
        return {
          path: path,
          params: params
        };
      }
    }, {
      key: '_onNavigationStateChange',
      value: function _onNavigationStateChange(prevNav, nav, action) {
        if (typeof this.props.onNavigationStateChange === 'undefined' && this._isStateful()) {
          /* eslint-disable no-console */
          if (console.group) {
            console.group('Navigation Dispatch: ');
            console.log('Action: ', action);
            console.log('New State: ', nav);
            console.log('Last State: ', prevNav);
            console.groupEnd();
          } else {
            console.log('Navigation Dispatch: ', {
              action: action,
              newState: nav,
              lastState: prevNav
            });
          }
          /* eslint-enable no-console */
          return;
        }

        if (typeof this.props.onNavigationStateChange === 'function') {
          this.props.onNavigationStateChange(prevNav, nav, action);
        }
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate() {
        // Clear cached _nav every tick
        if (this._nav === this.state.nav) {
          this._nav = null;
        }
      }
    }, {
      key: 'componentDidMount',
      value: function () {
        var _ref3 = babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3___default()( /*#__PURE__*/babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee2() {
          var _this3 = this;

          var persistenceKey, startupStateJSON, startupState, action, url, parsedUrl, path, params, urlAction;
          return babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  this._isMounted = true;

                  if (this._isStateful()) {
                    _context2.next = 3;
                    break;
                  }

                  return _context2.abrupt('return');

                case 3:

                  if ("development" === 'development' && !this.props.detached) {
                    if (_statefulContainerCount > 0) {
                      console.error('You should only render one navigator explicitly in your app, and other navigators should by rendered by including them in that navigator. Full details at: ' + Object(_docsUrl__WEBPACK_IMPORTED_MODULE_17__["default"])('common-mistakes.html#explicitly-rendering-more-than-one-navigator'));
                    }
                  }
                  _statefulContainerCount++;
                  react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13___default.a.addEventListener('url', this._handleOpenURL);

                  persistenceKey = this.props.persistenceKey;
                  _context2.t0 = persistenceKey;

                  if (!_context2.t0) {
                    _context2.next = 12;
                    break;
                  }

                  _context2.next = 11;
                  return react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14___default.a.getItem(persistenceKey);

                case 11:
                  _context2.t0 = _context2.sent;

                case 12:
                  startupStateJSON = _context2.t0;
                  startupState = this.state.nav;

                  if (startupStateJSON) {
                    try {
                      startupState = JSON.parse(startupStateJSON);
                      _reactNavigationIsHydratingState = true;
                    } catch (e) {}
                  }

                  action = this._initialAction;

                  if (!startupState) {
                    !!Object({"NODE_ENV":"development","PORT":"3000","VERBOSE":false,"HOST":"localhost","RAZZLE_ASSETS_MANIFEST":"/Users/ericvicenti/navigation/sailor/versal/build/assets.json","BUILD_TARGET":"server","PUBLIC_PATH":"/","RAZZLE_PUBLIC_DIR":"/Users/ericvicenti/navigation/sailor/versal/public"}).REACT_NAV_LOGGING && console.log('Init new Navigation State');
                    startupState = Component.router.getStateForAction(action);
                  }

                  _context2.next = 19;
                  return react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13___default.a.getInitialURL();

                case 19:
                  url = _context2.sent;
                  parsedUrl = url && this._urlToPathAndParams(url);

                  if (parsedUrl) {
                    path = parsedUrl.path, params = parsedUrl.params;
                    urlAction = Component.router.getActionForPathAndParams(path, params);

                    if (urlAction) {
                      !!Object({"NODE_ENV":"development","PORT":"3000","VERBOSE":false,"HOST":"localhost","RAZZLE_ASSETS_MANIFEST":"/Users/ericvicenti/navigation/sailor/versal/build/assets.json","BUILD_TARGET":"server","PUBLIC_PATH":"/","RAZZLE_PUBLIC_DIR":"/Users/ericvicenti/navigation/sailor/versal/public"}).REACT_NAV_LOGGING && console.log('Applying Navigation Action for Initial URL:', url);
                      action = urlAction;
                      startupState = Component.router.getStateForAction(urlAction, startupState);
                    }
                  }

                  if (!(startupState === this.state.nav)) {
                    _context2.next = 24;
                    break;
                  }

                  return _context2.abrupt('return');

                case 24:
                  this.setState({ nav: startupState }, function () {
                    _reactNavigationIsHydratingState = false;
                    _this3._actionEventSubscribers.forEach(function (subscriber) {
                      return subscriber({
                        type: 'action',
                        action: action,
                        state: _this3.state.nav,
                        lastState: null
                      });
                    });
                  });

                case 25:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function componentDidMount() {
          return _ref3.apply(this, arguments);
        }

        return componentDidMount;
      }()
    }, {
      key: 'componentDidCatch',
      value: function componentDidCatch(e, errorInfo) {
        if (_reactNavigationIsHydratingState) {
          _reactNavigationIsHydratingState = false;
          console.warn('Uncaught exception while starting app from persisted navigation state! Trying to render again with a fresh navigation state..');
          this.dispatch(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["NavigationActions"].init());
        }
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this._isMounted = false;
        react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13___default.a.removeEventListener('url', this._handleOpenURL);
        this.subs && this.subs.remove();

        if (this._isStateful()) {
          _statefulContainerCount--;
        }
      }

      // Per-tick temporary storage for state.nav

    }, {
      key: 'render',
      value: function render() {
        var _this4 = this;

        var navigation = this.props.navigation;
        if (this._isStateful()) {
          var nav = this.state.nav;
          if (!nav) {
            return this._renderLoading();
          }
          if (!this._navigation || this._navigation.state !== nav) {
            this._navigation = {
              dispatch: this.dispatch,
              state: nav,
              addListener: function addListener(eventName, handler) {
                if (eventName !== 'action') {
                  return { remove: function remove() {} };
                }
                _this4._actionEventSubscribers.add(handler);
                return {
                  remove: function remove() {
                    _this4._actionEventSubscribers.delete(handler);
                  }
                };
              }
            };
          }
          navigation = this._navigation;
        }
        Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["invariant"])(navigation, 'failed to get navigation');
        return react__WEBPACK_IMPORTED_MODULE_12___default.a.createElement(Component, babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default()({}, this.props, { navigation: navigation, __source: {
            fileName: _jsxFileName,
            lineNumber: 357
          }
        }));
      }
    }]);

    return NavigationContainer;
  }(react__WEBPACK_IMPORTED_MODULE_12___default.a.Component);

  NavigationContainer.router = Component.router;
  NavigationContainer.navigationOptions = null;


  return Object(react_lifecycles_compat__WEBPACK_IMPORTED_MODULE_15__["polyfill"])(NavigationContainer);
}

/***/ })

};
//# sourceMappingURL=main.12d853343ebc712d093d.hot-update.js.map