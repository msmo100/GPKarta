import { create } from 'zustand';
import type { MapRecord, Marker, Category, Shape } from '@gpkarta/shared';

interface MapState {
  currentMap: MapRecord | null;
  markers: Marker[];
  categories: Category[];
  shapes: Shape[];
  setCurrentMap: (map: MapRecord) => void;
  setMarkers: (markers: Marker[]) => void;
  addMarker: (marker: Marker) => void;
  updateMarker: (marker: Marker) => void;
  removeMarker: (markerId: string) => void;
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  removeCategory: (categoryId: string) => void;
  setShapes: (shapes: Shape[]) => void;
  addShape: (shape: Shape) => void;
  updateShape: (shape: Shape) => void;
  removeShape: (shapeId: string) => void;
  reset: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  currentMap: null,
  markers: [],
  categories: [],
  shapes: [],

  setCurrentMap: (map) => set({ currentMap: map }),
  setMarkers: (markers) => set({ markers }),
  addMarker: (marker) => set((s) => ({ markers: [marker, ...s.markers] })),
  updateMarker: (marker) =>
    set((s) => ({ markers: s.markers.map((m) => (m.id === marker.id ? marker : m)) })),
  removeMarker: (markerId) =>
    set((s) => ({ markers: s.markers.filter((m) => m.id !== markerId) })),

  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((s) => ({ categories: [...s.categories, category] })),
  updateCategory: (category) =>
    set((s) => ({
      categories: s.categories.map((c) => (c.id === category.id ? category : c)),
    })),
  removeCategory: (categoryId) =>
    set((s) => ({ categories: s.categories.filter((c) => c.id !== categoryId) })),

  setShapes: (shapes) => set({ shapes }),
  addShape: (shape) => set((s) => ({ shapes: [shape, ...s.shapes] })),
  updateShape: (shape) =>
    set((s) => ({ shapes: s.shapes.map((sh) => (sh.id === shape.id ? shape : sh)) })),
  removeShape: (shapeId) =>
    set((s) => ({ shapes: s.shapes.filter((sh) => sh.id !== shapeId) })),

  reset: () => set({ currentMap: null, markers: [], categories: [], shapes: [] }),
}));
