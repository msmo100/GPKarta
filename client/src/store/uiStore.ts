import { create } from 'zustand';

type ModalType = 'createMarker' | 'editMarker' | 'createCategory' | 'editCategory' | 'mapSettings' | 'embed' | 'createShape' | null;

interface PendingMarker {
  lat: number;
  lng: number;
}

interface PendingShape {
  type: 'polyline' | 'polygon';
  coordinates: number[][];
}

interface UiState {
  sidebarOpen: boolean;
  activeMarkerId: string | null;
  activeShapeId: string | null;
  isAddingMarker: boolean;
  isDrawingShape: boolean;
  pendingMarker: PendingMarker | null;
  pendingShape: PendingShape | null;
  modal: ModalType;

  // Fixed filters
  filterCategoryIds: string[];
  filterFrom: string;
  filterTo: string;

  // Dynamic filters: key → active string values (for chip/checkbox filters)
  activeFilters: Record<string, string[]>;
  // Dynamic range filters: key → [min, max]
  activeRanges: Record<string, [number, number]>;

  markerPopupOpen: boolean;
  openMarkerPopup: () => void;
  closeMarkerPopup: () => void;

  filterPanelOpen: boolean;
  toggleFilterPanel: () => void;

  filterDarkMode: boolean;
  toggleFilterDarkMode: () => void;
  setFilterDarkMode: (val: boolean) => void;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveMarker: (id: string | null) => void;
  setActiveShape: (id: string | null) => void;
  setAddingMarker: (adding: boolean) => void;
  setDrawingShape: (drawing: boolean) => void;
  setPendingMarker: (marker: PendingMarker | null) => void;
  setPendingShape: (shape: PendingShape | null) => void;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  setFilterCategories: (ids: string[]) => void;
  setFilterFrom: (from: string) => void;
  setFilterTo: (to: string) => void;
  setActiveFilter: (key: string, vals: string[]) => void;
  setActiveRange: (key: string, range: [number, number]) => void;
  clearFilters: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  markerPopupOpen: false,
  sidebarOpen: true,
  activeMarkerId: null,
  activeShapeId: null,
  isAddingMarker: false,
  isDrawingShape: false,
  pendingMarker: null,
  pendingShape: null,
  modal: null,
  filterCategoryIds: [],
  filterFrom: '',
  filterTo: '',
  activeFilters: {},
  activeRanges: {},

  filterPanelOpen: false,
  toggleFilterPanel: () => set((s) => ({ filterPanelOpen: !s.filterPanelOpen })),

  filterDarkMode: false,
  toggleFilterDarkMode: () => set((s) => ({ filterDarkMode: !s.filterDarkMode })),
  setFilterDarkMode: (val) => set({ filterDarkMode: val }),

  openMarkerPopup: () => set({ markerPopupOpen: true }),
  closeMarkerPopup: () => set({ markerPopupOpen: false }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveMarker: (id) => set({ activeMarkerId: id, activeShapeId: null }),
  setActiveShape: (id) => set({ activeShapeId: id, activeMarkerId: null }),
  setAddingMarker: (adding) => set({ isAddingMarker: adding, pendingMarker: null }),
  setDrawingShape: (drawing) => set({ isDrawingShape: drawing }),
  setPendingMarker: (marker) => set({ pendingMarker: marker, isAddingMarker: false }),
  setPendingShape: (shape) => set({ pendingShape: shape, isDrawingShape: false }),
  openModal: (type) => set({ modal: type }),
  closeModal: () => set({ modal: null, pendingMarker: null, pendingShape: null }),
  setFilterCategories: (ids) => set({ filterCategoryIds: ids }),
  setFilterFrom: (from) => set({ filterFrom: from }),
  setFilterTo: (to) => set({ filterTo: to }),
  setActiveFilter: (key, vals) => set((s) => ({ activeFilters: { ...s.activeFilters, [key]: vals } })),
  setActiveRange: (key, range) => set((s) => ({ activeRanges: { ...s.activeRanges, [key]: range } })),
  clearFilters: () => set({ filterCategoryIds: [], filterFrom: '', filterTo: '', activeFilters: {}, activeRanges: {} }),
}));
