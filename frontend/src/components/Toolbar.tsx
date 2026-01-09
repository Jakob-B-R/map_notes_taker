import { useAnnotationStore, undo, redo } from '../stores/annotationStore';
import './Toolbar.css';

interface ToolbarProps {
    mapName: string;
    onSave: () => void;
    onBack: () => void;
    isSaving: boolean;
}

export function Toolbar({ mapName, onSave, onBack, isSaving }: ToolbarProps) {
    const annotations = useAnnotationStore((s) => s.annotations);
    const temporalState = useAnnotationStore.temporal.getState();

    const canUndo = temporalState.pastStates.length > 0;
    const canRedo = temporalState.futureStates.length > 0;

    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <button className="toolbar-btn back-btn" onClick={onBack} title="Back to map list">
                    ← Back
                </button>
                <h1 className="toolbar-title">{mapName}</h1>
                <span className="annotation-count">
                    {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="toolbar-right">
                <button
                    className="toolbar-btn"
                    onClick={() => undo()}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                >
                    ↩ Undo
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => redo()}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    ↪ Redo
                </button>
                <button
                    className="toolbar-btn save-btn"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : '💾 Save'}
                </button>
            </div>
        </div>
    );
}
