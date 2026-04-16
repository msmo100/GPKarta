export type MarkerShape = 'pin' | 'circle' | 'square' | 'diamond' | 'star';
export type MarkerSize = 'sm' | 'md' | 'lg';

export interface MarkerImage {
  id: string;
  markerId: string;
  filename: string;
  url: string;
  order: number;
  createdAt: string;
}

export interface Marker {
  id: string;
  mapId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  lat: number;
  lng: number;
  date: string | null;
  shape: MarkerShape;
  markerSize: MarkerSize;
  markerIcon: string | null;
  createdAt: string;
  updatedAt: string;
  images: MarkerImage[];
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  } | null;
}

export interface CreateMarkerInput {
  title: string;
  description?: string;
  lat: number;
  lng: number;
  date?: string;
  categoryId?: string;
  shape?: MarkerShape;
  markerSize?: MarkerSize;
  markerIcon?: string;
}

export interface UpdateMarkerInput {
  title?: string;
  description?: string;
  lat?: number;
  lng?: number;
  date?: string;
  categoryId?: string | null;
  shape?: MarkerShape;
  markerSize?: MarkerSize;
  markerIcon?: string | null;
}
