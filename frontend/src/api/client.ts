const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    if (response.status === 204) {
        return undefined as T;
    }
    return response.json();
}

// Map API
export async function fetchMaps() {
    const response = await fetch(`${API_BASE}/maps`);
    return handleResponse<import('../types').MapSummary[]>(response);
}

export async function fetchMap(id: string) {
    const response = await fetch(`${API_BASE}/maps/${id}`);
    return handleResponse<import('../types').MapData>(response);
}

export async function createMap(name: string, imagePath: string) {
    const response = await fetch(`${API_BASE}/maps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image_path: imagePath }),
    });
    return handleResponse<import('../types').MapData>(response);
}

export async function updateMap(id: string, data: { name?: string; image_path?: string }) {
    const response = await fetch(`${API_BASE}/maps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<import('../types').MapData>(response);
}

export async function deleteMap(id: string) {
    const response = await fetch(`${API_BASE}/maps/${id}`, { method: 'DELETE' });
    return handleResponse<void>(response);
}

// Annotation API
export async function fetchAnnotations(mapId: string) {
    const response = await fetch(`${API_BASE}/maps/${mapId}/annotations`);
    return handleResponse<import('../types').Annotation[]>(response);
}

export async function createAnnotation(
    mapId: string,
    data: Omit<import('../types').Annotation, 'id'>
) {
    const response = await fetch(`${API_BASE}/maps/${mapId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<import('../types').Annotation>(response);
}

export async function updateAnnotation(
    mapId: string,
    annotationId: string,
    data: Partial<Omit<import('../types').Annotation, 'id'>>
) {
    const response = await fetch(`${API_BASE}/maps/${mapId}/annotations/${annotationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<import('../types').Annotation>(response);
}

export async function deleteAnnotation(mapId: string, annotationId: string) {
    const response = await fetch(`${API_BASE}/maps/${mapId}/annotations/${annotationId}`, {
        method: 'DELETE',
    });
    return handleResponse<void>(response);
}
