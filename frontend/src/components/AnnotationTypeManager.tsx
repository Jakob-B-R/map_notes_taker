import { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import { useAnnotationTypesStore } from '../stores/annotationTypesStore';
import { useAnnotationStore } from '../stores/annotationStore';
import './AnnotationTypeManager.css';


interface AnnotationTypeManagerProps {
    onClose: () => void;
}

export function AnnotationTypeManager({ onClose }: AnnotationTypeManagerProps) {
    const types = useAnnotationTypesStore((s) => s.types);
    const addType = useAnnotationTypesStore((s) => s.addType);
    const updateType = useAnnotationTypesStore((s) => s.updateType);
    const deleteType = useAnnotationTypesStore((s) => s.deleteType);

    const annotations = useAnnotationStore((s) => s.annotations);
    const convertAnnotationsType = useAnnotationStore((s) => s.convertAnnotationsType);

    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeIcon, setNewTypeIcon] = useState('📍');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editIcon, setEditIcon] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState<'new' | 'edit' | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddType = () => {
        if (!newTypeName.trim()) {
            alert('Please enter a type name');
            return;
        }
        addType(newTypeName.trim(), newTypeIcon);
        setNewTypeName('');
        setNewTypeIcon('📍');
    };

    const handleStartEdit = (typeId: string) => {
        const type = types.find((t) => t.id === typeId);
        if (type) {
            setEditingId(typeId);
            setEditName(type.name);
            setEditIcon(type.icon);
        }
    };

    const handleSaveEdit = () => {
        if (editingId && editName.trim()) {
            updateType(editingId, { name: editName.trim(), icon: editIcon });
            setEditingId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleDeleteType = (typeId: string) => {
        const type = types.find((t) => t.id === typeId);
        if (!type) return;

        if (type.isDefault) {
            alert('Cannot delete default types');
            return;
        }

        const affectedCount = annotations.filter((a) => a.type === typeId).length;

        if (affectedCount > 0) {
            const confirmed = confirm(
                `This type has ${affectedCount} annotation${affectedCount > 1 ? 's' : ''}. ` +
                `Deleting it will convert them to "Event" type. Continue?`
            );
            if (!confirmed) return;

            // Convert annotations to event type
            convertAnnotationsType(typeId, 'event');
        }

        deleteType(typeId);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        if (showEmojiPicker === 'new') {
            setNewTypeIcon(emojiData.emoji);
        } else if (showEmojiPicker === 'edit') {
            setEditIcon(emojiData.emoji);
        }
        setShowEmojiPicker(null);
    };


    return (
        <div className="type-manager-overlay" onClick={onClose}>
            <div className="type-manager" onClick={(e) => e.stopPropagation()}>
                <div className="type-manager-header">
                    <h2>Manage Annotation Types</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="type-manager-content">
                    {/* Add new type */}
                    <div className="add-type-section">
                        <h3>Add New Type</h3>
                        <div className="add-type-form">
                            <div className="emoji-picker-container" ref={showEmojiPicker === 'new' ? pickerRef : null}>
                                <button
                                    type="button"
                                    className="emoji-selector-btn"
                                    onClick={() => setShowEmojiPicker(showEmojiPicker === 'new' ? null : 'new')}
                                >
                                    {newTypeIcon}
                                </button>
                                {showEmojiPicker === 'new' && (
                                    <div className="emoji-picker-popup">
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            theme={Theme.DARK}
                                            autoFocusSearch={false}
                                            lazyLoadEmojis={true}
                                            width={350}
                                            height={450}
                                        />
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Type name..."
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                maxLength={50}
                            />
                            <button
                                type="button"
                                className="add-btn"
                                onClick={handleAddType}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Type list */}
                    <div className="types-list">
                        <h3>Existing Types</h3>
                        {types.map((type) => (
                            <div key={type.id} className="type-row">
                                {editingId === type.id ? (
                                    <>
                                        <div className="emoji-picker-container" ref={showEmojiPicker === 'edit' ? pickerRef : null}>
                                            <button
                                                type="button"
                                                className="emoji-selector-btn"
                                                onClick={() => setShowEmojiPicker(showEmojiPicker === 'edit' ? null : 'edit')}
                                            >
                                                {editIcon}
                                            </button>
                                            {showEmojiPicker === 'edit' && (
                                                <div className="emoji-picker-popup">
                                                    <EmojiPicker
                                                        onEmojiClick={handleEmojiClick}
                                                        theme={Theme.DARK}
                                                        autoFocusSearch={false}
                                                        lazyLoadEmojis={true}
                                                        width={350}
                                                        height={450}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            maxLength={50}
                                            autoFocus
                                        />
                                        <button className="save-btn" onClick={handleSaveEdit}>
                                            ✓
                                        </button>
                                        <button className="cancel-btn" onClick={handleCancelEdit}>
                                            ✕
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="type-icon">{type.icon}</span>
                                        <span className="type-name">{type.name}</span>
                                        {type.isDefault && <span className="default-badge">Default</span>}
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleStartEdit(type.id)}
                                        >
                                            ✏️
                                        </button>
                                        {!type.isDefault && (
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteType(type.id)}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
