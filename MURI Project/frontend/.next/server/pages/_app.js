/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./src/components/common/InteractiveHoverButton.css":
/*!**********************************************************!*\
  !*** ./src/components/common/InteractiveHoverButton.css ***!
  \**********************************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/components/layout/topNavbar.css":
/*!*********************************************!*\
  !*** ./src/components/layout/topNavbar.css ***!
  \*********************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/components/layout/unifiedSidebar.css":
/*!**************************************************!*\
  !*** ./src/components/layout/unifiedSidebar.css ***!
  \**************************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MyApp)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _tailwind_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tailwind.css */ \"(pages-dir-node)/./src/tailwind.css\");\n/* harmony import */ var _tailwind_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tailwind_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _styles_global_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/global.css */ \"(pages-dir-node)/./src/styles/global.css\");\n/* harmony import */ var _styles_global_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_global_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _components_layout_unifiedSidebar_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/layout/unifiedSidebar.css */ \"(pages-dir-node)/./src/components/layout/unifiedSidebar.css\");\n/* harmony import */ var _components_layout_unifiedSidebar_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_components_layout_unifiedSidebar_css__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _components_layout_topNavbar_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/layout/topNavbar.css */ \"(pages-dir-node)/./src/components/layout/topNavbar.css\");\n/* harmony import */ var _components_layout_topNavbar_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_components_layout_topNavbar_css__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _components_common_InteractiveHoverButton_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/common/InteractiveHoverButton.css */ \"(pages-dir-node)/./src/components/common/InteractiveHoverButton.css\");\n/* harmony import */ var _components_common_InteractiveHoverButton_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_components_common_InteractiveHoverButton_css__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _screens_chatbot_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../screens/chatbot.css */ \"(pages-dir-node)/./src/screens/chatbot.css\");\n/* harmony import */ var _screens_chatbot_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_screens_chatbot_css__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _screens_dataAssets_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../screens/dataAssets.css */ \"(pages-dir-node)/./src/screens/dataAssets.css\");\n/* harmony import */ var _screens_dataAssets_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_screens_dataAssets_css__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var _screens_assetIssuance_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../screens/assetIssuance.css */ \"(pages-dir-node)/./src/screens/assetIssuance.css\");\n/* harmony import */ var _screens_assetIssuance_css__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_screens_assetIssuance_css__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _screens_disposal_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../screens/disposal.css */ \"(pages-dir-node)/./src/screens/disposal.css\");\n/* harmony import */ var _screens_disposal_css__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_screens_disposal_css__WEBPACK_IMPORTED_MODULE_9__);\n/* harmony import */ var _screens_document_css__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../screens/document.css */ \"(pages-dir-node)/./src/screens/document.css\");\n/* harmony import */ var _screens_document_css__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_screens_document_css__WEBPACK_IMPORTED_MODULE_10__);\n/* harmony import */ var _screens_report_css__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../screens/report.css */ \"(pages-dir-node)/./src/screens/report.css\");\n/* harmony import */ var _screens_report_css__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_screens_report_css__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var _screens_Login_Login_css__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../screens/Login/Login.css */ \"(pages-dir-node)/./src/screens/Login/Login.css\");\n/* harmony import */ var _screens_Login_Login_css__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_screens_Login_Login_css__WEBPACK_IMPORTED_MODULE_12__);\n/* harmony import */ var _screens_Dashboards_User_Dashboard_userdashboard_css__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../screens/Dashboards/User Dashboard/userdashboard.css */ \"(pages-dir-node)/./src/screens/Dashboards/User Dashboard/userdashboard.css\");\n/* harmony import */ var _screens_Dashboards_User_Dashboard_userdashboard_css__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(_screens_Dashboards_User_Dashboard_userdashboard_css__WEBPACK_IMPORTED_MODULE_13__);\n/* harmony import */ var _screens_voucherpage_css__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../screens/voucherpage.css */ \"(pages-dir-node)/./src/screens/voucherpage.css\");\n/* harmony import */ var _screens_voucherpage_css__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_screens_voucherpage_css__WEBPACK_IMPORTED_MODULE_14__);\n/* harmony import */ var _screens_Dashboards_IT_Dashboard_itdashboard_css__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../screens/Dashboards/IT Dashboard/itdashboard.css */ \"(pages-dir-node)/./src/screens/Dashboards/IT Dashboard/itdashboard.css\");\n/* harmony import */ var _screens_Dashboards_IT_Dashboard_itdashboard_css__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(_screens_Dashboards_IT_Dashboard_itdashboard_css__WEBPACK_IMPORTED_MODULE_15__);\n/* harmony import */ var _screens_Dashboards_dashboardConsistency_css__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../screens/Dashboards/dashboardConsistency.css */ \"(pages-dir-node)/./src/screens/Dashboards/dashboardConsistency.css\");\n/* harmony import */ var _screens_Dashboards_dashboardConsistency_css__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(_screens_Dashboards_dashboardConsistency_css__WEBPACK_IMPORTED_MODULE_16__);\n/* harmony import */ var _screens_settings_css__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../screens/settings.css */ \"(pages-dir-node)/./src/screens/settings.css\");\n/* harmony import */ var _screens_settings_css__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(_screens_settings_css__WEBPACK_IMPORTED_MODULE_17__);\n\n// Next.js only allows global CSS to be imported here, in _app.\n// All of these were plain (non-Module) global stylesheets under CRA too -\n// this just moves the import statements, no className/JSX logic changed.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n        ...pageProps\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\lesly\\\\Desktop\\\\Muri\\\\MURI_App\\\\MURI Project\\\\frontend\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 24,\n        columnNumber: 10\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLCtEQUErRDtBQUMvRCwwRUFBMEU7QUFDMUUseUVBQXlFO0FBQ2hEO0FBQ0s7QUFDbUI7QUFDTDtBQUNhO0FBQ3pCO0FBQ0c7QUFDRztBQUNMO0FBQ0E7QUFDRjtBQUNLO0FBQzRCO0FBQzVCO0FBQ3dCO0FBQ0o7QUFDdkI7QUFFbEIsU0FBU0EsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUM5RCxxQkFBTyw4REFBQ0Q7UUFBVyxHQUFHQyxTQUFTOzs7Ozs7QUFDakMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGVzbHlcXERlc2t0b3BcXE11cmlcXE1VUklfQXBwXFxNVVJJIFByb2plY3RcXGZyb250ZW5kXFxzcmNcXHBhZ2VzXFxfYXBwLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnO1xuLy8gTmV4dC5qcyBvbmx5IGFsbG93cyBnbG9iYWwgQ1NTIHRvIGJlIGltcG9ydGVkIGhlcmUsIGluIF9hcHAuXG4vLyBBbGwgb2YgdGhlc2Ugd2VyZSBwbGFpbiAobm9uLU1vZHVsZSkgZ2xvYmFsIHN0eWxlc2hlZXRzIHVuZGVyIENSQSB0b28gLVxuLy8gdGhpcyBqdXN0IG1vdmVzIHRoZSBpbXBvcnQgc3RhdGVtZW50cywgbm8gY2xhc3NOYW1lL0pTWCBsb2dpYyBjaGFuZ2VkLlxuaW1wb3J0ICcuLi90YWlsd2luZC5jc3MnO1xuaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFsLmNzcyc7XG5pbXBvcnQgJy4uL2NvbXBvbmVudHMvbGF5b3V0L3VuaWZpZWRTaWRlYmFyLmNzcyc7XG5pbXBvcnQgJy4uL2NvbXBvbmVudHMvbGF5b3V0L3RvcE5hdmJhci5jc3MnO1xuaW1wb3J0ICcuLi9jb21wb25lbnRzL2NvbW1vbi9JbnRlcmFjdGl2ZUhvdmVyQnV0dG9uLmNzcyc7XG5pbXBvcnQgJy4uL3NjcmVlbnMvY2hhdGJvdC5jc3MnO1xuaW1wb3J0ICcuLi9zY3JlZW5zL2RhdGFBc3NldHMuY3NzJztcbmltcG9ydCAnLi4vc2NyZWVucy9hc3NldElzc3VhbmNlLmNzcyc7XG5pbXBvcnQgJy4uL3NjcmVlbnMvZGlzcG9zYWwuY3NzJztcbmltcG9ydCAnLi4vc2NyZWVucy9kb2N1bWVudC5jc3MnO1xuaW1wb3J0ICcuLi9zY3JlZW5zL3JlcG9ydC5jc3MnO1xuaW1wb3J0ICcuLi9zY3JlZW5zL0xvZ2luL0xvZ2luLmNzcyc7XG5pbXBvcnQgJy4uL3NjcmVlbnMvRGFzaGJvYXJkcy9Vc2VyIERhc2hib2FyZC91c2VyZGFzaGJvYXJkLmNzcyc7XG5pbXBvcnQgJy4uL3NjcmVlbnMvdm91Y2hlcnBhZ2UuY3NzJztcbmltcG9ydCAnLi4vc2NyZWVucy9EYXNoYm9hcmRzL0lUIERhc2hib2FyZC9pdGRhc2hib2FyZC5jc3MnO1xuaW1wb3J0ICcuLi9zY3JlZW5zL0Rhc2hib2FyZHMvZGFzaGJvYXJkQ29uc2lzdGVuY3kuY3NzJztcbmltcG9ydCAnLi4vc2NyZWVucy9zZXR0aW5ncy5jc3MnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XG4gIHJldHVybiA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+O1xufVxuIl0sIm5hbWVzIjpbIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/pages/_app.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./src/screens/Dashboards/IT Dashboard/itdashboard.css":
