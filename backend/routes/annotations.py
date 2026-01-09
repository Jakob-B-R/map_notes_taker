"""Annotation CRUD API routes."""
from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from models.schemas import AnnotationCreate, AnnotationUpdate
from storage import json_store

annotations_bp = Blueprint("annotations", __name__)


@annotations_bp.route("/<map_id>/annotations", methods=["GET"])
def list_annotations(map_id: str):
    """List all annotations for a map."""
    annotations = json_store.list_annotations(map_id)
    if annotations is None:
        return jsonify({"error": "Map not found"}), 404
    return jsonify([a.model_dump() for a in annotations])


@annotations_bp.route("/<map_id>/annotations", methods=["POST"])
def create_annotation(map_id: str):
    """Create a new annotation on a map."""
    try:
        data = AnnotationCreate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    
    annotation = json_store.create_annotation(map_id, data)
    if not annotation:
        return jsonify({"error": "Map not found"}), 404
    return jsonify(annotation.model_dump()), 201


@annotations_bp.route("/<map_id>/annotations/<annotation_id>", methods=["GET"])
def get_annotation(map_id: str, annotation_id: str):
    """Get a single annotation."""
    annotation = json_store.get_annotation(map_id, annotation_id)
    if not annotation:
        return jsonify({"error": "Annotation not found"}), 404
    return jsonify(annotation.model_dump())


@annotations_bp.route("/<map_id>/annotations/<annotation_id>", methods=["PUT"])
def update_annotation(map_id: str, annotation_id: str):
    """Update an annotation."""
    try:
        data = AnnotationUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    
    updated = json_store.update_annotation(map_id, annotation_id, data)
    if not updated:
        return jsonify({"error": "Annotation not found"}), 404
    return jsonify(updated.model_dump())


@annotations_bp.route("/<map_id>/annotations/<annotation_id>", methods=["DELETE"])
def delete_annotation(map_id: str, annotation_id: str):
    """Delete an annotation."""
    if not json_store.delete_annotation(map_id, annotation_id):
        return jsonify({"error": "Annotation not found"}), 404
    return "", 204
