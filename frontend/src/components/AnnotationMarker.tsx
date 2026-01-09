import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Annotation, AnnotationType } from '../types';
import { useAnnotationStore } from '../stores/annotationStore';

interface AnnotationMarkerProps {
    annotation: Annotation;
}

const ICONS: Record<AnnotationType, string> = {
    city: '🏛️',
    person: '👤',
    event: '⚡',
    note: '📝',
};

// Create a custom divIcon for each annotation type
function createMarkerIcon(type: AnnotationType, isSelected: boolean): L.DivIcon {
    return L.divIcon({
        className: '',
        html: `<div class="annotation-marker ${type} ${isSelected ? 'selected' : ''}">${ICONS[type]}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
}

export function AnnotationMarker({ annotation }: AnnotationMarkerProps) {
    const selectedId = useAnnotationStore((s) => s.selectedAnnotationId);
    const selectAnnotation = useAnnotationStore((s) => s.selectAnnotation);
    const openEditForm = useAnnotationStore((s) => s.openEditForm);
    const deleteAnnotation = useAnnotationStore((s) => s.deleteAnnotation);

    const isSelected = selectedId === annotation.id;

    const icon = useMemo(
        () => createMarkerIcon(annotation.type, isSelected),
        [annotation.type, isSelected]
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
            eventHandlers={{
                click: () => selectAnnotation(annotation.id),
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
        </Marker>
    );
}
