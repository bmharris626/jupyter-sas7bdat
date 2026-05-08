import { ConvertDialogBody } from '../convert';

describe('ConvertDialogBody', () => {
  it('defaults the output path to csv next to the source file', () => {
    const body = new ConvertDialogBody('folder/input.sas7bdat');

    expect(body.getValue()).toEqual({
      format: 'csv',
      dst: 'folder/input.csv'
    });
  });

  it('updates the output extension when the target format changes', () => {
    const body = new ConvertDialogBody('folder/input.sas7bdat');
    const select = body.node.querySelector(
      '.jp-sas7bdat-convert-format'
    ) as HTMLSelectElement;

    select.value = 'parquet';
    select.dispatchEvent(new Event('change'));

    expect(body.getValue()).toEqual({
      format: 'parquet',
      dst: 'folder/input.parquet'
    });
  });

  it('trims manually entered output paths', () => {
    const body = new ConvertDialogBody('input.csv');
    const output = body.node.querySelector(
      '.jp-sas7bdat-convert-output'
    ) as HTMLInputElement;

    output.value = ' output.xpt ';

    expect(body.getValue()).toEqual({
      format: 'csv',
      dst: 'output.xpt'
    });
  });
});
