"use strict";
(self["webpackChunkjupyter_sas7bdat"] = self["webpackChunkjupyter_sas7bdat"] || []).push([["lib_index_js"],{

/***/ "./lib/convert.js"
/*!************************!*\
  !*** ./lib/convert.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConvertDialogBody: () => (/* binding */ ConvertDialogBody)
/* harmony export */ });
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_0__);

const OUTPUT_FORMATS = ['csv', 'tsv', 'json', 'parquet', 'xpt'];
class ConvertDialogBody extends _lumino_widgets__WEBPACK_IMPORTED_MODULE_0__.Widget {
    constructor(path) {
        super({ node: createConvertNode(path) });
        this.addClass('jp-sas7bdat-convert-dialog');
    }
    getValue() {
        const format = this.formatNode.value;
        const dst = this.outputNode.value.trim();
        return { format, dst };
    }
    get formatNode() {
        return this.node.querySelector('.jp-sas7bdat-convert-format');
    }
    get outputNode() {
        return this.node.querySelector('.jp-sas7bdat-convert-output');
    }
}
function defaultOutputPath(path, format) {
    const slash = path.lastIndexOf('/');
    const directory = slash >= 0 ? path.slice(0, slash + 1) : '';
    const basename = slash >= 0 ? path.slice(slash + 1) : path;
    const dot = basename.lastIndexOf('.');
    const stem = dot >= 0 ? basename.slice(0, dot) : basename;
    return `${directory}${stem}.${format}`;
}
function createConvertNode(path) {
    const node = document.createElement('div');
    const source = document.createElement('label');
    source.textContent = 'Source';
    const sourceValue = document.createElement('input');
    sourceValue.value = path;
    sourceValue.readOnly = true;
    sourceValue.className = 'jp-mod-styled';
    source.appendChild(sourceValue);
    const format = document.createElement('label');
    format.textContent = 'Target format';
    const formatSelect = document.createElement('select');
    formatSelect.className = 'jp-sas7bdat-convert-format jp-mod-styled';
    for (const value of OUTPUT_FORMATS) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value.toUpperCase();
        formatSelect.appendChild(option);
    }
    format.appendChild(formatSelect);
    const output = document.createElement('label');
    output.textContent = 'Output path';
    const outputInput = document.createElement('input');
    outputInput.className = 'jp-sas7bdat-convert-output jp-mod-styled';
    outputInput.value = defaultOutputPath(path, formatSelect.value);
    output.appendChild(outputInput);
    formatSelect.addEventListener('change', () => {
        outputInput.value = defaultOutputPath(path, formatSelect.value);
    });
    node.appendChild(source);
    node.appendChild(format);
    node.appendChild(output);
    return node;
}


/***/ },

/***/ "./lib/index.js"
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/docregistry */ "webpack/sharing/consume/default/@jupyterlab/docregistry");
/* harmony import */ var _jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _jupyterlab_filebrowser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/filebrowser */ "webpack/sharing/consume/default/@jupyterlab/filebrowser");
/* harmony import */ var _jupyterlab_filebrowser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_filebrowser__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _convert__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./convert */ "./lib/convert.js");
/* harmony import */ var _request__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./request */ "./lib/request.js");







