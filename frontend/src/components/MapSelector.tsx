import { useState } from 'react';
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
    const [newMapImage, setNewMapImage] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMapName.trim() || !newMapImage.trim()) {
            alert('Please fill in all fields');
            return;
        }
        onCreateMap(newMapName.trim(), newMapImage.trim());
        setNewMapName('');
        setNewMapImage('');
        setShowCreateForm(false);
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
                        type="text"
                        placeholder="Image path (e.g., /maps/world.png)"
                        value={newMapImage}
                        onChange={(e) => setNewMapImage(e.target.value)}
                    />
                    <div className="create-form-actions">
                        <button type="button" onClick={() => setShowCreateForm(false)}>
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
