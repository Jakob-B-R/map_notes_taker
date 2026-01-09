// Dynamic annotation type - stored as string, validated by annotationTypesStore
export type AnnotationType = string;

export interface AnnotationTypeConfig {
    id: string;       // slug like "city" or "custom-1"
    name: string;     // display name
    icon: string;     // emoji
    isDefault?: boolean;
}

export interface Annotation {
    id: string;
    type: AnnotationType;
    x: number;
    y: number;
    title: string;
    description: string;
}

export interface MapData {
    id: string;
    name: string;
    image_path: string;
    annotations: Annotation[];
}

export interface MapSummary {
    id: string;
    name: string;
    image_path: string;
    annotation_count: number;
}
