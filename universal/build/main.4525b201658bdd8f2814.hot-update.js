exports.id = "main";
exports.modules = {

/***/ "./src/react-navigation-switch-navigator/createSwitchNavigator.js":
/*!************************************************************************!*\
  !*** ./src/react-navigation-switch-navigator/createSwitchNavigator.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../react-navigation-core */ "./src/react-navigation-core/index.js");
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _react_navigation_switch_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../react-navigation-switch-router */ "./src/react-navigation-switch-router/index.js");
/* harmony import */ var _react_navigation_switch_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_switch_router__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _SwitchView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SwitchView */ "./src/react-navigation-switch-navigator/SwitchView.js");





function createSwitchNavigator(routeConfigMap) {
  var switchConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var router = Object(_react_navigation_switch_router__WEBPACK_IMPORTED_MODULE_1__["SwitchRouter"])(routeConfigMap, switchConfig);
  var Navigator = Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_0__["createNavigator"])(_SwitchView__WEBPACK_IMPORTED_MODULE_2__["default"], router, switchConfig);
  return Navigator;
}

/* harmony default export */ __webpack_exports__["default"] = (createSwitchNavigator);

/***/ })

};
//# sourceMappingURL=main.4525b201658bdd8f2814.hot-update.js.map