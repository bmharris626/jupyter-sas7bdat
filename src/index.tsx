import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  Dialog,
  ReactWidget,
  showDialog,
  showErrorMessage
} from '@jupyterlab/apputils';
import {
  ABCWidgetFactory,
  DocumentRegistry,
  DocumentWidget
} from '@jupyterlab/docregistry';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { LabIcon } from '@jupyterlab/ui-components';
import { ServerConnection } from '@jupyterlab/services';
import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';

import * as React from 'react';

import { ConvertDialogBody, IConvertValue } from './convert';
import { requestAPI } from './request';

const COMMAND_CONVERT = 'jupyter-sas7bdat:convert-file';
const FACTORY = 'SAS7BDAT Viewer';
const FILE_TYPE = 'sas7bdat';
const PAGE_SIZE = 100;
const SUPPORTED_INPUTS = ['.sas7bdat', '.csv', '.tsv', '.json', '.parquet'];

// ── Inline SVG icons ───────────────────────────────────────────────

const IconColumns: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M1 2.5A.5.5 0 0 1 1.5 2h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2.5zm0 4A.5.5 0 0 1 1.5 6h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 6.5zm0 4a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z" />
  </svg>
);

const IconFilter: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
  </svg>
);

const IconConvert: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z" />
  </svg>
);

const IconChevronLeft: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
  </svg>
);

const IconChevronRight: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
  </svg>
);

const IconClose: React.FC = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z" />
  </svg>
);

// ── Types ──────────────────────────────────────────────────────────

interface IColumn {
  name: string;
  label: string;
  type: string;
  format: string;
}

interface IReadResponse {
  columns: IColumn[];
  rows: Record<string, unknown>[];
  total_rows: number;
  offset: number;
  limit: number;
}

interface IConvertResponse {
  path: string;
  format: string;
}

interface ISettingsResponse {
  server_root: string;
}

