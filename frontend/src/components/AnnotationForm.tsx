import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Annotation, AnnotationType } from '../types';
import { useAnnotationStore } from '../stores/annotationStore';
import { useAnnotationTypesStore } from '../stores/annotationTypesStore';
import './AnnotationForm.css';

export function AnnotationForm() {
    const types = useAnnotationTypesStore((s) => s.types);

    const isFormOpen = useAnnotationStore((s) => s.isFormOpen);
    const formMode = useAnnotationStore((s) => s.formMode);
    const pendingPosition = useAnnotationStore((s) => s.pendingPosition);
    const selectedAnnotationId = useAnnotationStore((s) => s.selectedAnnotationId);
    const annotations = useAnnotationStore((s) => s.annotations);
    const addAnnotation = useAnnotationStore((s) => s.addAnnotation);
    const updateAnnotation = useAnnotationStore((s) => s.updateAnnotation);
    const closeForm = useAnnotationStore((s) => s.closeForm);

    const [type, setType] = useState<AnnotationType>('note');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Populate form when editing
    useEffect(() => {
        if (formMode === 'edit' && selectedAnnotationId) {
            const ann = annotations.find((a) => a.id === selectedAnnotationId);
            if (ann) {
                setType(ann.type);
                setTitle(ann.title);
                setDescription(ann.description);
            }
        } else {
            // Reset form for create mode
            setType('note');
            setTitle('');
            setDescription('');
        }
    }, [formMode, selectedAnnotationId, annotations, isFormOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Title is required');
            return;
        }

        if (formMode === 'create' && pendingPosition) {
            const newAnnotation: Annotation = {
                id: uuidv4(),
                type,
                x: pendingPosition.x,
                y: pendingPosition.y,
                title: title.trim(),
                description: description.trim(),
            };
            addAnnotation(newAnnotation);
        } else if (formMode === 'edit' && selectedAnnotationId) {
            updateAnnotation(selectedAnnotationId, {
                type,
                title: title.trim(),
                description: description.trim(),
            });
        }

        closeForm();
    };

    const handleCancel = () => {
        closeForm();
    };

    // Handle escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFormOpen) {
                closeForm();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isFormOpen, closeForm]);

    if (!isFormOpen) {
        return null;
    }

    return (
        <div className="annotation-form-overlay" onClick={handleCancel}>
            <div className="annotation-form" onClick={(e) => e.stopPropagation()}>
                <h2>{formMode === 'create' ? 'New Annotation' : 'Edit Annotation'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Type</label>
                        <div className="type-selector">
                            {types.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    className={`type-btn ${type === t.id ? 'selected' : ''} ${t.id}`}
                                    onClick={() => setType(t.id)}
                                >
                                    <span className="type-icon">{t.icon}</span>
                                    <span className="type-label">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a title..."
                            autoFocus
                            maxLength={200}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                            rows={4}
                            maxLength={2000}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            {formMode === 'create' ? 'Create' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
