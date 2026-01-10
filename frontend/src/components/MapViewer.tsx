import { useEffect, useState } from 'react';
import {
    MapContainer,
    ImageOverlay,
    useMapEvents,
    useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAnnotationStore } from '../stores/annotationStore';
import { AnnotationMarker } from './AnnotationMarker';
import './MapViewer.css';

interface MapViewerProps {
    imagePath: string;
    imageWidth: number;
    imageHeight: number;
}

// Component to handle map click events
function MapClickHandler() {
    const openCreateForm = useAnnotationStore((s) => s.openCreateForm);

    useMapEvents({
        dblclick(e) {
            openCreateForm({ x: e.latlng.lng, y: e.latlng.lat });
        },
    });

    return null;
}

// Component to fit map to image bounds
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();

    useEffect(() => {
        map.fitBounds(bounds);
    }, [map, bounds]);

    return null;
}

export function MapViewer({ imagePath, imageWidth, imageHeight }: MapViewerProps) {
    const annotations = useAnnotationStore((s) => s.annotations);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Calculate bounds based on image dimensions
    // Using simple coordinates where (0,0) is top-left
    const bounds: L.LatLngBoundsExpression = [
        [0, 0], // top-left
        [-imageHeight, imageWidth], // bottom-right (y is negative in Leaflet's simple CRS)
    ];

    // Preload image
    useEffect(() => {
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.src = imagePath;
    }, [imagePath]);

    if (!imageLoaded) {
        return <div className="map-loading">Loading map image...</div>;
    }

    return (
        <div className="map-viewer">
            <MapContainer
                center={[-imageHeight / 2, imageWidth / 2]}
                zoom={0}
                minZoom={-3}
                maxZoom={4}
                zoomSnap={0}
                zoomDelta={0.1}
                wheelDebounceTime={10}
                // Increase this to make the zoom feel more granular
                wheelPxPerZoomLevel={120}
                crs={L.CRS.Simple}
                doubleClickZoom={false}
                className="map-container"
            >
                <ImageOverlay url={imagePath} bounds={bounds} />
                <FitBounds bounds={bounds} />
                <MapClickHandler />
                {annotations.map((ann) => (
                    <AnnotationMarker key={ann.id} annotation={ann} />
                ))}
            </MapContainer>
        </div>
    );
}
