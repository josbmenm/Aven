exports.id = "main";
exports.modules = {

/***/ "./src/react-navigation-core/createConfigGetter.js":
/*!*********************************************************!*\
  !*** ./src/react-navigation-core/createConfigGetter.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/typeof */ "babel-runtime/helpers/typeof");
/* harmony import */ var babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/core-js/object/assign */ "babel-runtime/core-js/object/assign");
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./invariant */ "./src/react-navigation-core/invariant.js");
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_invariant__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _getScreenForRouteName__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./getScreenForRouteName */ "./src/react-navigation-core/getScreenForRouteName.js");
/* harmony import */ var _validateScreenOptions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./validateScreenOptions */ "./src/react-navigation-core/validateScreenOptions.js");







function applyConfig(configurer, navigationOptions, configProps) {
  if (typeof configurer === 'function') {
    return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, navigationOptions, configurer(babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, configProps, {
      navigationOptions: navigationOptions
    })));
  }
  if ((typeof configurer === 'undefined' ? 'undefined' : babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(configurer)) === 'object') {
    return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, navigationOptions, configurer);
  }
  return navigationOptions;
}

/* harmony default export */ __webpack_exports__["default"] = (function (routeConfigs, navigatorScreenConfig) {
  return function (navigation, screenProps) {
    var state = navigation.state;

    var route = state;

    _invariant__WEBPACK_IMPORTED_MODULE_2___default()(route.routeName && typeof route.routeName === 'string', 'Cannot get config because the route does not have a routeName.');

    var Component = Object(_getScreenForRouteName__WEBPACK_IMPORTED_MODULE_3__["default"])(routeConfigs, route.routeName);

    var routeConfig = routeConfigs[route.routeName];

    var routeScreenConfig = routeConfig === Component ? null : routeConfig.navigationOptions;
    var componentScreenConfig = Component.navigationOptions;

    var configOptions = { navigation: navigation, screenProps: screenProps || {} };

    var outputConfig = applyConfig(navigatorScreenConfig, {}, configOptions);
    outputConfig = applyConfig(componentScreenConfig, outputConfig, configOptions);
    outputConfig = applyConfig(routeScreenConfig, outputConfig, configOptions);

    Object(_validateScreenOptions__WEBPACK_IMPORTED_MODULE_4__["default"])(outputConfig, route);

    return outputConfig;
  };
});

/***/ })

};
//# sourceMappingURL=main.a9aa7d71c741ad43db23.hot-update.js.map