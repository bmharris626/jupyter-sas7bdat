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

class WhereFilterWidget extends Widget implements Dialog.IBodyWidget<string> {
  constructor(initialValue: string) {
    const node = document.createElement('div');
    node.className = 'jp-sas7bdat-where-dialog';

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
      'Column names with spaces need backticks: `my col` > 0. Leave blank to clear the filter.';
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

class Sas7bdatWidget extends ReactWidget {
  constructor(
    private readonly context: DocumentRegistry.Context,
    private readonly serverSettings: Parameters<typeof requestAPI>[1]
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
        <div className="jp-sas7bdat-error">
          Failed to load {this.context.path}: {this.error}
        </div>
      );
    }

    if (!this.data) {
      return (
        <div className="jp-sas7bdat-loading">
          Loading {this.context.path}…
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
              <button
                className="jp-sas7bdat-close-btn"
                title="Close panel"
                onClick={() => {
                  this.sidebarOpen = false;
                  this.update();
                }}
              >
                ✕
              </button>
            </div>
            <div className="jp-sas7bdat-variable-list">
              {columns.map(col => (
                <label className="jp-sas7bdat-variable" key={col.name}>
                  <input
                    type="checkbox"
                    checked={!this.hiddenColumns.has(col.name)}
                    onChange={() => this.toggleColumn(col.name)}
                  />
                  <div className="jp-sas7bdat-variable-info">
                    <div className="jp-sas7bdat-variable-name">{col.name}</div>
                    <div className="jp-sas7bdat-variable-meta">
                      {col.type}
                      {col.format ? ` · ${col.format}` : ''}
                    </div>
                    {col.label ? (
                      <div className="jp-sas7bdat-variable-label">
                        {col.label}
                      </div>
                    ) : null}
                  </div>
                </label>
              ))}
            </div>
          </aside>
        )}
        <main className="jp-sas7bdat-main">
          <div className="jp-sas7bdat-toolbar">
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
              ☰ Variables
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
              ⊘ Filter{this.activeWhere ? ' ●' : ''}
            </button>
            <span className="jp-sas7bdat-toolbar-sep" />
            <span className="jp-sas7bdat-row-info">
              {this.loading
                ? 'Loading…'
                : total_rows === 0
                ? 'No rows'
                : `Rows ${offset + 1}–${end} of ${total_rows}`}
            </span>
            <button
              className="jp-sas7bdat-toolbar-btn"
              disabled={!hasPrevious || this.loading}
              onClick={() =>
                void this.loadPage(Math.max(0, offset - PAGE_SIZE))
              }
            >
              ◂ Prev
            </button>
            <button
              className="jp-sas7bdat-toolbar-btn"
              disabled={!hasNext || this.loading}
              onClick={() => void this.loadPage(offset + PAGE_SIZE)}
            >
              Next ▸
            </button>
          </div>
          <div className="jp-sas7bdat-table-wrap">
            <table className="jp-sas7bdat-table">
              <thead>
                <tr>
                  {visibleColumns.map(col => (
                    <th key={col.name}>{col.name}</th>
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

  private async showWhereDialog(): Promise<void> {
    const body = new WhereFilterWidget(this.activeWhere);
    const result = await showDialog<string>({
      title: 'Filter Rows',
      body,
      buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Apply' })]
    });
    if (!result.button.accept) {
      return;
    }
    this.activeWhere = result.value ?? '';
    await this.loadPage(0);
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

class Sas7bdatWidgetFactory extends ABCWidgetFactory<
  DocumentWidget<Sas7bdatWidget>
> {
  constructor(
    options: DocumentRegistry.IWidgetFactoryOptions,
    private readonly serverSettings: Parameters<typeof requestAPI>[1]
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

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function isSupportedInput(path: string): boolean {
  const lower = path.toLowerCase();
  return SUPPORTED_INPUTS.some(extension => lower.endsWith(extension));
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

async function showConvertDialog(
  path: string,
  app: JupyterFrontEnd
): Promise<void> {
  const settings = await requestAPI<ISettingsResponse>(
    'settings',
    app.serviceManager.serverSettings
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
      app.serviceManager.serverSettings,
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

export default plugin;
