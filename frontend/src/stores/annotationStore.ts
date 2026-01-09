import { create } from 'zustand';
import { temporal } from 'zundo';
import type { Annotation, MapData } from '../types';

interface AnnotationState {
    // Current map data
    currentMap: MapData | null;
    annotations: Annotation[];

    // UI State
    selectedAnnotationId: string | null;
    isFormOpen: boolean;
    formMode: 'create' | 'edit';
    pendingPosition: { x: number; y: number } | null;

    // Actions
    loadMap: (map: MapData) => void;
    clearMap: () => void;
    addAnnotation: (annotation: Annotation) => void;
    updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
    deleteAnnotation: (id: string) => void;
    convertAnnotationsType: (fromType: string, toType: string) => void;

    // UI Actions
    selectAnnotation: (id: string | null) => void;
    openCreateForm: (position: { x: number; y: number }) => void;
    openEditForm: (id: string) => void;
    closeForm: () => void;
}

export const useAnnotationStore = create<AnnotationState>()(
    temporal(
        (set) => ({
            currentMap: null,
            annotations: [],
            selectedAnnotationId: null,
            isFormOpen: false,
            formMode: 'create',
            pendingPosition: null,

            loadMap: (map) =>
                set({
                    currentMap: map,
                    annotations: map.annotations,
                    selectedAnnotationId: null,
                    isFormOpen: false,
                }),

            clearMap: () =>
                set({
                    currentMap: null,
                    annotations: [],
                    selectedAnnotationId: null,
                    isFormOpen: false,
                }),

            addAnnotation: (annotation) =>
                set((state) => ({
                    annotations: [...state.annotations, annotation],
                })),

            updateAnnotation: (id, updates) =>
                set((state) => ({
                    annotations: state.annotations.map((a) =>
                        a.id === id ? { ...a, ...updates } : a
                    ),
                })),

            deleteAnnotation: (id) =>
                set((state) => ({
                    annotations: state.annotations.filter((a) => a.id !== id),
                    selectedAnnotationId:
                        state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
                    isFormOpen: state.selectedAnnotationId === id ? false : state.isFormOpen,
                })),

            convertAnnotationsType: (fromType, toType) =>
                set((state) => ({
                    annotations: state.annotations.map((a) =>
                        a.type === fromType ? { ...a, type: toType } : a
                    ),
                })),

            selectAnnotation: (id) => set({ selectedAnnotationId: id }),

            openCreateForm: (position) =>
                set({
                    isFormOpen: true,
                    formMode: 'create',
                    pendingPosition: position,
                    selectedAnnotationId: null,
                }),

            openEditForm: (id) =>
                set({
                    isFormOpen: true,
                    formMode: 'edit',
                    selectedAnnotationId: id,
                    pendingPosition: null,
                }),

            closeForm: () =>
                set({
                    isFormOpen: false,
                    pendingPosition: null,
                }),
        }),
        {
            limit: 50, // Keep 50 undo steps
            partialize: (state) => ({
                // Only track annotation changes for undo/redo
                annotations: state.annotations,
            }),
        }
    )
);

// Expose undo/redo for keyboard shortcuts
export const { undo, redo } = useAnnotationStore.temporal.getState();
