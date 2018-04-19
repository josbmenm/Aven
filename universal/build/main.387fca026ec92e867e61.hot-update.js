exports.id = "main";
exports.modules = {

/***/ "./src/App/App.js":
/*!************************!*\
  !*** ./src/App/App.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/core-js/object/get-prototype-of */ "babel-runtime/core-js/object/get-prototype-of");
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ "babel-runtime/helpers/classCallCheck");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/helpers/createClass */ "babel-runtime/helpers/createClass");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babel-runtime/helpers/possibleConstructorReturn */ "babel-runtime/helpers/possibleConstructorReturn");
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! babel-runtime/helpers/inherits */ "babel-runtime/helpers/inherits");
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_native_web_dist_exports_StyleSheet__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-native-web/dist/exports/StyleSheet */ "react-native-web/dist/exports/StyleSheet");
/* harmony import */ var react_native_web_dist_exports_StyleSheet__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_StyleSheet__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-native-web/dist/exports/View */ "react-native-web/dist/exports/View");
/* harmony import */ var react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-native-web/dist/exports/Text */ "react-native-web/dist/exports/Text");
/* harmony import */ var react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-native-web/dist/exports/Button */ "react-native-web/dist/exports/Button");
/* harmony import */ var react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _react_navigation_switch_navigator__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../react-navigation-switch-navigator */ "./src/react-navigation-switch-navigator/index.js");
/* harmony import */ var _react_navigation_switch_navigator__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_switch_navigator__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _react_navigation_native_container__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../react-navigation-native-container */ "./src/react-navigation-native-container/index.js");
/* harmony import */ var _react_navigation_native_container__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_native_container__WEBPACK_IMPORTED_MODULE_11__);





var _jsxFileName = '/Users/ericvicenti/navigation/sailor/versal/src/App/App.js';









var ScreenA = function (_React$Component) {
  babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(ScreenA, _React$Component);

  function ScreenA() {
    babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, ScreenA);

    return babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default()(this, (ScreenA.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default()(ScreenA)).apply(this, arguments));
  }

  babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(ScreenA, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(
        react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7___default.a,
        { style: styles.box, __source: {
            fileName: _jsxFileName,
            lineNumber: 9
          }
        },
        react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(
          react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8___default.a,
          { style: styles.text, __source: {
              fileName: _jsxFileName,
              lineNumber: 10
            }
          },
          'Hello, screen A!'
        ),
        react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9___default.a, {
          onPress: function onPress() {
            _this2.props.navigation.navigate('ScreenB');
          },
          title: 'Go Screen B',
          __source: {
            fileName: _jsxFileName,
            lineNumber: 11
          }
        })
      );
    }
  }]);

  return ScreenA;
}(react__WEBPACK_IMPORTED_MODULE_5___default.a.Component);

var ScreenB = function (_React$Component2) {
  babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(ScreenB, _React$Component2);

  function ScreenB() {
    babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, ScreenB);

    return babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default()(this, (ScreenB.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default()(ScreenB)).apply(this, arguments));
  }

  babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(ScreenB, [{
    key: 'render',
    value: function render() {
      var _this4 = this;

      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(
        react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7___default.a,
        { style: styles.box, __source: {
            fileName: _jsxFileName,
            lineNumber: 25
          }
        },
        react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(
          react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8___default.a,
          { style: styles.text, __source: {
              fileName: _jsxFileName,
              lineNumber: 26
            }
          },
          'Hello, screen B!'
        ),
        react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9___default.a, {
          onPress: function onPress() {
            _this4.props.navigation.navigate('ScreenA');
          },
          title: 'Go Back',
          __source: {
            fileName: _jsxFileName,
            lineNumber: 27
          }
        })
      );
    }
  }]);

  return ScreenB;
}(react__WEBPACK_IMPORTED_MODULE_5___default.a.Component);

var App = Object(_react_navigation_native_container__WEBPACK_IMPORTED_MODULE_11__["createAppContainer"])(Object(_react_navigation_switch_navigator__WEBPACK_IMPORTED_MODULE_10__["createSwitchNavigator"])({
  ScreenA: ScreenA,
  ScreenB: ScreenB
}));

/* harmony default export */ __webpack_exports__["default"] = (App);

var styles = react_native_web_dist_exports_StyleSheet__WEBPACK_IMPORTED_MODULE_6___default.a.create({
  box: {
    padding: 10,
    borderWidth: 3,
    borderColor: 'blue',
    flex: 1
  },
  text: { fontWeight: 'bold' }
});

/***/ }),

/***/ "react-native-web/dist/exports/Button":
/*!*******************************************************!*\
  !*** external "react-native-web/dist/exports/Button" ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/exports/Button");

/***/ })

};
//# sourceMappingURL=main.387fca026ec92e867e61.hot-update.js.map