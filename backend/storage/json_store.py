"""JSON file-based storage for maps and annotations."""
import json
import os
import uuid
from pathlib import Path
from typing import Optional

from models.schemas import Map, MapCreate, MapUpdate, Annotation, AnnotationCreate, AnnotationUpdate, MapSummary


# Data directory path
DATA_DIR = Path(__file__).parent.parent / "data" / "maps"


def _ensure_data_dir():
    """Ensure the data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _get_map_path(map_id: str) -> Path:
    """Get the path to a map's JSON file."""
    return DATA_DIR / f"{map_id}.json"


def _load_map(map_id: str) -> Optional[Map]:
    """Load a map from disk."""
    path = _get_map_path(map_id)
    if not path.exists():
        return None
    with open(path, "r") as f:
        data = json.load(f)
    return Map(**data)


def _save_map(map_data: Map) -> None:
    """Save a map to disk."""
    _ensure_data_dir()
    path = _get_map_path(map_data.id)
    with open(path, "w") as f:
        json.dump(map_data.model_dump(), f, indent=2)


# ============ Map CRUD ============

def list_maps() -> list[MapSummary]:
    """List all maps with summary info."""
    _ensure_data_dir()
    maps = []
    for path in DATA_DIR.glob("*.json"):
        try:
            with open(path, "r") as f:
                data = json.load(f)
            maps.append(MapSummary(
                id=data["id"],
                name=data["name"],
                image_path=data["image_path"],
                annotation_count=len(data.get("annotations", []))
            ))
        except (json.JSONDecodeError, KeyError):
            continue  # Skip corrupted files
    return maps


def get_map(map_id: str) -> Optional[Map]:
    """Get a single map by ID."""
    return _load_map(map_id)


def create_map(data: MapCreate) -> Map:
    """Create a new map."""
    new_map = Map(
        id=str(uuid.uuid4()),
        name=data.name,
        image_path=data.image_path,
        annotations=[]
    )
    _save_map(new_map)
    return new_map


def update_map(map_id: str, data: MapUpdate) -> Optional[Map]:
    """Update a map's metadata."""
    existing = _load_map(map_id)
    if not existing:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    updated = existing.model_copy(update=update_data)
    _save_map(updated)
    return updated


def delete_map(map_id: str) -> bool:
    """Delete a map."""
    path = _get_map_path(map_id)
    if not path.exists():
        return False
    os.remove(path)
    return True


# ============ Annotation CRUD ============

def list_annotations(map_id: str) -> Optional[list[Annotation]]:
    """List all annotations for a map."""
    map_data = _load_map(map_id)
    if not map_data:
        return None
    return map_data.annotations


def get_annotation(map_id: str, annotation_id: str) -> Optional[Annotation]:
    """Get a single annotation."""
    map_data = _load_map(map_id)
    if not map_data:
        return None
    for ann in map_data.annotations:
        if ann.id == annotation_id:
            return ann
    return None


def create_annotation(map_id: str, data: AnnotationCreate) -> Optional[Annotation]:
    """Create a new annotation on a map."""
    map_data = _load_map(map_id)
    if not map_data:
        return None
    
    new_annotation = Annotation(
        id=str(uuid.uuid4()),
        **data.model_dump()
    )
    map_data.annotations.append(new_annotation)
    _save_map(map_data)
    return new_annotation


def update_annotation(map_id: str, annotation_id: str, data: AnnotationUpdate) -> Optional[Annotation]:
    """Update an annotation."""
    map_data = _load_map(map_id)
    if not map_data:
        return None
    
    for i, ann in enumerate(map_data.annotations):
        if ann.id == annotation_id:
            update_data = data.model_dump(exclude_unset=True)
            updated = ann.model_copy(update=update_data)
            map_data.annotations[i] = updated
            _save_map(map_data)
            return updated
    return None


def delete_annotation(map_id: str, annotation_id: str) -> bool:
    """Delete an annotation."""
    map_data = _load_map(map_id)
    if not map_data:
        return False
    
    original_len = len(map_data.annotations)
    map_data.annotations = [a for a in map_data.annotations if a.id != annotation_id]
    
    if len(map_data.annotations) == original_len:
        return False
    
    _save_map(map_data)
    return True
