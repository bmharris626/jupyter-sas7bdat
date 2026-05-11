# jupyter-sas7bdat

[![GitHub Actions Status](https://github.com/bmharris626/jupyter-sas7bdat/workflows/Build/badge.svg)](https://github.com/bmharris626/jupyter-sas7bdat/actions/workflows/build.yml)

A JupyterLab 4 extension for previewing SAS7BDAT datasets and converting SAS data files from inside JupyterLab.

The project includes two coupled packages:

- `jupyter_sas7bdat`: the Python server extension that reads and converts data files.
- `jupyter-sas7bdat`: the prebuilt JupyterLab frontend extension.

## Features

- Open `.sas7bdat` files directly from the JupyterLab file browser.
- Preview dataset rows with pagination.
- Show SAS variable metadata, including names, labels, dtypes, and original SAS formats.
- Convert SAS7BDAT files to CSV, TSV, JSON, Parquet, or SAS XPORT (`.xpt`).
- Convert CSV, TSV, JSON, and Parquet files to SAS XPORT (`.xpt`).
- Preserve SAS labels and formats in Parquet field metadata when converting from SAS7BDAT.

Native SAS7BDAT writing is not supported because `pyreadstat` cannot write `.sas7bdat` files. SAS export uses XPORT (`.xpt`) instead.

## Requirements

- Python >= 3.10
- JupyterLab >= 4.0.0, < 5

## Install

```bash
pip install jupyter_sas7bdat
```

After installation, Jupyter should discover both the server extension and prebuilt lab extension automatically.

## Usage

### Preview SAS7BDAT Files

Open a `.sas7bdat` file from the JupyterLab file browser. The viewer displays variable metadata and a paginated row preview.

### Convert Files

Right-click a supported file in the JupyterLab file browser and choose the SAS7BDAT conversion command. Select the target format and output path, then run the conversion.

Supported output formats:

- `.csv`
- `.tsv`
- `.json`
- `.parquet`
- `.xpt` for SAS XPORT

## REST API

The frontend uses these server endpoints under the `jupyter-sas7bdat` namespace:

- `GET /jupyter-sas7bdat/read?path=&offset=&limit=` reads SAS7BDAT metadata and paginated rows.
- `POST /jupyter-sas7bdat/convert` converts files with JSON body `{ "src": "...", "dst": "...", "format": "..." }`.

Paths are resolved relative to the Jupyter server root.

## Development

Install development dependencies and enable the extension locally:

```bash
pip install --editable ".[dev,test]"
jupyter labextension develop . --overwrite
mkdir -p ~/.jupyter/jupyter_server_config.d
cp jupyter-config/server-config/jupyter_sas7bdat.json ~/.jupyter/jupyter_server_config.d/
jupyter server extension list  # verify: jupyter_sas7bdat enabled
```

Useful commands:

```bash
jlpm build
jlpm test
jlpm run lint:check
pytest -vv -r ap --cov jupyter_sas7bdat
ruff check .
mypy jupyter_sas7bdat/ --ignore-missing-imports
```

## Troubleshooting

If the frontend extension appears but requests fail, check that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is enabled but the UI is missing, check that the prebuilt lab extension is installed:

```bash
jupyter labextension list
```

## License

MIT. See [LICENSE](LICENSE).
