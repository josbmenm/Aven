exports.id = "main";
exports.modules = {

/***/ "./build/assets.json":
/*!***************************!*\
  !*** ./build/assets.json ***!
  \***************************/
/*! exports provided: client, default */
/***/ (function(module) {

module.exports = {"client":{"js":"http://localhost:3001/static/js/bundle.js"}};

/***/ }),

/***/ "./src/server.js":
/*!***********************!*\
  !*** ./src/server.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _App_App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App/App */ "./src/App/App.js");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_dom_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-dom/server */ "react-dom/server");
/* harmony import */ var react_dom_server__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_dom_server__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-native-web/dist/exports/AppRegistry */ "react-native-web/dist/exports/AppRegistry");
/* harmony import */ var react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3__);







var assets = __webpack_require__(/*! ./build/assets.json */ "./build/assets.json");

var server = express__WEBPACK_IMPORTED_MODULE_1___default()();

react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3___default.a.registerComponent('App', function () {
  return _App_App__WEBPACK_IMPORTED_MODULE_0__["default"];
});

server.disable('x-powered-by').use(express__WEBPACK_IMPORTED_MODULE_1___default.a.static("/Users/ericvicenti/navigation/navigation/universal/public")).get('/*', function (req, res) {
  var _AppRegistry$getAppli = react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3___default.a.getApplication('App', {}),
      element = _AppRegistry$getAppli.element,
      getStyleElement = _AppRegistry$getAppli.getStyleElement;

  var html = react_dom_server__WEBPACK_IMPORTED_MODULE_2___default.a.renderToString(element);
  var css = react_dom_server__WEBPACK_IMPORTED_MODULE_2___default.a.renderToStaticMarkup(getStyleElement());

  res.send('<!doctype html>\n    <html lang="">\n    <head>\n        <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n        <meta charSet=\'utf-8\' />\n        <title>This env finally works!</title>\n        <meta name="viewport" content="width=device-width, initial-scale=1">\n        <style id="root-stylesheet">\n        html, body, #root {\n          width: 100%;\n          height: 100%;\n          display: flex;\n          flex-direction: column;\n        }\n        </style>\n        ' + css + '\n        ' + ( false ? undefined : '<script src="' + assets.client.js + '" defer crossorigin></script>') + '\n    </head>\n    <body>\n        <div id="root">' + html + '</div>\n    </body>\n</html>');
});

/* harmony default export */ __webpack_exports__["default"] = (server);

/***/ })

};
//# sourceMappingURL=main.f9dc9fe4a6da915b38c1.hot-update.js.map