import { Widget } from '@lumino/widgets';

const OUTPUT_FORMATS = ['csv', 'tsv', 'json', 'parquet', 'xpt'];

export interface IConvertValue {
  format: string;
  dst: string;
}

export class ConvertDialogBody extends Widget {
  constructor(path: string) {
    super({ node: createConvertNode(path) });
    this.addClass('jp-sas7bdat-convert-dialog');
  }

  getValue(): IConvertValue {
    const format = this.formatNode.value;
    const dst = this.outputNode.value.trim();
    return { format, dst };
  }

  private get formatNode(): HTMLSelectElement {
    return this.node.querySelector(
      '.jp-sas7bdat-convert-format'
    ) as HTMLSelectElement;
  }

  private get outputNode(): HTMLInputElement {
    return this.node.querySelector(
      '.jp-sas7bdat-convert-output'
    ) as HTMLInputElement;
  }
}

function defaultOutputPath(path: string, format: string): string {
  const slash = path.lastIndexOf('/');
  const directory = slash >= 0 ? path.slice(0, slash + 1) : '';
  const basename = slash >= 0 ? path.slice(slash + 1) : path;
  const dot = basename.lastIndexOf('.');
  const stem = dot >= 0 ? basename.slice(0, dot) : basename;
  return `${directory}${stem}.${format}`;
}

function createConvertNode(path: string): HTMLElement {
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
