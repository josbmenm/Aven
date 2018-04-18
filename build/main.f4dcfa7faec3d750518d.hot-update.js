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
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App */ "./src/App.js");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-dom/server\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-native-web/dist/exports/AppRegistry\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());







var assets = __webpack_require__(/*! ./build/assets.json */ "./build/assets.json");

var server = express__WEBPACK_IMPORTED_MODULE_1___default()();

!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-native-web/dist/exports/AppRegistry\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()).registerComponent('App', function () {
  return _App__WEBPACK_IMPORTED_MODULE_0__["default"];
});

server.disable('x-powered-by').use(express__WEBPACK_IMPORTED_MODULE_1___default.a.static("/Users/ericvicenti/navigation/sailor/public")).get('/*', function (req, res) {
  var _AppRegistry$getAppli = !(function webpackMissingModule() { var e = new Error("Cannot find module \"react-native-web/dist/exports/AppRegistry\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()).getApplication('App', {}),
      element = _AppRegistry$getAppli.element,
      getStyleElement = _AppRegistry$getAppli.getStyleElement;

  var html = !(function webpackMissingModule() { var e = new Error("Cannot find module \"react-dom/server\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()).renderToString(element);
  var css = !(function webpackMissingModule() { var e = new Error("Cannot find module \"react-dom/server\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()).renderToStaticMarkup(getStyleElement());

  res.send('<!doctype html>\n    <html lang="">\n    <head>\n        <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n        <meta charSet=\'utf-8\' />\n        <title>Welcome to Razzle</title>\n        <meta name="viewport" content="width=device-width, initial-scale=1">\n        ' + css + '\n        ' + ( false ? undefined : '<script src="' + assets.client.js + '" defer crossorigin></script>') + '\n    </head>\n    <body>\n        <div id="root">' + html + '</div>\n    </body>\n</html>');
});

/* harmony default export */ __webpack_exports__["default"] = (server);

/***/ })

};
//# sourceMappingURL=main.f4dcfa7faec3d750518d.hot-update.js.map