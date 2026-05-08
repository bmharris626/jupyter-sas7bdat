import json
import shutil

import pandas as pd
import pyreadstat
import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _write_fixture(path, df, column_labels=None):
    """Write a minimal SAS7BDAT-readable fixture via write_xport for testing,
    or save directly via pyreadstat if write_sas7bdat becomes available.
    Since pyreadstat only reads SAS7BDAT, we create a fixture using
    write_xport and verify our handler against a pre-built test file."""
    # write_xport is SAS Transport; for unit tests we create a tiny sas7bdat
    # by copying a known-good file from the pandas test suite if available,
    # otherwise we skip the test.
    pass


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def sas_fixture(tmp_path, jp_root_dir):
    """Copy a small real SAS7BDAT file into jp_root_dir for handler tests."""
    import os
    import urllib.request

    src = "/tmp/test1.sas7bdat"
    if not os.path.exists(src):
        url = (
            "https://github.com/pandas-dev/pandas/raw/main"
            "/pandas/tests/io/sas/data/test1.sas7bdat"
        )
        urllib.request.urlretrieve(url, src)

    dest = jp_root_dir / "test1.sas7bdat"
    shutil.copy(src, dest)
    return dest


@pytest.fixture
def labeled_fixture(tmp_path, jp_root_dir):
    """A minimal SAS7BDAT fixture with known column labels, written via
    pyreadstat.write_xport then re-read as xport — used only to verify
    that the metadata struct behaves as expected.

    For the actual /read handler test we use sas_fixture (a real sas7bdat)."""
    df = pd.DataFrame({"score": [1.0, 2.0], "label": ["a", "b"]})
    xpt_path = str(tmp_path / "labeled.xpt")
    pyreadstat.write_xport(df, xpt_path, column_labels=["Score value", "Label text"])
    return xpt_path, df


# ---------------------------------------------------------------------------
# Handler tests
# ---------------------------------------------------------------------------

async def test_read_returns_structure(jp_fetch, sas_fixture):
    response = await jp_fetch("jupyter-sas7bdat", "read",
                              params={"path": "test1.sas7bdat"})
    assert response.code == 200
    payload = json.loads(response.body)

    assert "columns" in payload
    assert "rows" in payload
    assert "total_rows" in payload
    assert payload["total_rows"] == 10   # test1.sas7bdat has 10 rows
    assert len(payload["columns"]) == 100


async def test_read_column_metadata(jp_fetch, sas_fixture):
    response = await jp_fetch("jupyter-sas7bdat", "read",
                              params={"path": "test1.sas7bdat"})
    payload = json.loads(response.body)

    col = next(c for c in payload["columns"] if c["name"] == "Column4")
    assert col["format"] == "MMDDYY"

    str_col = next(c for c in payload["columns"] if c["name"] == "Column2")
    assert str_col["format"] == "$"


async def test_read_pagination_offset(jp_fetch, sas_fixture):
    r1 = await jp_fetch("jupyter-sas7bdat", "read",
                        params={"path": "test1.sas7bdat", "limit": "5"})
    r2 = await jp_fetch("jupyter-sas7bdat", "read",
                        params={"path": "test1.sas7bdat", "offset": "5", "limit": "5"})

    p1 = json.loads(r1.body)
    p2 = json.loads(r2.body)

    assert len(p1["rows"]) == 5
    assert len(p2["rows"]) == 5
    # Pages must not overlap: first row of page 2 != first row of page 1
    assert p1["rows"][0] != p2["rows"][0]
    assert p1["total_rows"] == p2["total_rows"] == 10


async def test_read_missing_file_returns_404(jp_fetch):
    response = await jp_fetch(
        "jupyter-sas7bdat", "read",
        params={"path": "nonexistent.sas7bdat"},
        raise_error=False,
    )
    assert response.code == 404


async def test_read_path_traversal_rejected(jp_fetch):
    response = await jp_fetch(
        "jupyter-sas7bdat", "read",
        params={"path": "../../etc/passwd"},
        raise_error=False,
    )
    assert response.code == 400
