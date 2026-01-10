import { useMemo } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Annotation } from '../types';
import { useAnnotationStore } from '../stores/annotationStore';
import { useAnnotationTypesStore } from '../stores/annotationTypesStore';

interface AnnotationMarkerProps {
    annotation: Annotation;
}

// Create a custom divIcon for each annotation type
function createMarkerIcon(icon: string, typeId: string, isSelected: boolean): L.DivIcon {
    return L.divIcon({
        className: '',
        html: `<div class="annotation-marker ${typeId} ${isSelected ? 'selected' : ''}">${icon}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
}

export function AnnotationMarker({ annotation }: AnnotationMarkerProps) {
    const selectedId = useAnnotationStore((s) => s.selectedAnnotationId);
    const selectAnnotation = useAnnotationStore((s) => s.selectAnnotation);
    const openEditForm = useAnnotationStore((s) => s.openEditForm);
    const deleteAnnotation = useAnnotationStore((s) => s.deleteAnnotation);
    const updateAnnotation = useAnnotationStore((s) => s.updateAnnotation);
    const getTypeIcon = useAnnotationTypesStore((s) => s.getTypeIcon);

    const isSelected = selectedId === annotation.id;
    const typeIcon = getTypeIcon(annotation.type);

    const icon = useMemo(
        () => createMarkerIcon(typeIcon, annotation.type, isSelected),
        [typeIcon, annotation.type, isSelected]
    );

    const handleEdit = () => {
        openEditForm(annotation.id);
    };

    const handleDelete = () => {
        if (confirm('Delete this annotation?')) {
            deleteAnnotation(annotation.id);
        }
    };

    return (
        <Marker
            position={[annotation.y, annotation.x]}
            icon={icon}
            draggable={true}
            eventHandlers={{
                click: () => selectAnnotation(annotation.id),
                dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    updateAnnotation(annotation.id, {
                        x: position.lng,
                        y: position.lat,
                    });
                },
            }}
        >
            <Popup>
                <div className="annotation-popup">
                    <h3>{annotation.title}</h3>
                    {annotation.description && <p>{annotation.description}</p>}
                    <div className="annotation-popup-actions">
                        <button className="btn-edit" onClick={handleEdit}>
                            Edit
                        </button>
                        <button className="btn-delete" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <span className="annotation-tooltip-content">{annotation.title}</span>
            </Tooltip>
        </Marker>
    );
}
