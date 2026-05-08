# jupyter_sas7bdat

[![Github Actions Status](https://github.com/bmharris/jupyter-sas7bdat/workflows/Build/badge.svg)](https://github.com/bmharris/jupyter-sas7bdat/actions/workflows/build.yml)

A JupyterLab extension for reading, writing, and converting SAS7BDAT files

This extension is composed of a Python package named `jupyter_sas7bdat`
for the server extension and a NPM package named `jupyter-sas7bdat`
for the frontend extension.

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install jupyter_sas7bdat
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyter_sas7bdat
```

## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```

## Contributing

If you would like to contribute to this extension, please refer to the [Contributing Guide](CONTRIBUTING.md).
