# AGENTS.md

## Project Shape
- This is a prebuilt JupyterLab 4 extension with two coupled packages: Python server extension in `jupyter_sas7bdat/` and TypeScript frontend extension in `src/`.
- The extension is intended to open/preview `.sas7bdat` files in JupyterLab and support data conversion workflows. Current server handlers expose reading only; do not document or assume write/convert endpoints unless implemented in `jupyter_sas7bdat/routes.py`.
- The Python package name is `jupyter_sas7bdat`; the npm/labextension name and REST URL namespace are `jupyter-sas7bdat`.
- Server extension registration is in `jupyter_sas7bdat/__init__.py`; REST handlers are wired in `jupyter_sas7bdat/routes.py`.
- Frontend entrypoint is `src/index.ts`; shared server request helper is `src/request.ts`.
- Generated/build outputs are ignored: `lib/`, `jupyter_sas7bdat/labextension/`, `jupyter_sas7bdat/_version.py`, `dist/`, coverage, and Playwright reports.
- SAS I/O goes through `pyreadstat`; `pandas` is used for tabular conversion work.
- `pyreadstat` cannot write SAS7BDAT. It can read `.sas7bdat` and write XPORT `.xpt`, SPSS `.sav`, and Stata `.dta`; any SAS export feature must use XPORT (`.xpt`) rather than claiming native `.sas7bdat` writing.

## Project Workflow
- Use `CHECKLIST.md` as the source of truth for implementation progress. When a task is completed, blocked, removed, or newly discovered, update the checklist in the same change whenever practical.
- Keep checklist entries specific and verifiable; include endpoint names, command names, or test coverage expectations rather than vague progress notes.
- Update `AGENTS.md` when project behavior, architecture, setup, tests, tooling, constraints, or gotchas are discovered or changed. Do not leave newly learned repo-specific guidance only in chat history.
- When `CLAUDE.md` and `AGENTS.md` diverge, verify against the current code before copying instructions, then keep `AGENTS.md` current for future agents.

## Setup And Build
- Use JupyterLab's pinned yarn: `jlpm`. CI and release hooks use `jlpm`, not plain `yarn`.
- Development install: `pip install --editable ".[dev,test]"`, then `jupyter labextension develop . --overwrite`, then `jupyter server extension enable jupyter_sas7bdat`.
- If manual server config is needed for development, put `jupyter-config/server-config/jupyter_sas7bdat.json` under `~/.jupyter/jupyter_server_config.d/`; avoid relying on `--sys-prefix` for this repo's local config note.
- Rebuild frontend after TypeScript/CSS changes with `jlpm build`; production/package build uses `jlpm build:prod`.
- Incremental frontend development can use `jlpm watch`; run JupyterLab for local development with `jupyter lab --autoreload`.
- Editable Python builds use the hatch Jupyter builder command `install:extension`, which writes the labextension under `jupyter_sas7bdat/labextension`.

## Verification Commands
- CI frontend lint sequence: `jlpm` then `jlpm run lint:check`.
- Frontend tests: `jlpm test` or focused Jest patterns with `jlpm jest src/__tests__/jupyter_sas7bdat.spec.ts`.
- Server tests: `python -m pip install .[test]` then `pytest -vv -r ap --cov jupyter_sas7bdat`.
- A focused server test can target the package test file directly, for example `pytest jupyter_sas7bdat/tests/test_routes.py -vv`.
- Python lint/type checks are `ruff check .` and `mypy jupyter_sas7bdat/ --ignore-missing-imports`.
- Frontend lint fix command is `jlpm lint`; check-only CI command remains `jlpm run lint:check`.
- Build/package smoke test used by CI: after `python -m pip install .[test]`, run `jupyter server extension list`, `jupyter labextension list`, and `python -m jupyterlab.browser_check`.
- Package build: `pip install build`, `jlpm clean:all`, then `python -m build`.

## Test Gotchas
- Python tests live under `jupyter_sas7bdat/tests/`, not a root `tests/` directory.
- `test_routes.py` fetches a real SAS7BDAT fixture from pandas GitHub into `/tmp/test1.sas7bdat` if it is not already present, so first run may need network access.
- Do not use `@pytest.mark.asyncio` on tests that use `jp_fetch` or other pytest-jupyter server fixtures. pytest-jupyter runs async tests on the same event loop as the HTTP test server; pytest-asyncio can move them to a different loop and cause `HTTPTimeoutError` timeouts.
- The test server loads globally enabled Jupyter extensions by default. Root `conftest.py` explicitly disables `jupyter_lsp`, `jupyterlab`, and `notebook_shim` to keep startup fast.
- Jest only matches `src/.*/.*.spec.ts[x]?$`; tests outside that shape will not run unless config changes.
- Integration tests are in `ui-tests/` and require a built production extension first: root `jlpm install && jlpm build:prod`, then in `ui-tests` run `jlpm install`, `jlpm playwright install`, and `jlpm playwright test`.
- `ui-tests/playwright.config.js` starts JupyterLab with `jlpm start` from `ui-tests/`, which maps to `jupyter lab --config jupyter_server_test_config.py`.

## pyreadstat Notes
- For `pyreadstat.read_sas7bdat()`, use `meta.column_names_to_labels` for `dict[str, str | None]` column-label lookup.
- Use `meta.original_variable_types` for SAS format strings such as `BEST`, `$`, or `MMDDYY`.
- `meta.column_names` and `meta.column_labels` are parallel lists; prefer `column_names_to_labels` when mapping names to labels.
- `column_labels_formatted` is not a valid metadata field.

## REST API
- All server handlers are under `/jupyter-sas7bdat/` and should resolve user-supplied paths relative to `server_root_dir` with traversal checks.
- Current route: `GET /jupyter-sas7bdat/read` with query params `path`, `offset` defaulting to `0`, and `limit` defaulting to `100`.

## Style And Tooling
- TypeScript is strict (`noImplicitAny`, `noUnusedLocals`, `strictNullChecks`) and emits compiled files to `lib/`.
- ESLint enforces interface names starting with `I`, single quotes, `curly: all`, `eqeqeq`, and `prefer-arrow-callback`; it ignores `ui-tests`, `src/__tests__`, JS files, and generated outputs.
- Prettier settings are single quotes, no trailing commas, `arrowParens: avoid`, and package.json has `tabWidth: 4`.
- Stylelint only checks `style/**/*.css`; keep JupyterLab CSS selector names compatible with `selector-class-pattern`.

## Release Notes
- Version is sourced from `package.json` through `hatch-nodejs-version`; `jupyter_sas7bdat/_version.py` is generated by hatchling.
- Release workflows use Jupyter Releaser; manual version bumps should use `hatch version <new-version>` rather than editing `_version.py`.
