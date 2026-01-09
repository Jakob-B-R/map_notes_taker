import { useState, useEffect, useCallback } from 'react';
import { MapViewer } from './components/MapViewer';
import { MapSelector } from './components/MapSelector';
import { Toolbar } from './components/Toolbar';
import { AnnotationForm } from './components/AnnotationForm';
import { useAnnotationStore } from './stores/annotationStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import * as api from './api/client';
import type { MapSummary, MapData } from './types';
import './App.css';

// Default image dimensions - in real app, these would be calculated
const DEFAULT_IMAGE_WIDTH = 1920;
const DEFAULT_IMAGE_HEIGHT = 1080;

function App() {
  const [maps, setMaps] = useState<MapSummary[]>([]);
  const [currentMapData, setCurrentMapData] = useState<MapData | null>(null);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadMap = useAnnotationStore((s) => s.loadMap);
  const clearMap = useAnnotationStore((s) => s.clearMap);
  const annotations = useAnnotationStore((s) => s.annotations);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Load maps on mount
  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    setIsLoadingMaps(true);
    try {
      const data = await api.fetchMaps();
      setMaps(data);
    } catch (err) {
      console.error('Failed to load maps:', err);
    } finally {
      setIsLoadingMaps(false);
    }
  };

  const handleSelectMap = async (id: string) => {
    try {
      const mapData = await api.fetchMap(id);
      setCurrentMapData(mapData);
      loadMap(mapData);
    } catch (err) {
      console.error('Failed to load map:', err);
      alert('Failed to load map');
    }
  };

  const handleCreateMap = async (name: string, imagePath: string) => {
    try {
      const newMap = await api.createMap(name, imagePath);
      setMaps((prev) => [...prev, {
        id: newMap.id,
        name: newMap.name,
        image_path: newMap.image_path,
        annotation_count: 0,
      }]);
    } catch (err) {
      console.error('Failed to create map:', err);
      alert('Failed to create map');
    }
  };

  const handleDeleteMap = async (id: string) => {
    try {
      await api.deleteMap(id);
      setMaps((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete map:', err);
      alert('Failed to delete map');
    }
  };

  const handleBack = () => {
    setCurrentMapData(null);
    clearMap();
    loadMaps(); // Refresh the list
  };

  const handleSave = useCallback(async () => {
    if (!currentMapData) return;

    setIsSaving(true);
    try {
      // Delete all existing annotations, then recreate them
      // This is simpler than tracking individual changes for the prototype
      const existingAnnotations = await api.fetchAnnotations(currentMapData.id);

      // Delete removed annotations
      for (const existing of existingAnnotations) {
        if (!annotations.find((a) => a.id === existing.id)) {
          await api.deleteAnnotation(currentMapData.id, existing.id);
        }
      }

      // Create or update annotations
      for (const ann of annotations) {
        const existing = existingAnnotations.find((e) => e.id === ann.id);
        if (!existing) {
          // New annotation - need to create with server-side ID
          await api.createAnnotation(currentMapData.id, {
            type: ann.type,
            x: ann.x,
            y: ann.y,
            title: ann.title,
            description: ann.description,
          });
        } else {
          // Update existing
          await api.updateAnnotation(currentMapData.id, ann.id, {
            type: ann.type,
            x: ann.x,
            y: ann.y,
            title: ann.title,
            description: ann.description,
          });
        }
      }
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [currentMapData, annotations]);

  // Show map editor if a map is selected
  if (currentMapData) {
    return (
      <div className="app">
        <Toolbar
          mapName={currentMapData.name}
          onSave={handleSave}
          onBack={handleBack}
          isSaving={isSaving}
        />
        <div className="map-editor">
          <MapViewer
            imagePath={currentMapData.image_path}
            imageWidth={DEFAULT_IMAGE_WIDTH}
            imageHeight={DEFAULT_IMAGE_HEIGHT}
          />
        </div>
        <AnnotationForm />
      </div>
    );
  }

  // Show map selector
  return (
    <MapSelector
      maps={maps}
      onSelectMap={handleSelectMap}
      onCreateMap={handleCreateMap}
      onDeleteMap={handleDeleteMap}
      isLoading={isLoadingMaps}
    />
  );
}

export default App;
