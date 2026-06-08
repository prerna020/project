from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import json
import mimetypes
import traceback

from pipeline import run_research_pipeline


BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"
HOST = "127.0.0.1"
PORT = 8000


class ResearchHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path).path
        if parsed_path == "/api/health":
            self.send_json({"ok": True, "service": "research-pipeline"})
            return

        file_path = FRONTEND_DIST / "index.html" if parsed_path == "/" else FRONTEND_DIST / parsed_path.lstrip("/")

        if not file_path.exists() or not file_path.is_file():
            self.send_json({"error": "Build the React app first with npm run build inside frontend."}, status=404)
            return

        payload = file_path.read_bytes()
        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        if urlparse(self.path).path != "/api/research":
            self.send_json({"error": "Not found"}, status=404)
            return

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body or b"{}")
            topic = str(data.get("topic", "")).strip()

            if len(topic) < 3:
                self.send_json({"error": "Please enter a research topic with at least 3 characters."}, status=400)
                return

            result = run_research_pipeline(topic)
            self.send_json({"topic": topic, "result": result})
        except Exception as exc:
            self.send_json(
                {
                    "error": str(exc),
                    "details": traceback.format_exc(limit=2),
                },
                status=500,
            )

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def log_message(self, format, *args):
        print("%s - %s" % (self.address_string(), format % args))


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), ResearchHandler)
    print(f"Backend API running at http://{HOST}:{PORT}")
    print("React dev server should run from frontend with npm run dev.")
    server.serve_forever()
