import os
import sys

# Ensure root directory and backend directory are in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

for p in [backend_dir, root_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.app import app
except Exception:
    try:
        from app import app
    except Exception as e:
        from flask import Flask, jsonify
        app = Flask(__name__)
        @app.route("/api/<path:path>")
        def fallback_err(path):
            return jsonify({"error": "Failed to load backend", "detail": str(e)}), 500

# Vercel WSGI entry point
handler = app
