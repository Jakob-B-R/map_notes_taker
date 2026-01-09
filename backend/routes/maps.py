"""Map CRUD API routes."""
from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from models.schemas import MapCreate, MapUpdate
from storage import json_store

maps_bp = Blueprint("maps", __name__)


@maps_bp.route("", methods=["GET"])
def list_maps():
    """List all maps."""
    maps = json_store.list_maps()
    return jsonify([m.model_dump() for m in maps])


@maps_bp.route("", methods=["POST"])
def create_map():
    """Create a new map."""
    try:
        data = MapCreate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    
    new_map = json_store.create_map(data)
    return jsonify(new_map.model_dump()), 201


@maps_bp.route("/<map_id>", methods=["GET"])
def get_map(map_id: str):
    """Get a single map with its annotations."""
    map_data = json_store.get_map(map_id)
    if not map_data:
        return jsonify({"error": "Map not found"}), 404
    return jsonify(map_data.model_dump())


@maps_bp.route("/<map_id>", methods=["PUT"])
def update_map(map_id: str):
    """Update a map's metadata."""
    try:
        data = MapUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    
    updated = json_store.update_map(map_id, data)
    if not updated:
        return jsonify({"error": "Map not found"}), 404
    return jsonify(updated.model_dump())


@maps_bp.route("/<map_id>", methods=["DELETE"])
def delete_map(map_id: str):
    """Delete a map."""
    if not json_store.delete_map(map_id):
        return jsonify({"error": "Map not found"}), 404
    return "", 204
