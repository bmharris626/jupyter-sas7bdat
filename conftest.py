import pytest

pytest_plugins = ("pytest_jupyter.jupyter_server", )


@pytest.fixture
def jp_server_config(jp_server_config):
    return {
        "ServerApp": {
            "jpserver_extensions": {
                "jupyter_sas7bdat": True,
                "jupyter_server_terminals": True,
                # Disable heavy extensions that are globally enabled on this machine
                "jupyter_lsp": False,
                "jupyterlab": False,
                "notebook_shim": False,
            }
        }
    }
