"""Flask application entry point."""
from flask import Flask
from flask_cors import CORS

from routes.maps import maps_bp
from routes.annotations import annotations_bp

app = Flask(__name__)
CORS(app)  # Allow React dev server to make requests

# Register blueprints
app.register_blueprint(maps_bp, url_prefix="/api/maps")
app.register_blueprint(annotations_bp, url_prefix="/api/maps")


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(debug=True, port=5000)
