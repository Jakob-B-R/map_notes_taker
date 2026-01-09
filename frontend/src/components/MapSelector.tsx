import { useState, useRef } from 'react';
import type { MapSummary } from '../types';
import './MapSelector.css';

interface MapSelectorProps {
    maps: MapSummary[];
    onSelectMap: (id: string) => void;
    onCreateMap: (name: string, imagePath: string) => void;
    onDeleteMap: (id: string) => void;
    isLoading: boolean;
}

export function MapSelector({
    maps,
    onSelectMap,
    onCreateMap,
    onDeleteMap,
    isLoading,
}: MapSelectorProps) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newMapName, setNewMapName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create a preview URL for displaying the image
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMapName.trim() || !selectedFile) {
            alert('Please fill in all fields');
            return;
        }
        // For now, use the preview URL as the image path
        // In a production app, you'd upload the file to the server
        onCreateMap(newMapName.trim(), previewUrl);
        setNewMapName('');
        setSelectedFile(null);
        setPreviewUrl('');
        setShowCreateForm(false);
    };

    const handleCancel = () => {
        setShowCreateForm(false);
        setNewMapName('');
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl('');
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Delete map "${name}"? This cannot be undone.`)) {
            onDeleteMap(id);
        }
    };

    if (isLoading) {
        return (
            <div className="map-selector">
                <div className="loading">Loading maps...</div>
            </div>
        );
    }

    return (
        <div className="map-selector">
            <div className="map-selector-header">
                <h1>📍 Map Notes</h1>
                <p>Select a map to annotate or create a new one</p>
            </div>

            <div className="map-list">
                {maps.map((map) => (
                    <div key={map.id} className="map-card" onClick={() => onSelectMap(map.id)}>
                        <div className="map-card-background">
                            <img
                                src={map.image_path}
                                alt=""
                                className="map-card-image"
                                onError={(e) => {
                                    // Hide the image if it fails to load
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div className="map-card-overlay"></div>
                        </div>
                        <div className="map-card-content">
                            <div className="map-card-icon">🗺️</div>
                            <div className="map-card-info">
                                <h3>{map.name}</h3>
                                <span className="map-card-meta">
                                    {map.annotation_count} annotation{map.annotation_count !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <button
                                className="map-card-delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(map.id, map.name);
                                }}
                                title="Delete map"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}

                {maps.length === 0 && (
                    <div className="empty-state">
                        <p>No maps yet. Create one to get started!</p>
                    </div>
                )}
            </div>

            {showCreateForm ? (
                <form className="create-form" onSubmit={handleCreate}>
                    <h3>Create New Map</h3>
                    <input
                        type="text"
                        placeholder="Map name"
                        value={newMapName}
                        onChange={(e) => setNewMapName(e.target.value)}
                        autoFocus
                    />

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="file-input-hidden"
                    />

                    <div className="file-picker" onClick={handleBrowseClick}>
                        {selectedFile ? (
                            <div className="file-selected">
                                {previewUrl && (
                                    <img src={previewUrl} alt="Preview" className="file-preview" />
                                )}
                                <span className="file-name">{selectedFile.name}</span>
                            </div>
                        ) : (
                            <div className="file-placeholder">
                                <span className="file-icon">📁</span>
                                <span>Click to select an image file</span>
                            </div>
                        )}
                    </div>

                    <div className="create-form-actions">
                        <button type="button" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Create
                        </button>
                    </div>
                </form>
            ) : (
                <button className="create-btn" onClick={() => setShowCreateForm(true)}>
                    + Create New Map
                </button>
            )}
        </div>
    );
}