const COMMAND_CONVERT = 'jupyter-sas7bdat:convert-file';
const FACTORY = 'SAS7BDAT Viewer';
const FILE_TYPE = 'sas7bdat';
const PAGE_SIZE = 100;
const SUPPORTED_INPUTS = ['.sas7bdat', '.csv', '.tsv', '.json', '.parquet'];
class Sas7bdatWidget extends _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.ReactWidget {
    constructor(context, serverSettings) {
        super();
        this.context = context;
        this.serverSettings = serverSettings;
        this.data = null;
        this.error = null;
        this.loading = false;
        this.addClass('jp-sas7bdat-viewer');
    }
    onAfterAttach(msg) {
        super.onAfterAttach(msg);
        void this.loadPage(0);
    }
    render() {
        if (this.error) {
            return (react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-error" },
                "Failed to load ",
                this.context.path,
                ": ",
                this.error));
        }
        if (!this.data) {
            return (react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-loading" },
                "Loading ",
                this.context.path,
                "..."));
        }
        const end = Math.min(this.data.offset + this.data.rows.length, this.data.total_rows);
        const hasPrevious = this.data.offset > 0;
        const hasNext = end < this.data.total_rows;
        return (react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-layout" },
            react__WEBPACK_IMPORTED_MODULE_4__.createElement("aside", { className: "jp-sas7bdat-sidebar" },
                react__WEBPACK_IMPORTED_MODULE_4__.createElement("h2", null, "Variables"),
                react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-variable-list" }, this.data.columns.map(column => (react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-variable", key: column.name },
                    react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-variable-name" }, column.name),
                    react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-variable-meta" },
                        column.type,
                        column.format ? ` · ${column.format}` : ''),
                    column.label ? (react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-variable-label" }, column.label)) : null))))),
            react__WEBPACK_IMPORTED_MODULE_4__.createElement("main", { className: "jp-sas7bdat-main" },
                react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-toolbar" },
                    react__WEBPACK_IMPORTED_MODULE_4__.createElement("span", null,
                        "Rows ",
                        this.data.total_rows === 0 ? 0 : this.data.offset + 1,
                        "-",
                        end,
                        ' ',
                        "of ",
                        this.data.total_rows),
                    react__WEBPACK_IMPORTED_MODULE_4__.createElement("button", { className: "jp-Button jp-mod-styled", disabled: !hasPrevious || this.loading, onClick: () => void this.loadPage(Math.max(0, this.data.offset - PAGE_SIZE)) }, "Previous"),
                    react__WEBPACK_IMPORTED_MODULE_4__.createElement("button", { className: "jp-Button jp-mod-styled", disabled: !hasNext || this.loading, onClick: () => void this.loadPage(this.data.offset + PAGE_SIZE) }, "Next")),
                react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", { className: "jp-sas7bdat-table-wrap" },
                    react__WEBPACK_IMPORTED_MODULE_4__.createElement("table", { className: "jp-sas7bdat-table" },
                        react__WEBPACK_IMPORTED_MODULE_4__.createElement("thead", null,
                            react__WEBPACK_IMPORTED_MODULE_4__.createElement("tr", null, this.data.columns.map(column => (react__WEBPACK_IMPORTED_MODULE_4__.createElement("th", { key: column.name }, column.name))))),
                        react__WEBPACK_IMPORTED_MODULE_4__.createElement("tbody", null, this.data.rows.map((row, rowIndex) => (react__WEBPACK_IMPORTED_MODULE_4__.createElement("tr", { key: rowIndex }, this.data.columns.map(column => (react__WEBPACK_IMPORTED_MODULE_4__.createElement("td", { key: column.name }, formatCell(row[column.name])))))))))))));
    }
    async loadPage(offset) {
        this.loading = true;
        this.update();
        try {
            const params = new URLSearchParams({
                path: this.context.path,
                offset: String(offset),
                limit: String(PAGE_SIZE)
            });
            this.data = await (0,_request__WEBPACK_IMPORTED_MODULE_6__.requestAPI)(`read?${params.toString()}`, this.serverSettings);
            this.error = null;
        }
        catch (reason) {
            this.error = reason instanceof Error ? reason.message : String(reason);
        }
        finally {
            this.loading = false;
            this.update();
        }
    }
}
class Sas7bdatWidgetFactory extends _jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_1__.ABCWidgetFactory {
    constructor(options, serverSettings) {
        super(options);
        this.serverSettings = serverSettings;
    }
    createNewWidget(context) {
        return new _jupyterlab_docregistry__WEBPACK_IMPORTED_MODULE_1__.DocumentWidget({
            content: new Sas7bdatWidget(context, this.serverSettings),
            context
        });
    }
}
function formatCell(value) {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}
function isSupportedInput(path) {
    const lower = path.toLowerCase();
    return SUPPORTED_INPUTS.some(extension => lower.endsWith(extension));
}
function selectedPath(browserFactory) {
    const widget = browserFactory.tracker.currentWidget;
    if (!widget) {
        return null;
    }
    const item = widget.selectedItems().next();
    if (item.done) {
        return null;
    }
    return item.value.path;
}
async function showConvertDialog(path, app) {
    const body = new _convert__WEBPACK_IMPORTED_MODULE_5__.ConvertDialogBody(path);
    const result = await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showDialog)({
        title: `Convert ${path}`,
        body,
        buttons: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.Dialog.cancelButton(), _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.Dialog.okButton({ label: 'Convert' })]
    });
    if (!result.button.accept) {
        return;
    }
    const value = result.value;
    if (!(value === null || value === void 0 ? void 0 : value.dst)) {
        await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showErrorMessage)('Convert SAS7BDAT', 'Output path is required.');
        return;
    }
    try {
        const response = await (0,_request__WEBPACK_IMPORTED_MODULE_6__.requestAPI)('convert', app.serviceManager.serverSettings, {
            method: 'POST',
            body: JSON.stringify({
                src: path,
                dst: value.dst,
                format: value.format
            })
        });
        await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showDialog)({
            title: 'Conversion Complete',
            body: `Wrote ${response.path}`,
            buttons: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.Dialog.okButton()]
        });
    }
    catch (reason) {
        await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showErrorMessage)('Convert SAS7BDAT', reason);
    }
}
const plugin = {
    id: 'jupyter-sas7bdat:plugin',
    description: 'Open, preview, and convert SAS7BDAT files.',
    autoStart: true,
    requires: [_jupyterlab_filebrowser__WEBPACK_IMPORTED_MODULE_2__.IFileBrowserFactory],
    activate: (app, browserFactory) => {
        app.docRegistry.addFileType({
            name: FILE_TYPE,
            displayName: 'SAS7BDAT',
            extensions: ['.sas7bdat'],
            mimeTypes: ['application/x-sas7bdat'],
            icon: _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_3__.LabIcon.resolve({ icon: 'ui-components:table' }),
            contentType: 'file',
            fileFormat: 'base64'
        });
        app.docRegistry.addWidgetFactory(new Sas7bdatWidgetFactory({
            name: FACTORY,
            fileTypes: [FILE_TYPE],
            defaultFor: [FILE_TYPE]
        }, app.serviceManager.serverSettings));
        app.commands.addCommand(COMMAND_CONVERT, {
            label: 'Convert Dataset...',
            isVisible: () => {
                const path = selectedPath(browserFactory);
                return path !== null && isSupportedInput(path);
            },
            isEnabled: () => {
                const path = selectedPath(browserFactory);
                return path !== null && isSupportedInput(path);
            },
            execute: async () => {
                const path = selectedPath(browserFactory);
                if (path !== null) {
                    await showConvertDialog(path, app);
                }
            }
        });
        app.contextMenu.addItem({
            command: COMMAND_CONVERT,
            selector: '.jp-DirListing-item',
            rank: 40
        });
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugin);


/***/ },