/*!*************************************************************!*\
  !*** ./src/screens/Dashboards/IT Dashboard/itdashboard.css ***!
  \*************************************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/Dashboards/User Dashboard/userdashboard.css":
/*!*****************************************************************!*\
  !*** ./src/screens/Dashboards/User Dashboard/userdashboard.css ***!
  \*****************************************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/Dashboards/dashboardConsistency.css":
/*!*********************************************************!*\
  !*** ./src/screens/Dashboards/dashboardConsistency.css ***!
  \*********************************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/Login/Login.css":
/*!*************************************!*\
  !*** ./src/screens/Login/Login.css ***!
  \*************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/assetIssuance.css":
/*!***************************************!*\
  !*** ./src/screens/assetIssuance.css ***!
  \***************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/chatbot.css":
/*!*********************************!*\
  !*** ./src/screens/chatbot.css ***!
  \*********************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/dataAssets.css":
/*!************************************!*\
  !*** ./src/screens/dataAssets.css ***!
  \************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/disposal.css":
/*!**********************************!*\
  !*** ./src/screens/disposal.css ***!
  \**********************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/document.css":
/*!**********************************!*\
  !*** ./src/screens/document.css ***!
  \**********************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/report.css":
/*!********************************!*\
  !*** ./src/screens/report.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/settings.css":
/*!**********************************!*\
  !*** ./src/screens/settings.css ***!
  \**********************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/screens/voucherpage.css":
/*!*************************************!*\
  !*** ./src/screens/voucherpage.css ***!
  \*************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/styles/global.css":
/*!*******************************!*\
  !*** ./src/styles/global.css ***!
  \*******************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/tailwind.css":
/*!**************************!*\
  !*** ./src/tailwind.css ***!
  \**************************/
/***/ (() => {



/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(pages-dir-node)/./src/pages/_app.tsx"));
module.exports = __webpack_exports__;

})();