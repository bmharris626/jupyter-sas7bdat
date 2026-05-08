# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A JupyterLab extension (with a Jupyter Server backend) that adds SAS7BDAT support:
- Open and preview `.sas7bdat` files inside JupyterLab
- Convert SAS7BDAT to CSV, TSV, JSON, and Parquet
- Convert CSV, TSV, JSON, and Parquet to SAS7BDAT (via SAS XPORT `.xpt` — see Constraints below)

SAS I/O library: **`pyreadstat`** (read SAS7BDAT; write XPORT `.xpt`, SPSS `.sav`, Stata `.dta`).

## Constraints

**`pyreadstat` cannot write SAS7BDAT.** It can only *read* `.sas7bdat` files. The write functions available are `write_xport`, `write_sav`, and `write_dta`. Any "export to SAS" feature must use XPORT format (`.xpt`), which SAS can read, rather than `.sas7bdat`. This affects steps 3 and 4 of the implementation plan.

## Architecture

Standard JupyterLab two-layer extension layout (scaffolded via `copier` from `jupyterlab/extension-template`):

- **`jupyter_sas7bdat/`** — Python package; Jupyter Server extension. Registers REST API handlers under `/jupyter-sas7bdat/`. Uses `pyreadstat` for SAS7BDAT I/O and `pandas` for format conversions.
- **`src/`** — TypeScript/React frontend built with `@jupyterlab/builder`. Provides the JupyterLab UI (file-browser integration, conversion dialog, dataset viewer).
- **`pyproject.toml`** — package metadata, build system, and extension registration.

## Commands

### Setup
```bash
pip install -e ".[dev,test]"
# Extension config must go in ~/.jupyter/jupyter_server_config.d/ (not --sys-prefix)
mkdir -p ~/.jupyter/jupyter_server_config.d
cp jupyter-config/server-config/jupyter_sas7bdat.json ~/.jupyter/jupyter_server_config.d/
jupyter server extension list   # verify: jupyter_sas7bdat 0.1.0 OK
```

### Build frontend
```bash
jlpm install
jlpm build      # production
jlpm watch      # dev incremental rebuild
```

### Run (development)
```bash
jupyter lab --autoreload
```

### Tests
```bash
pytest                                          # all server-side tests
pytest jupyter_sas7bdat/tests/test_routes.py   # single file
jlpm test                                       # frontend (Jest)
```

### Lint / type-check
```bash
ruff check .
mypy jupyter_sas7bdat/ --ignore-missing-imports
jlpm lint
```

## Testing conventions

**Do not use `@pytest.mark.asyncio`** on tests that use `jp_fetch` or any pytest-jupyter server fixtures. pytest-jupyter registers its own `pytest_pyfunc_call` hook that runs async test functions via `loop.run_until_complete()` on the same event loop the HTTP test server was created in. Adding `@pytest.mark.asyncio` routes the test through pytest-asyncio's loop instead, causing cross-loop `HTTPTimeoutError` timeouts. Write handler tests as plain `async def` with no decorator.

The test server loads all globally-enabled Jupyter extensions by default. `conftest.py` explicitly disables `jupyter_lsp`, `jupyterlab`, and `notebook_shim` to keep test startup fast.

## pyreadstat metadata fields

When reading a `.sas7bdat` file, the `meta` object returned by `pyreadstat.read_sas7bdat()` has:
- `meta.column_names_to_labels` — `dict[str, str | None]` mapping column name → SAS label
- `meta.original_variable_types` — `dict[str, str | None]` mapping column name → SAS format string (e.g. `"BEST"`, `"$"`, `"MMDDYY"`)
- `meta.column_names`, `meta.column_labels` — parallel lists (use `column_names_to_labels` dict instead)

Note: `column_labels_formatted` does **not** exist — use `column_names_to_labels`.

## REST API

All handlers live under `/jupyter-sas7bdat/`. Paths in query params / request bodies are resolved relative to `server_root_dir` and validated against path traversal.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/jupyter-sas7bdat/read` | Read SAS7BDAT; params: `path`, `offset` (default 0), `limit` (default 100) |
