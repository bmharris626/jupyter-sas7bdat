"use strict";
(self["webpackChunkjupyter_sas7bdat"] = self["webpackChunkjupyter_sas7bdat"] || []).push([["style_index_js"],{

/***/ "./node_modules/css-loader/dist/runtime/api.js"
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
(module) {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ },

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js"
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
(module) {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
(module) {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js"
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
(module) {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js"
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
(module) {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js"
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js"
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
(module) {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js"
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
(module) {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ },

/***/ "./style/index.js"
/*!************************!*\
  !*** ./style/index.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _base_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.css */ "./style/base.css");



/***/ },

/***/ "./node_modules/css-loader/dist/cjs.js!./style/base.css"
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./style/base.css ***!
  \**************************************************************/
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*
    See the JupyterLab Developer Guide for useful CSS Patterns:

    https://jupyterlab.readthedocs.io/en/stable/developer/css.html
*/

/* ── Root viewer ──────────────────────────────────────────────────── */

.jp-sas7bdat-viewer {
  color: var(--jp-ui-font-color1);
  background: var(--jp-layout-color1);
  height: 100%;
  overflow: hidden;
}

/* ── Layout: sidebar collapsed by default, visible when modifier present ── */

.jp-sas7bdat-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}

.jp-sas7bdat-layout.jp-sas7bdat-layout--sidebar-open {
  grid-template-columns: minmax(200px, 260px) minmax(0, 1fr);
}

/* ── Sidebar ──────────────────────────────────────────────────────── */

.jp-sas7bdat-sidebar {
  border-right: 1px solid var(--jp-border-color2);
  background: var(--jp-layout-color2);
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.jp-sas7bdat-sidebar-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px 6px 12px;
  border-bottom: 1px solid var(--jp-border-color2);
  min-height: 38px;
}

.jp-sas7bdat-sidebar-title {
  flex: 1 1 auto;
  font-size: var(--jp-ui-font-size1);
  font-weight: 600;
  color: var(--jp-ui-font-color1);
}

.jp-sas7bdat-close-btn {
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--jp-ui-font-color2);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  padding: 3px 5px;
  transition: background 0.1s, color 0.1s;
}

.jp-sas7bdat-close-btn:hover {
  background: var(--jp-layout-color3);
  color: var(--jp-ui-font-color0);
}

/* ── Variable list ────────────────────────────────────────────────── */

.jp-sas7bdat-variable-list {
  overflow-y: auto;
  padding: 6px 8px;
}

.jp-sas7bdat-variable {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
}

.jp-sas7bdat-variable + .jp-sas7bdat-variable {
  margin-top: 2px;
}

.jp-sas7bdat-variable:hover {
  border-color: var(--jp-border-color2);
  background: var(--jp-layout-color1);
}

.jp-sas7bdat-variable input[type='checkbox'] {
  flex-shrink: 0;
  margin-top: 2px;
  accent-color: var(--jp-brand-color1);
  cursor: pointer;
}

.jp-sas7bdat-variable-info {
  min-width: 0;
}

.jp-sas7bdat-variable-name {
  font-weight: 600;
  color: var(--jp-content-font-color1);
  overflow-wrap: anywhere;
}

.jp-sas7bdat-variable-meta,
.jp-sas7bdat-variable-label {
  color: var(--jp-ui-font-color2);
  font-size: var(--jp-ui-font-size0);
  margin-top: 2px;
  overflow-wrap: anywhere;
}

/* ── Main panel ───────────────────────────────────────────────────── */

.jp-sas7bdat-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ── Toolbar ──────────────────────────────────────────────────────── */

.jp-sas7bdat-toolbar {
  align-items: center;
  border-bottom: 1px solid var(--jp-border-color2);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 38px;
  padding: 4px 8px;
  background: var(--jp-layout-color1);
}

.jp-sas7bdat-toolbar-sep {
  flex: 1 1 auto;
}

.jp-sas7bdat-row-info {
  font-size: var(--jp-ui-font-size1);
  color: var(--jp-ui-font-color2);
  white-space: nowrap;
  padding: 0 4px;
}

.jp-sas7bdat-toolbar-btn {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--jp-border-radius);
  color: var(--jp-ui-font-color1);
  cursor: pointer;
  font-size: var(--jp-ui-font-size1);
  font-family: var(--jp-ui-font-family);
  line-height: 1.4;
  padding: 3px 8px;
  transition: background 0.1s, border-color 0.1s;
  white-space: nowrap;
}

.jp-sas7bdat-toolbar-btn:hover:not(:disabled) {
  background: var(--jp-layout-color2);
  border-color: var(--jp-border-color1);
}

.jp-sas7bdat-toolbar-btn:disabled {
  color: var(--jp-ui-font-color3);
  cursor: default;
}

.jp-sas7bdat-toolbar-btn.jp-sas7bdat-toolbar-btn--active {
  background: var(--jp-brand-color3);
  border-color: var(--jp-brand-color2);
  color: var(--jp-ui-font-color0);
}

.jp-sas7bdat-toolbar-btn.jp-sas7bdat-toolbar-btn--filter-active {
  background: var(--jp-warn-color3, #fff3cd);
  border-color: var(--jp-warn-color2, #ffc107);
  color: var(--jp-ui-font-color0);
}

/* ── Table ────────────────────────────────────────────────────────── */

.jp-sas7bdat-table-wrap {
  flex: 1 1 auto;
  overflow: auto;
}

.jp-sas7bdat-table {
  border-collapse: collapse;
  color: var(--jp-content-font-color1);
  font-family: var(--jp-code-font-family);
  font-size: var(--jp-code-font-size);
  min-width: 100%;
}

.jp-sas7bdat-table th,
.jp-sas7bdat-table td {
  border-bottom: 1px solid var(--jp-border-color3);
  border-right: 1px solid var(--jp-border-color3);
  max-width: 360px;
  overflow: hidden;
  padding: 4px 8px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jp-sas7bdat-table th {
  background: var(--jp-layout-color2);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.jp-sas7bdat-table tbody tr:hover td {
  background: var(--jp-layout-color2);
}

/* ── State messages ───────────────────────────────────────────────── */

.jp-sas7bdat-loading,
.jp-sas7bdat-error {
  padding: 16px;
}

.jp-sas7bdat-error {
  color: var(--jp-error-color1);
}

/* ── WHERE filter dialog ──────────────────────────────────────────── */

.jp-sas7bdat-where-dialog {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 380px;
  padding: 4px 0;
}

.jp-sas7bdat-where-label {
  color: var(--jp-ui-font-color1);
  font-size: var(--jp-ui-font-size1);
  margin: 0;
}

.jp-sas7bdat-where-input {
  box-sizing: border-box;
  font-family: var(--jp-code-font-family);
  font-size: var(--jp-code-font-size);
  resize: vertical;
  width: 100%;
}

.jp-sas7bdat-where-hint {
  color: var(--jp-ui-font-color2);
  font-size: var(--jp-ui-font-size0);
  margin: 0;
}

/* ── Convert dialog ───────────────────────────────────────────────── */

.jp-sas7bdat-convert-dialog label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0 12px;
}

.jp-sas7bdat-convert-dialog input,
.jp-sas7bdat-convert-dialog select {
  box-sizing: border-box;
  width: 100%;
}

/* ── Narrow-viewport responsive layout ───────────────────────────── */

@media (width <= 700px) {
  .jp-sas7bdat-layout.jp-sas7bdat-layout--sidebar-open {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(120px, 32%) minmax(0, 1fr);
  }

  .jp-sas7bdat-sidebar {
    border-bottom: 1px solid var(--jp-border-color2);
    border-right: 0;
  }
}
`, "",{"version":3,"sources":["webpack://./style/base.css"],"names":[],"mappings":"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","sourcesContent":["/*\n    See the JupyterLab Developer Guide for useful CSS Patterns:\n\n    https://jupyterlab.readthedocs.io/en/stable/developer/css.html\n*/\n\n/* ── Root viewer ──────────────────────────────────────────────────── */\n\n.jp-sas7bdat-viewer {\n  color: var(--jp-ui-font-color1);\n  background: var(--jp-layout-color1);\n  height: 100%;\n  overflow: hidden;\n}\n\n/* ── Layout: sidebar collapsed by default, visible when modifier present ── */\n\n.jp-sas7bdat-layout {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  height: 100%;\n  min-height: 0;\n}\n\n.jp-sas7bdat-layout.jp-sas7bdat-layout--sidebar-open {\n  grid-template-columns: minmax(200px, 260px) minmax(0, 1fr);\n}\n\n/* ── Sidebar ──────────────────────────────────────────────────────── */\n\n.jp-sas7bdat-sidebar {\n  border-right: 1px solid var(--jp-border-color2);\n  background: var(--jp-layout-color2);\n  min-height: 0;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n}\n\n.jp-sas7bdat-sidebar-header {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 6px 8px 6px 12px;\n  border-bottom: 1px solid var(--jp-border-color2);\n  min-height: 38px;\n}\n\n.jp-sas7bdat-sidebar-title {\n  flex: 1 1 auto;\n  font-size: var(--jp-ui-font-size1);\n  font-weight: 600;\n  color: var(--jp-ui-font-color1);\n}\n\n.jp-sas7bdat-close-btn {\n  background: transparent;\n  border: none;\n  border-radius: 4px;\n  color: var(--jp-ui-font-color2);\n  cursor: pointer;\n  font-size: 12px;\n  line-height: 1;\n  padding: 3px 5px;\n  transition: background 0.1s, color 0.1s;\n}\n\n.jp-sas7bdat-close-btn:hover {\n  background: var(--jp-layout-color3);\n  color: var(--jp-ui-font-color0);\n}\n\n/* ── Variable list ────────────────────────────────────────────────── */\n\n.jp-sas7bdat-variable-list {\n  overflow-y: auto;\n  padding: 6px 8px;\n}\n\n.jp-sas7bdat-variable {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 6px 8px;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\n.jp-sas7bdat-variable + .jp-sas7bdat-variable {\n  margin-top: 2px;\n}\n\n.jp-sas7bdat-variable:hover {\n  border-color: var(--jp-border-color2);\n  background: var(--jp-layout-color1);\n}\n\n.jp-sas7bdat-variable input[type='checkbox'] {\n  flex-shrink: 0;\n  margin-top: 2px;\n  accent-color: var(--jp-brand-color1);\n  cursor: pointer;\n}\n\n.jp-sas7bdat-variable-info {\n  min-width: 0;\n}\n\n.jp-sas7bdat-variable-name {\n  font-weight: 600;\n  color: var(--jp-content-font-color1);\n  overflow-wrap: anywhere;\n}\n\n.jp-sas7bdat-variable-meta,\n.jp-sas7bdat-variable-label {\n  color: var(--jp-ui-font-color2);\n  font-size: var(--jp-ui-font-size0);\n  margin-top: 2px;\n  overflow-wrap: anywhere;\n}\n\n/* ── Main panel ───────────────────────────────────────────────────── */\n\n.jp-sas7bdat-main {\n  min-width: 0;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n}\n\n/* ── Toolbar ──────────────────────────────────────────────────────── */\n\n.jp-sas7bdat-toolbar {\n  align-items: center;\n  border-bottom: 1px solid var(--jp-border-color2);\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  min-height: 38px;\n  padding: 4px 8px;\n  background: var(--jp-layout-color1);\n}\n\n.jp-sas7bdat-toolbar-sep {\n  flex: 1 1 auto;\n}\n\n.jp-sas7bdat-row-info {\n  font-size: var(--jp-ui-font-size1);\n  color: var(--jp-ui-font-color2);\n  white-space: nowrap;\n  padding: 0 4px;\n}\n\n.jp-sas7bdat-toolbar-btn {\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: var(--jp-border-radius);\n  color: var(--jp-ui-font-color1);\n  cursor: pointer;\n  font-size: var(--jp-ui-font-size1);\n  font-family: var(--jp-ui-font-family);\n  line-height: 1.4;\n  padding: 3px 8px;\n  transition: background 0.1s, border-color 0.1s;\n  white-space: nowrap;\n}\n\n.jp-sas7bdat-toolbar-btn:hover:not(:disabled) {\n  background: var(--jp-layout-color2);\n  border-color: var(--jp-border-color1);\n}\n\n.jp-sas7bdat-toolbar-btn:disabled {\n  color: var(--jp-ui-font-color3);\n  cursor: default;\n}\n\n.jp-sas7bdat-toolbar-btn.jp-sas7bdat-toolbar-btn--active {\n  background: var(--jp-brand-color3);\n  border-color: var(--jp-brand-color2);\n  color: var(--jp-ui-font-color0);\n}\n\n.jp-sas7bdat-toolbar-btn.jp-sas7bdat-toolbar-btn--filter-active {\n  background: var(--jp-warn-color3, #fff3cd);\n  border-color: var(--jp-warn-color2, #ffc107);\n  color: var(--jp-ui-font-color0);\n}\n\n/* ── Table ────────────────────────────────────────────────────────── */\n\n.jp-sas7bdat-table-wrap {\n  flex: 1 1 auto;\n  overflow: auto;\n}\n\n.jp-sas7bdat-table {\n  border-collapse: collapse;\n  color: var(--jp-content-font-color1);\n  font-family: var(--jp-code-font-family);\n  font-size: var(--jp-code-font-size);\n  min-width: 100%;\n}\n\n.jp-sas7bdat-table th,\n.jp-sas7bdat-table td {\n  border-bottom: 1px solid var(--jp-border-color3);\n  border-right: 1px solid var(--jp-border-color3);\n  max-width: 360px;\n  overflow: hidden;\n  padding: 4px 8px;\n  text-align: left;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.jp-sas7bdat-table th {\n  background: var(--jp-layout-color2);\n  font-weight: 600;\n  position: sticky;\n  top: 0;\n  z-index: 1;\n}\n\n.jp-sas7bdat-table tbody tr:hover td {\n  background: var(--jp-layout-color2);\n}\n\n/* ── State messages ───────────────────────────────────────────────── */\n\n.jp-sas7bdat-loading,\n.jp-sas7bdat-error {\n  padding: 16px;\n}\n\n.jp-sas7bdat-error {\n  color: var(--jp-error-color1);\n}\n\n/* ── WHERE filter dialog ──────────────────────────────────────────── */\n\n.jp-sas7bdat-where-dialog {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-width: 380px;\n  padding: 4px 0;\n}\n\n.jp-sas7bdat-where-label {\n  color: var(--jp-ui-font-color1);\n  font-size: var(--jp-ui-font-size1);\n  margin: 0;\n}\n\n.jp-sas7bdat-where-input {\n  box-sizing: border-box;\n  font-family: var(--jp-code-font-family);\n  font-size: var(--jp-code-font-size);\n  resize: vertical;\n  width: 100%;\n}\n\n.jp-sas7bdat-where-hint {\n  color: var(--jp-ui-font-color2);\n  font-size: var(--jp-ui-font-size0);\n  margin: 0;\n}\n\n/* ── Convert dialog ───────────────────────────────────────────────── */\n\n.jp-sas7bdat-convert-dialog label {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin: 0 0 12px;\n}\n\n.jp-sas7bdat-convert-dialog input,\n.jp-sas7bdat-convert-dialog select {\n  box-sizing: border-box;\n  width: 100%;\n}\n\n/* ── Narrow-viewport responsive layout ───────────────────────────── */\n\n@media (width <= 700px) {\n  .jp-sas7bdat-layout.jp-sas7bdat-layout--sidebar-open {\n    grid-template-columns: 1fr;\n    grid-template-rows: minmax(120px, 32%) minmax(0, 1fr);\n  }\n\n  .jp-sas7bdat-sidebar {\n    border-bottom: 1px solid var(--jp-border-color2);\n    border-right: 0;\n  }\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ "./style/base.css"
/*!************************!*\
  !*** ./style/base.css ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./base.css */ "./node_modules/css-loader/dist/cjs.js!./style/base.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }

}]);
//# sourceMappingURL=style_index_js.2a479056b148218faf5e.js.map