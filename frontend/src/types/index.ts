export type AnnotationType = 'city' | 'person' | 'event' | 'note';

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