/***/ "./lib/request.js"
/*!************************!*\
  !*** ./lib/request.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   requestAPI: () => (/* binding */ requestAPI)
/* harmony export */ });
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/coreutils */ "webpack/sharing/consume/default/@jupyterlab/coreutils");
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/services */ "webpack/sharing/consume/default/@jupyterlab/services");
/* harmony import */ var _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Call the server extension
 *
 * @param endPoint API REST end point for the extension
 * @param serverSettings The server settings to use for the request
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
async function requestAPI(endPoint, serverSettings, init = {}) {
    // Make request to Jupyter API
    const requestUrl = _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__.URLExt.join(serverSettings.baseUrl, 'jupyter-sas7bdat', // our server extension's API namespace
    endPoint);
    let response;
    try {
        response = await _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.makeRequest(requestUrl, init, serverSettings);
    }
    catch (error) {
        throw new _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.NetworkError(error);
    }
    let data = await response.text();
    if (data.length > 0) {
        try {
            data = JSON.parse(data);
        }
        catch (error) {
            console.log('Not a JSON response body.', response);
        }
    }
    if (!response.ok) {
        throw new _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.ResponseError(response, data.message || data);
    }
    return data;
}


/***/ }

}]);
//# sourceMappingURL=lib_index_js.99751479edf9c8493161.js.map