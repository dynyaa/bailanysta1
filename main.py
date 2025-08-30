#!/usr/bin/env python3
import json
import os
import posixpath
import sys
import threading
from http import HTTPStatus
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote

ROOT_DIR = Path(__file__).parent.resolve()
PUBLIC_DIR = ROOT_DIR / "public"

def _read_index_html():
    """Read index.html from current directory"""
    try:
        with open(ROOT_DIR / "index.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ArtHub - File Not Found</title>
  </head>
  <body>
    <h1>ArtHub Landing Page</h1>
    <p>index.html not found. Please ensure index.html, styles.css, and script.js are in the project root.</p>
  </body>
</html>
"""


def _safe_join(base: Path, *paths: str) -> Path:
    final = base
    for p in paths:
        final = final / p
    final = final.resolve()
    base = base.resolve()
    if not str(final).startswith(str(base)):
        raise PermissionError("Attempted path traversal outside static directory")
    return final


class AppHandler(SimpleHTTPRequestHandler):
    def do_GET(self):  # noqa: N802 (keep name for handler)
        # Serve CSS files
        if self.path == "/styles.css":
            self._serve_static_file("styles.css", "text/css")
            return

        # Serve JavaScript files
        if self.path == "/script.js":
            self._serve_static_file("script.js", "application/javascript")
            return

        # Serve favicon
        if self.path == "/favicon.svg":
            self._serve_static_file("favicon.svg", "image/svg+xml")
            return
        if self.path == "/favicon.ico":
            # Redirect to SVG version
            self.send_response(HTTPStatus.MOVED_PERMANENTLY)
            self.send_header("Location", "/favicon.svg")
            self.end_headers()
            return

        # Static assets under /assets map to ./public
        if self.path.startswith("/assets/"):
            rel = self.path[len("/assets/"):]
            try:
                file_path = _safe_join(PUBLIC_DIR, *unquote(rel).split("/"))
            except Exception:
                self.send_error(HTTPStatus.FORBIDDEN)
                return
            if file_path.is_dir():
                self.send_error(HTTPStatus.NOT_FOUND)
                return
            if not file_path.exists():
                self.send_error(HTTPStatus.NOT_FOUND)
                return
            self._send_file(file_path)
            return

        # Health endpoint
        if self.path == "/health":
            self._send_json({"status": "ok"})
            return

        # Demo API endpoint
        if self.path == "/api/hello":
            self._send_json({"message": "Hello from Python dev server"})
            return

        # Root serves the index page
        if self.path in ("/", "/index.html"):
            index_content = _read_index_html()
            self._send_html(index_content)
            return

        # Fallback 404
        self.send_error(HTTPStatus.NOT_FOUND)

    def do_HEAD(self):  # noqa: N802
        if self.path in ("/", "/index.html"):
            index_content = _read_index_html()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(index_content.encode("utf-8"))))
            self.end_headers()
        else:
            self.send_error(HTTPStatus.NOT_FOUND)

    def log_message(self, format: str, *args):  # noqa: A003 - keep name
        sys.stdout.write("[server] " + (format % args) + "\n")
        sys.stdout.flush()

    def _send_html(self, content: str):
        data = content.encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _send_json(self, obj):
        data = json.dumps(obj).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _send_file(self, path: Path):
        ctype = self.guess_type(str(path))
        try:
            with path.open("rb") as f:
                data = f.read()
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _serve_static_file(self, filename: str, content_type: str):
        """Serve static files from project root"""
        file_path = ROOT_DIR / filename
        if not file_path.exists():
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        try:
            with file_path.open("r", encoding="utf-8") as f:
                content = f.read()
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        data = content.encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)


def run_server(port: int):
    # Ensure public dir exists for predictable static mapping
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    server_address = ("0.0.0.0", port)
    httpd = ThreadingHTTPServer(server_address, AppHandler)

    def _serve():
        httpd.serve_forever(poll_interval=0.5)

    t = threading.Thread(target=_serve, daemon=True)
    t.start()
    print(f"[server] Listening on http://localhost:{port}")

    try:
        t.join()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.shutdown()
        httpd.server_close()
        print("[server] Shutdown complete")


if __name__ == "__main__":
    port_str = os.environ.get("PORT", "3000")
    try:
        port = int(port_str)
    except ValueError:
        port = 3000
    run_server(port)
