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
    constructor(path, serverRoot) {
        super({ node: createConvertNode(path, serverRoot) });
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
function defaultOutputPath(path, serverRoot, format) {
    const fullPath = serverRoot.replace(/\/$/, '') + '/' + path;
    const slash = fullPath.lastIndexOf('/');
    const directory = slash >= 0 ? fullPath.slice(0, slash + 1) : '';
    const basename = slash >= 0 ? fullPath.slice(slash + 1) : fullPath;
    const dot = basename.lastIndexOf('.');
    const stem = dot >= 0 ? basename.slice(0, dot) : basename;
    return `${directory}${stem}.${format}`;
}
function createConvertNode(path, serverRoot) {
    const node = document.createElement('div');
    const source = document.createElement('label');
    source.textContent = 'Source';
    const sourceValue = document.createElement('input');
    sourceValue.value = serverRoot.replace(/\/$/, '') + '/' + path;
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
    outputInput.value = defaultOutputPath(path, serverRoot, formatSelect.value);
    output.appendChild(outputInput);
    formatSelect.addEventListener('change', () => {
        outputInput.value = defaultOutputPath(path, serverRoot, formatSelect.value);
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
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _convert__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./convert */ "./lib/convert.js");
/* harmony import */ var _request__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./request */ "./lib/request.js");








const COMMAND_CONVERT = 'jupyter-sas7bdat:convert-file';
const FACTORY = 'SAS7BDAT Viewer';
const FILE_TYPE = 'sas7bdat';
const PAGE_SIZE = 100;
const SUPPORTED_INPUTS = ['.sas7bdat', '.csv', '.tsv', '.json', '.parquet'];
// ── Inline SVG icons ───────────────────────────────────────────────
const IconColumns = () => (react__WEBPACK_IMPORTED_MODULE_5__.createElement("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true" },
    react__WEBPACK_IMPORTED_MODULE_5__.createElement("path", { d: "M1 2.5A.5.5 0 0 1 1.5 2h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2.5zm0 4A.5.5 0 0 1 1.5 6h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 6.5zm0 4a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z" })));
const IconFilter = () => (react__WEBPACK_IMPORTED_MODULE_5__.createElement("svg", { width: "13", height: "13", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true" },
    react__WEBPACK_IMPORTED_MODULE_5__.createElement("path", { d: "M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" })));
const IconConvert = () => (react__WEBPACK_IMPORTED_MODULE_5__.createElement("svg", { width: "13", height: "13", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true" },
    react__WEBPACK_IMPORTED_MODULE_5__.createElement("path", { d: "M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z" })));
const IconChevronLeft = () => (react__WEBPACK_IMPORTED_MODULE_5__.createElement("svg", { width: "12", height: "12", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true" },
    react__WEBPACK_IMPORTED_MODULE_5__.createElement("path", { fillRule: "evenodd", d: "M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" })));
const IconChevronRight = () => (react__WEBPACK_IMPORTED_MODULE_5__.createElement("svg", { width: "12", height: "12", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true" },
    react__WEBPACK_IMPORTED_MODULE_5__.createElement("path", { fillRule: "evenodd", d: "M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" })));
const IconClose = () => (react__WEBPACK_IMPORTED_MODULE_5__.createElement("svg", { width: "11", height: "11", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true" },
    react__WEBPACK_IMPORTED_MODULE_5__.createElement("path", { d: "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z" })));
// ── Helpers ────────────────────────────────────────────────────────
function formatCell(value) {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}
function typeBadgeClass(type) {
    const t = type.toLowerCase();
    if (t.startsWith('float') || t.startsWith('int') || t.startsWith('uint')) {
        return 'jp-sas7bdat-type-num';
    }
    if (t === 'object' || t.startsWith('str')) {
        return 'jp-sas7bdat-type-str';
    }
    if (t.startsWith('datetime') || t.startsWith('date')) {
        return 'jp-sas7bdat-type-date';
    }
    return 'jp-sas7bdat-type-other';
}
function typeBadgeLabel(type) {
    const t = type.toLowerCase();
    if (t.startsWith('float'))
        return 'FLT';
    if (t.startsWith('int') || t.startsWith('uint'))
        return 'INT';
    if (t === 'object')
        return 'STR';
    if (t.startsWith('datetime'))
        return 'DT';
    if (t.startsWith('date'))
        return 'DATE';
    if (t.startsWith('bool'))
        return 'BOOL';
    return type.substring(0, 4).toUpperCase();
}
function isSupportedInput(path) {
    const lower = path.toLowerCase();
    return SUPPORTED_INPUTS.some(ext => lower.endsWith(ext));
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
// ── WHERE filter dialog widget ─────────────────────────────────────
class WhereFilterWidget extends _lumino_widgets__WEBPACK_IMPORTED_MODULE_4__.Widget {
    constructor(initialValue, errorMsg) {
        const node = document.createElement('div');
        node.className = 'jp-sas7bdat-where-dialog';
        if (errorMsg) {
            const errDiv = document.createElement('p');
            errDiv.className = 'jp-sas7bdat-where-error';
            errDiv.textContent = errorMsg;
            node.appendChild(errDiv);
        }
        const label = document.createElement('p');
        label.className = 'jp-sas7bdat-where-label';
        label.textContent = 'Filter rows — SQL-like syntax (AND, OR, NOT, =, !=, <, >, <=, >=):';
        node.appendChild(label);
        const textarea = document.createElement('textarea');
        textarea.className = 'jp-sas7bdat-where-input jp-mod-styled';
        textarea.value = initialValue;
        textarea.placeholder = "age > 30 AND name = 'Smith'";
        textarea.rows = 3;
        node.appendChild(textarea);
        const hintRow = document.createElement('div');
        hintRow.className = 'jp-sas7bdat-where-hint-row';
        const hint = document.createElement('span');
        hint.className = 'jp-sas7bdat-where-hint';
        hint.textContent =
            'Column names are case-insensitive. Names with spaces need backticks: `my col` > 0.';
        hintRow.appendChild(hint);
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'jp-sas7bdat-where-clear-btn';
        clearBtn.textContent = 'Clear';
        clearBtn.addEventListener('click', () => {
            const ta = node.querySelector('textarea');
            if (ta) {
                ta.value = '';
                ta.focus();
            }
        });
        hintRow.appendChild(clearBtn);
        node.appendChild(hintRow);
        super({ node });
    }
    getValue() {
        var _a;
        const ta = this.node.querySelector('textarea');
        return (_a = ta === null || ta === void 0 ? void 0 : ta.value.trim()) !== null && _a !== void 0 ? _a : '';
    }
    onAfterAttach(msg) {
        super.onAfterAttach(msg);
        const ta = this.node.querySelector('textarea');
        if (ta) {
            ta.focus();
            ta.selectionStart = ta.value.length;
            ta.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const dialog = this.node.closest('.jp-Dialog');
                    const okBtn = dialog === null || dialog === void 0 ? void 0 : dialog.querySelector('.jp-mod-accept');
                    okBtn === null || okBtn === void 0 ? void 0 : okBtn.click();
                }
            });
        }
    }
}
// ── Dataset viewer widget ──────────────────────────────────────────
class Sas7bdatWidget extends _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.ReactWidget {
    constructor(context, serverSettings) {
        super();
        this.context = context;
        this.serverSettings = serverSettings;
        this.data = null;
        this.error = null;
        this.loading = false;
        this.sidebarOpen = false;
        this.hiddenColumns = new Set();
        this.activeWhere = '';
        this.addClass('jp-sas7bdat-viewer');
    }
    onAfterAttach(msg) {
        super.onAfterAttach(msg);
        void this.loadPage(0);
    }
    render() {
        if (this.error) {
            return (react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-state jp-sas7bdat-error" },
                react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", null,
                    "Failed to load ",
                    this.context.path,
                    ": ",
                    this.error)));
        }
        if (!this.data) {
            return (react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-state jp-sas7bdat-loading" },
                react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", null,
                    "Loading ",
                    this.context.path,
                    "\u2026")));
        }
        const { offset, rows, total_rows, columns } = this.data;
        const end = Math.min(offset + rows.length, total_rows);
        const hasPrevious = offset > 0;
        const hasNext = end < total_rows;
        const visibleColumns = columns.filter(c => !this.hiddenColumns.has(c.name));
        return (react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: 'jp-sas7bdat-layout' +
                (this.sidebarOpen ? ' jp-sas7bdat-layout--sidebar-open' : '') },
            this.sidebarOpen && (react__WEBPACK_IMPORTED_MODULE_5__.createElement("aside", { className: "jp-sas7bdat-sidebar" },
                react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-sidebar-header" },
                    react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", { className: "jp-sas7bdat-sidebar-title" }, "Variables"),
                    react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", { className: "jp-sas7bdat-sidebar-count" },
                        columns.length - this.hiddenColumns.size,
                        "/",
                        columns.length),
                    react__WEBPACK_IMPORTED_MODULE_5__.createElement("button", { className: "jp-sas7bdat-icon-btn", title: "Close panel", onClick: () => {
                            this.sidebarOpen = false;
                            this.update();
                        } },
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement(IconClose, null))),
                react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-variable-list" }, columns.map(col => {
                    const visible = !this.hiddenColumns.has(col.name);
                    return (react__WEBPACK_IMPORTED_MODULE_5__.createElement("label", { className: 'jp-sas7bdat-variable' +
                            (visible ? '' : ' jp-sas7bdat-variable--hidden'), key: col.name },
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("input", { type: "checkbox", checked: visible, onChange: () => this.toggleColumn(col.name) }),
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-variable-info" },
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-variable-name-row" },
                                react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", { className: "jp-sas7bdat-variable-name" }, col.name),
                                react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", { className: `jp-sas7bdat-type-badge ${typeBadgeClass(col.type)}` }, typeBadgeLabel(col.type))),
                            col.label ? (react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-variable-label" }, col.label)) : null,
                            col.format ? (react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-variable-format" }, col.format)) : null)));
                })))),
            react__WEBPACK_IMPORTED_MODULE_5__.createElement("main", { className: "jp-sas7bdat-main" },
                react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-toolbar" },
                    react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-toolbar-group" },
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("button", { className: 'jp-sas7bdat-toolbar-btn' +
                                (this.sidebarOpen ? ' jp-sas7bdat-toolbar-btn--active' : ''), title: this.sidebarOpen ? 'Hide variables panel' : 'Show variables panel', onClick: () => {
                                this.sidebarOpen = !this.sidebarOpen;
                                this.update();
                            } },
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement(IconColumns, null),
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", null, "Variables")),
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("button", { className: 'jp-sas7bdat-toolbar-btn' +
                                (this.activeWhere ? ' jp-sas7bdat-toolbar-btn--filter-active' : ''), title: this.activeWhere
                                ? `Active filter: ${this.activeWhere}`
                                : 'Filter rows', onClick: () => void this.showWhereDialog() },
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement(IconFilter, null),
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", null,
                                "Filter",
                                this.activeWhere ? ' ●' : '')),
                        this.activeWhere && (react__WEBPACK_IMPORTED_MODULE_5__.createElement("button", { className: "jp-sas7bdat-icon-btn jp-sas7bdat-icon-btn--clear-filter", title: "Clear filter", onClick: () => {
                                this.activeWhere = '';
                                void this.loadPage(0);
                            } },
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement(IconClose, null)))),
                    react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-toolbar-group jp-sas7bdat-toolbar-group--right" },
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", { className: "jp-sas7bdat-row-info" }, this.loading
                            ? 'Loading…'
                            : total_rows === 0
                                ? 'No rows'
                                : `${offset + 1}–${end} of ${total_rows.toLocaleString()}`),
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-toolbar-pagination" },
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement("button", { className: "jp-sas7bdat-icon-btn jp-sas7bdat-icon-btn--nav", disabled: !hasPrevious || this.loading, title: "Previous page", onClick: () => void this.loadPage(Math.max(0, offset - PAGE_SIZE)) },
                                react__WEBPACK_IMPORTED_MODULE_5__.createElement(IconChevronLeft, null)),
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement("button", { className: "jp-sas7bdat-icon-btn jp-sas7bdat-icon-btn--nav", disabled: !hasNext || this.loading, title: "Next page", onClick: () => void this.loadPage(offset + PAGE_SIZE) },
                                react__WEBPACK_IMPORTED_MODULE_5__.createElement(IconChevronRight, null))),
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-toolbar-divider" }),
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("button", { className: "jp-sas7bdat-toolbar-btn jp-sas7bdat-toolbar-btn--convert", title: "Convert this dataset to another format", onClick: () => void showConvertDialog(this.context.path, this.serverSettings) },
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement(IconConvert, null),
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", null, "Convert")))),
                react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-table-wrap" },
                    react__WEBPACK_IMPORTED_MODULE_5__.createElement("table", { className: "jp-sas7bdat-table" },
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("thead", null,
                            react__WEBPACK_IMPORTED_MODULE_5__.createElement("tr", null, visibleColumns.map(col => (react__WEBPACK_IMPORTED_MODULE_5__.createElement("th", { key: col.name, title: col.label || col.name },
                                react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", { className: "jp-sas7bdat-th-inner" },
                                    react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", { className: "jp-sas7bdat-th-name" }, col.name),
                                    col.label && (react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", { className: "jp-sas7bdat-th-label" }, col.label)))))))),
                        react__WEBPACK_IMPORTED_MODULE_5__.createElement("tbody", null, rows.map((row, i) => (react__WEBPACK_IMPORTED_MODULE_5__.createElement("tr", { key: i }, visibleColumns.map(col => (react__WEBPACK_IMPORTED_MODULE_5__.createElement("td", { key: col.name }, formatCell(row[col.name])))))))))))));
    }
    toggleColumn(name) {
        if (this.hiddenColumns.has(name)) {
            this.hiddenColumns.delete(name);
        }
        else {
            this.hiddenColumns.add(name);
        }
        this.update();
    }
    async showWhereDialog(prevWhere, errorMsg) {
        var _a;
        const body = new WhereFilterWidget(this.activeWhere, errorMsg);
        const result = await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showDialog)({
            title: 'Filter Rows',
            body,
            buttons: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.Dialog.cancelButton(), _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.Dialog.okButton({ label: 'Apply' })]
        });
        if (!result.button.accept) {
            // Cancelled while retrying a bad filter — restore the last good filter
            if (errorMsg !== undefined && prevWhere !== undefined) {
                this.activeWhere = prevWhere;
                this.error = null;
                this.update();
            }
            return;
        }
        const savedWhere = prevWhere !== null && prevWhere !== void 0 ? prevWhere : this.activeWhere;
        this.activeWhere = (_a = result.value) !== null && _a !== void 0 ? _a : '';
        await this.loadPage(0);
        if (this.error && this.activeWhere) {
            // Filter was rejected by the server — re-open dialog with the error shown
            const filterError = this.error;
            this.error = null;
            this.update();
            await this.showWhereDialog(savedWhere, filterError);
        }
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
            if (this.activeWhere) {
                params.set('where', this.activeWhere);
            }
            this.data = await (0,_request__WEBPACK_IMPORTED_MODULE_7__.requestAPI)(`read?${params.toString()}`, this.serverSettings);
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
// ── Widget factory ─────────────────────────────────────────────────
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
// ── Convert dialog ─────────────────────────────────────────────────
async function showConvertDialog(path, serverSettings) {
    const settings = await (0,_request__WEBPACK_IMPORTED_MODULE_7__.requestAPI)('settings', serverSettings);
    const body = new _convert__WEBPACK_IMPORTED_MODULE_6__.ConvertDialogBody(path, settings.server_root);
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
        const response = await (0,_request__WEBPACK_IMPORTED_MODULE_7__.requestAPI)('convert', serverSettings, {
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
// ── Plugin ─────────────────────────────────────────────────────────
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
            defaultFor: [FILE_TYPE],
            modelName: 'base64'
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
                    await showConvertDialog(path, app.serviceManager.serverSettings);
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
//# sourceMappingURL=lib_index_js.8eb3fae0de854a19717f.js.map