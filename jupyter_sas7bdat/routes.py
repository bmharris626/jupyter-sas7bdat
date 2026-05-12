import asyncio
import json
import os
from pathlib import Path
from typing import Any

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import pyreadstat
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado


CONVERT_FORMATS = {"csv", "tsv", "json", "parquet", "xpt"}


def _resolve_path(root_dir: str, user_path: str) -> Path:
    """Resolve user_path under root_dir, raising 400 on traversal attempts.

    Uses normpath (not resolve) so that symlinks inside root that point
    outside are still allowed — prevents ../traversal without blocking
    legitimate admin-configured symlinks.
    """
    root = Path(root_dir).resolve()
    p = Path(user_path)
    normalized = Path(os.path.normpath(p if p.is_absolute() else root / user_path))
    if normalized != root and not str(normalized).startswith(str(root) + os.sep):
        raise tornado.web.HTTPError(400, "Path outside root directory")
    return normalized


def _read_sas7bdat_raw(path: Path):
    try:
        return pyreadstat.read_sas7bdat(str(path))
    except UnicodeDecodeError:
        return pyreadstat.read_sas7bdat(str(path), encoding="latin-1")


def _read_sas7bdat(path: Path) -> tuple[pd.DataFrame, dict[str, Any]]:
    df, meta = _read_sas7bdat_raw(path)
    return df, {
        "labels": meta.column_names_to_labels,
        "formats": meta.original_variable_types,
    }


def _read_tabular(path: Path) -> tuple[pd.DataFrame, dict[str, Any]]:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        return pd.read_csv(path), {}
    if suffix == ".tsv":
        return pd.read_csv(path, sep="\t"), {}
    if suffix == ".json":
        return pd.read_json(path), {}
    if suffix == ".parquet":
        table = pq.read_table(path)
        labels: dict[str, str] = {}
        formats: dict[str, str] = {}
        for field in table.schema:
            if field.metadata is None:
                continue
            label = field.metadata.get(b"sas_label")
            fmt = field.metadata.get(b"sas_format")
            if label is not None:
                labels[field.name] = label.decode("utf-8")
            if fmt is not None:
                formats[field.name] = fmt.decode("utf-8")
        return table.to_pandas(), {"labels": labels, "formats": formats}
    raise tornado.web.HTTPError(400, f"Unsupported source format: {suffix}")


def _write_dataframe(
    df: pd.DataFrame,
    dst: Path,
    output_format: str,
    metadata: dict[str, Any],
) -> None:
    if output_format == "csv":
        df.to_csv(dst, index=False)
        return
    if output_format == "tsv":
        df.to_csv(dst, sep="\t", index=False)
        return
    if output_format == "json":
        df.to_json(dst, orient="records", date_format="iso")
        return
    if output_format == "parquet":
        _write_parquet(df, dst, metadata)
        return
    if output_format == "xpt":
        labels = metadata.get("labels", {})
        column_labels = [labels.get(column) or "" for column in df.columns]
        pyreadstat.write_xport(df, str(dst), column_labels=column_labels)
        return
    raise tornado.web.HTTPError(400, f"Unsupported output format: {output_format}")


def _write_parquet(df: pd.DataFrame, dst: Path, metadata: dict[str, Any]) -> None:
    labels = metadata.get("labels", {})
    formats = metadata.get("formats", {})
    table = pa.Table.from_pandas(df, preserve_index=False)
    fields = []
    for field in table.schema:
        field_metadata = dict(field.metadata or {})
        label = labels.get(field.name)
        fmt = formats.get(field.name)
        if label:
            field_metadata[b"sas_label"] = str(label).encode("utf-8")
        if fmt:
            field_metadata[b"sas_format"] = str(fmt).encode("utf-8")
        fields.append(field.with_metadata(field_metadata or None))
    pq.write_table(table.cast(pa.schema(fields, metadata=table.schema.metadata)), dst)


def _convert_file(src: Path, dst: Path, output_format: str) -> None:
    if src.suffix.lower() == ".sas7bdat":
        df, metadata = _read_sas7bdat(src)
    else:
        df, metadata = _read_tabular(src)
    _write_dataframe(df, dst, output_format, metadata)


class SettingsHandler(APIHandler):
    @tornado.web.authenticated
    async def get(self):
        self.finish(json.dumps({
            "server_root": self.settings["server_root_dir"]
        }))


class ReadHandler(APIHandler):
    @tornado.web.authenticated
    async def get(self):
        path = self.get_argument("path")
        offset = int(self.get_argument("offset", "0"))
        limit = int(self.get_argument("limit", "100"))

        target = _resolve_path(self.settings["server_root_dir"], path)
        if not target.exists():
            raise tornado.web.HTTPError(404, f"File not found: {path}")

        df, meta = await asyncio.to_thread(_read_sas7bdat_raw, target)

        columns = []
        for col in df.columns:
            columns.append({
                "name": col,
                "label": meta.column_names_to_labels.get(col) or "",
                "type": str(df[col].dtype),
                "format": meta.original_variable_types.get(col) or "",
            })

        page = df.iloc[offset: offset + limit]
        rows = json.loads(page.to_json(orient="records", date_format="iso"))

        self.finish(json.dumps({
            "columns": columns,
            "rows": rows,
            "total_rows": len(df),
            "offset": offset,
            "limit": limit,
        }))


class ConvertHandler(APIHandler):
    @tornado.web.authenticated
    async def post(self):
        body = self.get_json_body()

        if not isinstance(body, dict):
            raise tornado.web.HTTPError(400, "JSON body must be an object")

        src_path = body.get("src")
        dst_path = body.get("dst")
        output_format = body.get("format")
        if not all(isinstance(value, str) for value in (src_path, dst_path, output_format)):
            raise tornado.web.HTTPError(400, "Body must include string src, dst, and format")

        output_format = output_format.lower()
        if output_format not in CONVERT_FORMATS:
            raise tornado.web.HTTPError(400, f"Unsupported output format: {output_format}")

        root_dir = self.settings["server_root_dir"]
        src = _resolve_path(root_dir, src_path)
        dst = _resolve_path(root_dir, dst_path)
        if not src.exists():
            raise tornado.web.HTTPError(404, f"File not found: {src_path}")
        if not dst.parent.exists():
            raise tornado.web.HTTPError(404, f"Output directory not found: {dst_path}")

        await asyncio.to_thread(_convert_file, src, dst, output_format)
        self.finish(json.dumps({"path": dst_path, "format": output_format}))


def setup_route_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    handlers = [
        (url_path_join(base_url, "jupyter-sas7bdat", "settings"), SettingsHandler),
        (url_path_join(base_url, "jupyter-sas7bdat", "read"), ReadHandler),
        (url_path_join(base_url, "jupyter-sas7bdat", "convert"), ConvertHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
