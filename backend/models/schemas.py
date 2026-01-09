"""Pydantic models for data validation."""
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class AnnotationType(str, Enum):
    CITY = "city"
    PERSON = "person"
    EVENT = "event"
    NOTE = "note"


class AnnotationBase(BaseModel):
    """Base annotation model for creation/updates."""
    type: AnnotationType
    x: float = Field(..., description="X coordinate on the image")
    y: float = Field(..., description="Y coordinate on the image")
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)


class AnnotationCreate(AnnotationBase):
    """Model for creating a new annotation."""
    pass


class AnnotationUpdate(BaseModel):
    """Model for updating an annotation (all fields optional)."""
    type: Optional[AnnotationType] = None
    x: Optional[float] = None
    y: Optional[float] = None
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)


class Annotation(AnnotationBase):
    """Full annotation model with ID."""
    id: str


class MapBase(BaseModel):
    """Base map model."""
    name: str = Field(..., min_length=1, max_length=200)
    image_path: str = Field(..., description="Path to the map image")


class MapCreate(MapBase):
    """Model for creating a new map."""
    pass


class MapUpdate(BaseModel):
    """Model for updating a map (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    image_path: Optional[str] = None


class Map(MapBase):
    """Full map model with ID and annotations."""
    id: str
    annotations: list[Annotation] = Field(default_factory=list)


class MapSummary(BaseModel):
    """Map without annotations, for listing."""
    id: str
    name: str
    image_path: str
    annotation_count: int
