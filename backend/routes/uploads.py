"""Image upload API routes."""
import os
import uuid
from flask import Blueprint, jsonify, request, send_from_directory, current_app
from werkzeug.utils import secure_filename

uploads_bp = Blueprint("uploads", __name__)

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}

def get_upload_folder():
    """Get the upload folder path, creating it if needed."""
    upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    return upload_folder


def allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@uploads_bp.route("", methods=["POST"])
def upload_image():
    """Upload an image file and return the URL path."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400
    
    # Generate a unique filename to avoid collisions
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{ext}"
    
    upload_folder = get_upload_folder()
    filepath = os.path.join(upload_folder, unique_filename)
    file.save(filepath)
    
    # Return the URL path that can be used to access the image
    return jsonify({
        "filename": unique_filename,
        "url": f"/api/uploads/{unique_filename}"
    }), 201


@uploads_bp.route("/<filename>", methods=["GET"])
def serve_image(filename: str):
    """Serve an uploaded image."""
    filename = secure_filename(filename)
    upload_folder = get_upload_folder()
    return send_from_directory(upload_folder, filename)
