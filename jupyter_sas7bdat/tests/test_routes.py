import json
import shutil

import pandas as pd
import pyarrow.parquet as pq
import pyreadstat
import pytest


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


async def test_convert_sas7bdat_to_csv(jp_fetch, sas_fixture, jp_root_dir):
    response = await jp_fetch(
        "jupyter-sas7bdat", "convert",
        method="POST",
        body=json.dumps({
            "src": "test1.sas7bdat",
            "dst": "test1.csv",
            "format": "csv",
        }),
    )
    payload = json.loads(response.body)

    output = jp_root_dir / "test1.csv"
    converted = pd.read_csv(output)

    assert response.code == 200
    assert payload == {"path": "test1.csv", "format": "csv"}
    assert output.exists()
    assert converted.shape == (10, 100)


async def test_convert_csv_to_xpt(jp_fetch, jp_root_dir):
    source = jp_root_dir / "source.csv"
    expected = pd.DataFrame({"score": [1.0, 2.0], "name": ["a", "b"]})
    expected.to_csv(source, index=False)

    response = await jp_fetch(
        "jupyter-sas7bdat", "convert",
        method="POST",
        body=json.dumps({"src": "source.csv", "dst": "source.xpt", "format": "xpt"}),
    )

    output = jp_root_dir / "source.xpt"
    converted, _ = pyreadstat.read_xport(str(output))

    assert response.code == 200
    assert output.exists()
    pd.testing.assert_frame_equal(converted, expected)


async def test_convert_sas7bdat_to_parquet_stores_sas_metadata(
    jp_fetch, sas_fixture, jp_root_dir
):
    response = await jp_fetch(
        "jupyter-sas7bdat", "convert",
        method="POST",
        body=json.dumps({
            "src": "test1.sas7bdat",
            "dst": "test1.parquet",
            "format": "parquet",
        }),
    )

    table = pq.read_table(jp_root_dir / "test1.parquet")
    column4 = table.schema.field("Column4")

    assert response.code == 200
    assert column4.metadata is not None
    assert column4.metadata[b"sas_format"] == b"MMDDYY"


async def test_convert_rejects_unsupported_format(jp_fetch, sas_fixture):
    response = await jp_fetch(
        "jupyter-sas7bdat", "convert",
        method="POST",
        body=json.dumps({
            "src": "test1.sas7bdat",
            "dst": "test1.xlsx",
            "format": "xlsx",
        }),
        raise_error=False,
    )

    assert response.code == 400


async def test_convert_path_traversal_rejected(jp_fetch, sas_fixture):
    response = await jp_fetch(
        "jupyter-sas7bdat", "convert",
        method="POST",
        body=json.dumps({
            "src": "test1.sas7bdat",
            "dst": "../../tmp/test1.csv",
            "format": "csv",
        }),
        raise_error=False,
    )

    assert response.code == 400