// ── Helpers ────────────────────────────────────────────────────────

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function typeBadgeClass(type: string): string {
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

function typeBadgeLabel(type: string): string {
  const t = type.toLowerCase();
  if (t.startsWith('float')) return 'FLT';
  if (t.startsWith('int') || t.startsWith('uint')) return 'INT';
  if (t === 'object') return 'STR';
  if (t.startsWith('datetime')) return 'DT';
  if (t.startsWith('date')) return 'DATE';
  if (t.startsWith('bool')) return 'BOOL';
  return type.substring(0, 4).toUpperCase();
}

function isSupportedInput(path: string): boolean {
  const lower = path.toLowerCase();
  return SUPPORTED_INPUTS.some(ext => lower.endsWith(ext));
}

function selectedPath(browserFactory: IFileBrowserFactory): string | null {
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

class WhereFilterWidget extends Widget implements Dialog.IBodyWidget<string> {
  constructor(initialValue: string, errorMsg?: string) {
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

    const hint = document.createElement('p');
    hint.className = 'jp-sas7bdat-where-hint';
    hint.textContent =
      'Column names are case-insensitive. Names with spaces need backticks: `my col` > 0. Leave blank to clear the filter.';
    node.appendChild(hint);

    super({ node });
  }

  getValue(): string {
    const ta = this.node.querySelector<HTMLTextAreaElement>('textarea');
    return ta?.value.trim() ?? '';
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    const ta = this.node.querySelector<HTMLTextAreaElement>('textarea');
    if (ta) {
      ta.focus();
      ta.selectionStart = ta.value.length;
    }
  }
}

// ── Dataset viewer widget ──────────────────────────────────────────

class Sas7bdatWidget extends ReactWidget {
  constructor(
    private readonly context: DocumentRegistry.Context,
    private readonly serverSettings: ServerConnection.ISettings
  ) {
    super();
    this.addClass('jp-sas7bdat-viewer');
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    void this.loadPage(0);
  }

  render(): React.ReactElement {
    if (this.error) {
      return (
        <div className="jp-sas7bdat-state jp-sas7bdat-error">
          <span>Failed to load {this.context.path}: {this.error}</span>
        </div>
      );
    }

    if (!this.data) {
      return (
        <div className="jp-sas7bdat-state jp-sas7bdat-loading">
          <span>Loading {this.context.path}…</span>
        </div>
      );
    }

    const { offset, rows, total_rows, columns } = this.data;
    const end = Math.min(offset + rows.length, total_rows);
    const hasPrevious = offset > 0;
    const hasNext = end < total_rows;
    const visibleColumns = columns.filter(c => !this.hiddenColumns.has(c.name));

    return (
      <div
        className={
          'jp-sas7bdat-layout' +
          (this.sidebarOpen ? ' jp-sas7bdat-layout--sidebar-open' : '')
        }
      >
        {this.sidebarOpen && (
          <aside className="jp-sas7bdat-sidebar">
            <div className="jp-sas7bdat-sidebar-header">
              <span className="jp-sas7bdat-sidebar-title">Variables</span>
              <span className="jp-sas7bdat-sidebar-count">
                {columns.length - this.hiddenColumns.size}/{columns.length}
              </span>
              <button
                className="jp-sas7bdat-icon-btn"
                title="Close panel"
                onClick={() => {
                  this.sidebarOpen = false;
                  this.update();
                }}
              >
                <IconClose />
              </button>
            </div>
            <div className="jp-sas7bdat-variable-list">
              {columns.map(col => {
                const visible = !this.hiddenColumns.has(col.name);
                return (
                  <label
                    className={
                      'jp-sas7bdat-variable' +
                      (visible ? '' : ' jp-sas7bdat-variable--hidden')
                    }
                    key={col.name}
                  >
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={() => this.toggleColumn(col.name)}
                    />
                    <div className="jp-sas7bdat-variable-info">
                      <div className="jp-sas7bdat-variable-name-row">
                        <span className="jp-sas7bdat-variable-name">{col.name}</span>
                        <span className={`jp-sas7bdat-type-badge ${typeBadgeClass(col.type)}`}>
                          {typeBadgeLabel(col.type)}
                        </span>
                      </div>
                      {col.label ? (
                        <div className="jp-sas7bdat-variable-label">{col.label}</div>
                      ) : null}
                      {col.format ? (
                        <div className="jp-sas7bdat-variable-format">{col.format}</div>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>
          </aside>
        )}
        <main className="jp-sas7bdat-main">
          <div className="jp-sas7bdat-toolbar">
            <div className="jp-sas7bdat-toolbar-group">
              <button
                className={
                  'jp-sas7bdat-toolbar-btn' +
                  (this.sidebarOpen ? ' jp-sas7bdat-toolbar-btn--active' : '')
                }
                title={this.sidebarOpen ? 'Hide variables panel' : 'Show variables panel'}
                onClick={() => {
                  this.sidebarOpen = !this.sidebarOpen;
                  this.update();
                }}
              >
                <IconColumns />
                <span>Variables</span>
              </button>
              <button
                className={
                  'jp-sas7bdat-toolbar-btn' +
                  (this.activeWhere ? ' jp-sas7bdat-toolbar-btn--filter-active' : '')
                }
                title={
                  this.activeWhere
                    ? `Active filter: ${this.activeWhere}`
                    : 'Filter rows'
                }
                onClick={() => void this.showWhereDialog()}
              >
                <IconFilter />
                <span>Filter{this.activeWhere ? ' ●' : ''}</span>
              </button>
            </div>

            <div className="jp-sas7bdat-toolbar-group jp-sas7bdat-toolbar-group--right">
              <span className="jp-sas7bdat-row-info">
                {this.loading
                  ? 'Loading…'
                  : total_rows === 0
                  ? 'No rows'
                  : `${offset + 1}–${end} of ${total_rows.toLocaleString()}`}
              </span>
              <div className="jp-sas7bdat-toolbar-pagination">
                <button
                  className="jp-sas7bdat-icon-btn jp-sas7bdat-icon-btn--nav"
                  disabled={!hasPrevious || this.loading}
                  title="Previous page"
                  onClick={() =>
                    void this.loadPage(Math.max(0, offset - PAGE_SIZE))
                  }
                >
                  <IconChevronLeft />
                </button>
                <button
                  className="jp-sas7bdat-icon-btn jp-sas7bdat-icon-btn--nav"
                  disabled={!hasNext || this.loading}
                  title="Next page"
                  onClick={() => void this.loadPage(offset + PAGE_SIZE)}
                >
                  <IconChevronRight />
                </button>
              </div>
              <div className="jp-sas7bdat-toolbar-divider" />
              <button
                className="jp-sas7bdat-toolbar-btn jp-sas7bdat-toolbar-btn--convert"
                title="Convert this dataset to another format"
                onClick={() => void showConvertDialog(this.context.path, this.serverSettings)}
              >
                <IconConvert />
                <span>Convert</span>
              </button>
            </div>
          </div>

          <div className="jp-sas7bdat-table-wrap">
            <table className="jp-sas7bdat-table">
              <thead>
                <tr>
                  {visibleColumns.map(col => (
                    <th key={col.name} title={col.label || col.name}>
                      <div className="jp-sas7bdat-th-inner">
                        <span className="jp-sas7bdat-th-name">{col.name}</span>
                        {col.label && (
                          <span className="jp-sas7bdat-th-label">{col.label}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {visibleColumns.map(col => (
                      <td key={col.name}>{formatCell(row[col.name])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    );
  }

  private toggleColumn(name: string): void {
    if (this.hiddenColumns.has(name)) {
      this.hiddenColumns.delete(name);
    } else {
      this.hiddenColumns.add(name);
    }
    this.update();
  }

  private async showWhereDialog(
    prevWhere?: string,
    errorMsg?: string
  ): Promise<void> {
    const body = new WhereFilterWidget(this.activeWhere, errorMsg);
    const result = await showDialog<string>({
      title: 'Filter Rows',
      body,
      buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Apply' })]
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
    const savedWhere = prevWhere ?? this.activeWhere;
    this.activeWhere = result.value ?? '';
    await this.loadPage(0);
    if (this.error && this.activeWhere) {
      // Filter was rejected by the server — re-open dialog with the error shown
      const filterError = this.error;
      this.error = null;
      this.update();
      await this.showWhereDialog(savedWhere, filterError);
    }
  }

  private async loadPage(offset: number): Promise<void> {
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
      this.data = await requestAPI<IReadResponse>(
        `read?${params.toString()}`,
        this.serverSettings
      );
      this.error = null;
    } catch (reason) {
      this.error = reason instanceof Error ? reason.message : String(reason);
    } finally {
      this.loading = false;
      this.update();
    }
  }

  private data: IReadResponse | null = null;
  private error: string | null = null;
  private loading = false;
  private sidebarOpen = false;
  private hiddenColumns = new Set<string>();
  private activeWhere = '';
}

// ── Widget factory ─────────────────────────────────────────────────

class Sas7bdatWidgetFactory extends ABCWidgetFactory<
  DocumentWidget<Sas7bdatWidget>
> {
  constructor(
    options: DocumentRegistry.IWidgetFactoryOptions,
    private readonly serverSettings: ServerConnection.ISettings
  ) {
    super(options);
  }

  protected createNewWidget(
    context: DocumentRegistry.Context
  ): DocumentWidget<Sas7bdatWidget> {
    return new DocumentWidget({
      content: new Sas7bdatWidget(context, this.serverSettings),
      context
    });
  }
}

// ── Convert dialog ─────────────────────────────────────────────────

async function showConvertDialog(
  path: string,
  serverSettings: ServerConnection.ISettings
): Promise<void> {
  const settings = await requestAPI<ISettingsResponse>(
    'settings',
    serverSettings
  );
  const body: Dialog.IBodyWidget<IConvertValue> = new ConvertDialogBody(
    path,
    settings.server_root
  );
  const result = await showDialog({
    title: `Convert ${path}`,
    body,
    buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Convert' })]
  });

  if (!result.button.accept) {
    return;
  }

  const value = result.value;
  if (!value?.dst) {
    await showErrorMessage('Convert SAS7BDAT', 'Output path is required.');
    return;
  }

  try {
    const response = await requestAPI<IConvertResponse>(
      'convert',
      serverSettings,
      {
        method: 'POST',
        body: JSON.stringify({
          src: path,
          dst: value.dst,
          format: value.format
        })
      }
    );
    await showDialog({
      title: 'Conversion Complete',
      body: `Wrote ${response.path}`,
      buttons: [Dialog.okButton()]
    });
  } catch (reason) {
    await showErrorMessage('Convert SAS7BDAT', reason as Error);
  }
}

// ── Plugin ─────────────────────────────────────────────────────────

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-sas7bdat:plugin',
  description: 'Open, preview, and convert SAS7BDAT files.',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, browserFactory: IFileBrowserFactory) => {
    app.docRegistry.addFileType({
      name: FILE_TYPE,
      displayName: 'SAS7BDAT',
      extensions: ['.sas7bdat'],
      mimeTypes: ['application/x-sas7bdat'],
      icon: LabIcon.resolve({ icon: 'ui-components:table' }),
      contentType: 'file',
      fileFormat: 'base64'
    });

    app.docRegistry.addWidgetFactory(
      new Sas7bdatWidgetFactory(
        {
          name: FACTORY,
          fileTypes: [FILE_TYPE],
          defaultFor: [FILE_TYPE],
          modelName: 'base64'
        },
        app.serviceManager.serverSettings
      )
    );

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

export default plugin;
