import { useState, useMemo, useRef, useCallback } from 'react';
import { useAnnotationStore } from '../stores/annotationStore';
import { useAnnotationTypesStore } from '../stores/annotationTypesStore';
import { AnnotationTypeManager } from './AnnotationTypeManager';
import './AnnotationSidebar.css';

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 280;

export function AnnotationSidebar() {
    const annotations = useAnnotationStore((s) => s.annotations);
    const openEditForm = useAnnotationStore((s) => s.openEditForm);
    const selectAnnotation = useAnnotationStore((s) => s.selectAnnotation);
    const selectedAnnotationId = useAnnotationStore((s) => s.selectedAnnotationId);
    const types = useAnnotationTypesStore((s) => s.types);

    const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['city', 'person', 'event', 'note']));
    const [isTypeManagerOpen, setIsTypeManagerOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [width, setWidth] = useState(DEFAULT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Handle drag resize
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const startWidth = width;

        const handleMouseMove = (e: MouseEvent) => {
            const delta = e.clientX - startX;
            const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [width]);

    // Group annotations by type and sort alphabetically
    const groupedAnnotations = useMemo(() => {
        const groups: Record<string, typeof annotations> = {};
        for (const type of types) {
            groups[type.id] = [];
        }
        for (const ann of annotations) {
            if (groups[ann.type]) {
                groups[ann.type].push(ann);
            } else {
                // Unknown type - group under 'note' as fallback
                groups['note'] = groups['note'] || [];
                groups['note'].push(ann);
            }
        }
        // Sort alphabetically by title
        for (const typeId of Object.keys(groups)) {
            groups[typeId].sort((a, b) => a.title.localeCompare(b.title));
        }
        return groups;
    }, [annotations, types]);

    const toggleType = (typeId: string) => {
        setExpandedTypes((prev) => {
            const next = new Set(prev);
            if (next.has(typeId)) {
                next.delete(typeId);
            } else {
                next.add(typeId);
            }
            return next;
        });
    };

    const handleAnnotationClick = (annotationId: string) => {
        selectAnnotation(annotationId);
        openEditForm(annotationId);
    };

    const toggleCollapsed = () => {
        setIsCollapsed(!isCollapsed);
    };

    if (isCollapsed) {
        return (
            <aside className="annotation-sidebar collapsed" ref={sidebarRef}>
                <button className="collapse-toggle" onClick={toggleCollapsed} title="Expand sidebar">
                    ▶
                </button>
            </aside>
        );
    }

    return (
        <aside
            className={`annotation-sidebar ${isResizing ? 'resizing' : ''}`}
            ref={sidebarRef}
            style={{ width: `${width}px`, minWidth: `${width}px` }}
        >
            <div className="sidebar-header">
                <button className="collapse-toggle" onClick={toggleCollapsed} title="Collapse sidebar">
                    ◀
                </button>
                <h2>Annotations</h2>
            </div>

            <div className="sidebar-content">
                {types.map((type) => {
                    const typeAnnotations = groupedAnnotations[type.id] || [];
                    const isExpanded = expandedTypes.has(type.id);

                    return (
                        <div key={type.id} className="type-section">
                            <button
                                className={`type-header ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleType(type.id)}
                            >
                                <span className="type-icon">{type.icon}</span>
                                <span className="type-name">{type.name}</span>
                                <span className="type-count">{typeAnnotations.length}</span>
                                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                            </button>

                            {isExpanded && (
                                <div className="type-annotations">
                                    {typeAnnotations.length === 0 ? (
                                        <div className="empty-type">No annotations</div>
                                    ) : (
                                        typeAnnotations.map((ann) => (
                                            <button
                                                key={ann.id}
                                                className={`annotation-item ${selectedAnnotationId === ann.id ? 'selected' : ''}`}
                                                onClick={() => handleAnnotationClick(ann.id)}
                                            >
                                                <span className="annotation-title">{ann.title}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="sidebar-footer">
                <button
                    className="manage-types-btn"
                    onClick={() => setIsTypeManagerOpen(true)}
                >
                    ⚙️ Manage Types
                </button>
            </div>

            {/* Resize handle */}
            <div
                className="resize-handle"
                onMouseDown={handleMouseDown}
            />

            {isTypeManagerOpen && (
                <AnnotationTypeManager onClose={() => setIsTypeManagerOpen(false)} />
            )}
        </aside>
    );
}
