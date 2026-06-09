# jupyter-sas7bdat

[![GitHub Actions Status](https://github.com/bmharris626/jupyter-sas7bdat/workflows/Build/badge.svg)](https://github.com/bmharris626/jupyter-sas7bdat/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A JupyterLab 4 extension for previewing SAS7BDAT datasets and converting SAS data files from inside JupyterLab.

## Description

The project includes two coupled packages: a Python server extension (`jupyter_sas7bdat`) that reads and converts data files using `pyreadstat`, and a prebuilt JupyterLab frontend extension (`jupyter-sas7bdat`) that provides a sidebar viewer and conversion dialog. Supports previewing `.sas7bdat` files with variable metadata and paginated row display, and conversion to CSV, TSV, JSON, Parquet, or SAS XPORT (`.xpt`).

## Quick Start

```bash
pip install jupyter_sas7bdat
```

Open JupyterLab, right-click any `.sas7bdat` file in the file browser, and choose **Open SAS7BDAT Preview** or a conversion command.

## Installation & Setup

### From PyPI

```bash
pip install jupyter_sas7bdat
```

Jupyter should discover both the server extension and prebuilt lab extension automatically.

### From pre-built wheel

Download the wheel from `dist/jupyter_sas7bdat-0.1.0-py3-none-any.whl` in the repository and install:

```bash
pip install jupyter_sas7bdat-0.1.0-py3-none-any.whl
```

The wheel is self-contained and includes the frontend bundle — no build tools required. Jupyter will auto-discover both the server extension and prebuilt lab extension.

### Development install

```bash
pip install --editable ".[dev,test]"
jupyter labextension develop . --overwrite
mkdir -p ~/.jupyter/jupyter_server_config.d
cp jupyter-config/server-config/jupyter_sas7bdat.json ~/.jupyter/jupyter_server_config.d/
jupyter server extension list  # verify: jupyter_sas7bdat enabled
```

## Usage

### Preview SAS7BDAT Files

Open a `.sas7bdat` file from the JupyterLab file browser. The viewer displays variable metadata (names, labels, dtypes, SAS formats) and a paginated row preview.

### Convert Files

Right-click a supported file in the JupyterLab file browser and choose the SAS7BDAT conversion command. Select the target format and output path, then run the conversion.

Supported output formats: `.csv`, `.tsv`, `.json`, `.parquet`, `.xpt` (SAS XPORT).

### REST API

| Endpoint | Method | Description |
|---|---|---|
| `/jupyter-sas7bdat/read?path=&offset=&limit=` | `GET` | Read SAS7BDAT metadata and paginated rows |
| `/jupyter-sas7bdat/convert` | `POST` | Convert files. Body: `{ "src": "...", "dst": "...", "format": "..." }` |

Paths are resolved relative to the Jupyter server root.

## Configuration Reference

No configurable settings are exposed at runtime. Server extension config is managed via `jupyter-config/server-config/jupyter_sas7bdat.json`.

## Project Structure

```
jupyter_sas7bdat/                   # Python server extension
├── __init__.py                     # Extension registration + loading
├── _version.py                     # Auto-generated from package.json
├── routes.py                       # REST handlers: Settings, Read, Convert
├── labextension/                   # Built JS bundle
└── tests/                          # Python unit tests (pytest + pytest-jupyter)
src/                                # TypeScript frontend
├── index.tsx                       # JupyterLab plugin
├── convert.ts                      # Conversion dialog logic
├── request.ts                      # Server request helper
└── __tests__/                      # Jest tests
style/                              # CSS
├── base.css
├── index.css
└── index.js
ui-tests/                           # Playwright integration tests
conftest.py                         # pytest config
package.json
pyproject.toml
setup.py                            # setuptools shim
tsconfig.json
jest.config.js
LICENSE
CHANGELOG.md
```

## Contributing

- Python tests: `pytest -vv -r ap --cov jupyter_sas7bdat`
- Frontend tests (Jest): `jlpm test`
- Integration tests (Playwright): `jlpm build:prod` then `jlpm install && jlpm playwright test` in `ui-tests/`
- Build: `jlpm build`
- Lint: `jlpm run lint:check` or `jlpm lint` (fix mode)
- Type check: `mypy jupyter_sas7bdat/ --ignore-missing-imports`

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
