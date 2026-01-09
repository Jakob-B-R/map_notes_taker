import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnnotationTypeConfig } from '../types';

// Default annotation types (non-deletable)
const DEFAULT_TYPES: AnnotationTypeConfig[] = [
    { id: 'city', name: 'City', icon: '🏛️', isDefault: true },
    { id: 'person', name: 'Person', icon: '👤', isDefault: true },
    { id: 'event', name: 'Event', icon: '⚡', isDefault: true },
    { id: 'note', name: 'Note', icon: '📝', isDefault: true },
];

interface AnnotationTypesState {
    types: AnnotationTypeConfig[];

    // Actions
    addType: (name: string, icon: string) => void;
    updateType: (id: string, updates: Partial<Pick<AnnotationTypeConfig, 'name' | 'icon'>>) => void;
    deleteType: (id: string) => boolean; // Returns true if deleted, false if default
    getType: (id: string) => AnnotationTypeConfig | undefined;
    getTypeIcon: (id: string) => string;
}

export const useAnnotationTypesStore = create<AnnotationTypesState>()(
    persist(
        (set, get) => ({
            types: DEFAULT_TYPES,

            addType: (name, icon) => {
                const id = `custom-${Date.now()}`;
                set((state) => ({
                    types: [...state.types, { id, name, icon, isDefault: false }],
                }));
            },

            updateType: (id, updates) => {
                set((state) => ({
                    types: state.types.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                }));
            },

            deleteType: (id) => {
                const type = get().types.find((t) => t.id === id);
                if (!type || type.isDefault) {
                    return false;
                }
                set((state) => ({
                    types: state.types.filter((t) => t.id !== id),
                }));
                return true;
            },

            getType: (id) => {
                return get().types.find((t) => t.id === id);
            },

            getTypeIcon: (id) => {
                const type = get().types.find((t) => t.id === id);
                return type?.icon ?? '📍'; // Fallback icon
            },
        }),
        {
            name: 'annotation-types-storage',
        }
    )
);
