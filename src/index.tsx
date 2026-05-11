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
          Loading {this.context.path}...
        </div>
      );
    }

    const end = Math.min(
      this.data.offset + this.data.rows.length,
      this.data.total_rows
    );
    const hasPrevious = this.data.offset > 0;
    const hasNext = end < this.data.total_rows;

    return (
      <div className="jp-sas7bdat-layout">
        <aside className="jp-sas7bdat-sidebar">
          <h2>Variables</h2>
          <div className="jp-sas7bdat-variable-list">
            {this.data.columns.map(column => (
              <div className="jp-sas7bdat-variable" key={column.name}>
                <div className="jp-sas7bdat-variable-name">{column.name}</div>
                <div className="jp-sas7bdat-variable-meta">
                  {column.type}
                  {column.format ? ` · ${column.format}` : ''}
                </div>
                {column.label ? (
                  <div className="jp-sas7bdat-variable-label">
                    {column.label}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </aside>
        <main className="jp-sas7bdat-main">
          <div className="jp-sas7bdat-toolbar">
            <span>
              Rows {this.data.total_rows === 0 ? 0 : this.data.offset + 1}-{end}{' '}
              of {this.data.total_rows}
            </span>
            <button
              className="jp-Button jp-mod-styled"
              disabled={!hasPrevious || this.loading}
              onClick={() =>
                void this.loadPage(Math.max(0, this.data!.offset - PAGE_SIZE))
              }
            >
              Previous
            </button>
            <button
              className="jp-Button jp-mod-styled"
              disabled={!hasNext || this.loading}
              onClick={() => void this.loadPage(this.data!.offset + PAGE_SIZE)}
            >
              Next
            </button>
          </div>
          <div className="jp-sas7bdat-table-wrap">
            <table className="jp-sas7bdat-table">
              <thead>
                <tr>
                  {this.data.columns.map(column => (
                    <th key={column.name}>{column.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {this.data.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {this.data!.columns.map(column => (
                      <td key={column.name}>{formatCell(row[column.name])}</td>
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

  private async loadPage(offset: number): Promise<void> {
    this.loading = true;
    this.update();
    try {
      const params = new URLSearchParams({
        path: this.context.path,
        offset: String(offset),
        limit: String(PAGE_SIZE)
      });
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
  const body: Dialog.IBodyWidget<IConvertValue> = new ConvertDialogBody(path);
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
          defaultFor: [FILE_TYPE]
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
