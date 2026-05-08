import asyncio
import json
from pathlib import Path

import pyreadstat
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado


def _resolve_path(root_dir: str, user_path: str) -> Path:
    """Resolve user_path under root_dir, raising 400 on traversal attempts."""
    root = Path(root_dir).resolve()
    target = (root / user_path).resolve()
    if not target.is_relative_to(root):
        raise tornado.web.HTTPError(400, "Path outside root directory")
    return target


class ReadHandler(APIHandler):
    @tornado.web.authenticated
    async def get(self):
        path = self.get_argument("path")
        offset = int(self.get_argument("offset", "0"))
        limit = int(self.get_argument("limit", "100"))

        target = _resolve_path(self.settings["server_root_dir"], path)
        if not target.exists():
            raise tornado.web.HTTPError(404, f"File not found: {path}")

        df, meta = await asyncio.to_thread(
            pyreadstat.read_sas7bdat, str(target)
        )

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


def setup_route_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    handlers = [
        (url_path_join(base_url, "jupyter-sas7bdat", "read"), ReadHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
