# Implementation Checklist

## 1. Scaffold ✅

- [x] Run `copier copy --trust https://github.com/jupyterlab/extension-template .` to generate the official JupyterLab extension skeleton
- [x] Choose package name (`jupyter-sas7bdat`), Python package (`jupyter_sas7bdat`), and initial version
- [x] Verify `jlpm install && jlpm build && pip install -e ".[dev]"` produces a working (empty) extension

## 2. Dependencies ✅

- [x] Add `pyreadstat` and `pandas` to `pyproject.toml` runtime deps
- [x] Add `ruff`, `mypy`, `pandas-stubs` to `[project.optional-dependencies] dev`
- [x] Pin minimum JupyterLab version (already `>=4.0.0,<5` in build system)

## 3. Server extension — SAS7BDAT read ✅

- [x] Handler: `GET /jupyter-sas7bdat/read?path=&offset=&limit=` — returns column metadata + paginated rows
- [x] Preserve column labels (`column_names_to_labels`) and SAS format codes (`original_variable_types`) in response
- [x] Path-traversal protection (resolve under `server_root_dir`)
- [x] Async handler using `asyncio.to_thread` to avoid blocking the event loop
- [x] Tests: structure, column metadata, pagination, 404, path-traversal rejection (5/5 passing)
- [x] `ruff` and `mypy` clean

> **Note:** `pyreadstat` has no `write_sas7bdat`. "Write SAS7BDAT" in step 3 was dropped;
> export/write will be handled in step 4 using XPORT (`.xpt`) format instead.

## 4. Server extension — Format conversion

> ⚠️ Scope needs confirmation: pyreadstat cannot write SAS7BDAT; SAS export will produce `.xpt` (SAS Transport).

- [x] `POST /jupyter-sas7bdat/convert` — accepts `{src, dst, format}` where format ∈ `{csv, tsv, json, parquet, xpt}`
- [x] SAS → other: read via `pyreadstat.read_sas7bdat`, write via pandas
- [x] Other → SAS (XPT): read via pandas, write via `pyreadstat.write_xport`
- [x] Parquet round-trip: store SAS column metadata in Parquet column metadata
- [x] Tests for each conversion direction

## 5. Lab extension — UI

- [x] File browser: register `.sas7bdat` as an openable MIME type
- [x] Dataset viewer: show variable list (name/label/type/format) + scrollable data preview
- [x] Conversion dialog: source path → target format → output path, with a "Convert" action
- [x] Wire dialog into file-browser context menu for `.sas7bdat` files (and CSV/TSV/JSON/Parquet)

## 6. Tests

- [x] Server: pytest tests for the convert handler (each direction) using small fixture files
- [x] Server: round-trip test — write `.xpt`, read back, assert DataFrame equality
- [x] Frontend: Jest unit tests for the conversion dialog component

## 7. Packaging & distribution

- [x] Confirm `jupyter labextension list` shows the extension after install
- [x] Confirm `hatch-jupyter-builder` hook builds frontend as part of `pip install .`
- [x] Test `pip install .` from a clean venv

## 8. Docs / housekeeping

- [x] Update `CLAUDE.md` REST API table as new endpoints are added
- [x] Keep `CHECKLIST.md` current as implementation tasks are completed, blocked, removed, or discovered
- [x] Update `AGENTS.md` when project-specific setup, tooling, architecture, constraints, or gotchas change
- [x] Add a `CHANGELOG.md` entry for 0.1.0
- [x] Tag `v0.1.0` once all above are green
