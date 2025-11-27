#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
import subprocess, json, urllib.parse, shlex

ALLOW = {
    '/detach': ['/usr/local/bin/masso-detach'],
    '/attach': ['/usr/local/bin/masso-attach'],
    '/commit': ['/usr/local/bin/masso-commit'],
}
SRC_DIR = '/opt/filebrowser/masso'
SIG_FILE = '/opt/masso_images/.last_commit.sig'

def current_signature():
    try:
        cmd = "find . -type f -printf '%P\t%T@\t%s\n' | LC_ALL=C sort | sha256sum | awk '{print $1}'"
        out = subprocess.check_output(['bash','-lc', f"cd {shlex.quote(SRC_DIR)} 2>/dev/null || mkdir -p {shlex.quote(SRC_DIR)}; {cmd}"],
                                      text=True).strip()
        return out if out else '0'*64
    except Exception:
        return '0'*64

def last_signature():
    try:
        with open(SIG_FILE,'r') as f: return f.read().strip()
    except Exception:
        return None

class H(BaseHTTPRequestHandler):
    def do_GET(self): self.route()
    def do_POST(self): self.route()

    def route(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/status':
            now = current_signature()
            last = last_signature()
            dirty = (last is None) or (now != last)
            body = json.dumps({'dirty': dirty, 'current': now, 'last': last or ''}).encode()
            self.send_response(200); self.send_header('Content-Type','application/json'); self.end_headers()
            self.wfile.write(body); return

        if path in ALLOW:
            try:
                subprocess.run(['sudo'] + ALLOW[path], check=True)
                self.send_response(200); self.end_headers(); self.wfile.write(b'OK')
            except subprocess.CalledProcessError as e:
                self.send_response(500); self.end_headers(); self.wfile.write(str(e).encode())
            return

        self.send_response(404); self.end_headers()

    def log_message(self, *a, **k): return

if __name__ == '__main__':
    HTTPServer(('0.0.0.0', 8090), H).serve_forever()
