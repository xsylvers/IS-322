import http.server
import socketserver
import os
import urllib.request
import urllib.parse
import urllib.error
import json

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path.startswith('/proxy/openai'):
            self.handle_proxy('https://api.openai.com/', '/proxy/openai')
        elif self.path.startswith('/proxy/github'):
            self.handle_proxy('https://api.github.com/', '/proxy/github')
        else:
            self.send_error(405, "Method not allowed")

    def do_PUT(self):
        if self.path.startswith('/proxy/github'):
            self.handle_proxy('https://api.github.com/', '/proxy/github', method='PUT')
        else:
            self.send_error(405, "Method not allowed")

    def handle_proxy(self, target_base, proxy_path, method=None):
        try:
            # Clean up the path to avoid double slashes
            raw_target = self.path[len(proxy_path):].lstrip('/')
            target_url = urllib.parse.urljoin(target_base, raw_target)
            curr_method = method or self.command
            print(f"Proxying {curr_method} request to: {target_url}")
            
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            req = urllib.request.Request(target_url, data=body, method=curr_method)
            
            # Copy important headers
            for key, value in self.headers.items():
                if key.lower() in ['authorization', 'content-type', 'accept']:
                    req.add_header(key, value)

            with urllib.request.urlopen(req) as response:
                self.send_response(response.status)
                for key, value in response.getheaders():
                    if key.lower() not in ['content-encoding', 'transfer-encoding', 'access-control-allow-origin']:
                        self.send_header(key, value)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(response.read())

        except urllib.error.HTTPError as e:
            print(f"Proxy HTTP Error: {e.code} - {e.reason}")
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            print(f"Proxy Generic Error: {e}")
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": str(e)}}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
        self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

print(f"Voice2Blog Proxy Server starting at http://localhost:{PORT}")
print(f"Serving files from: {DIRECTORY}")
print("--- LOGS ---")

class ThreadingSimpleServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

with ThreadingSimpleServer(("", PORT), ProxyHandler) as httpd:
    httpd.allow_reuse_address = True
    httpd.serve_forever()
