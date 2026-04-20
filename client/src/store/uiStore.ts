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
  modalData: any;

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

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveMarker: (id: string | null) => void;
  setActiveShape: (id: string | null) => void;
  setAddingMarker: (adding: boolean) => void;
  setDrawingShape: (drawing: boolean) => void;
  setPendingMarker: (marker: PendingMarker | null) => void;
  setPendingShape: (shape: PendingShape | null) => void;
  openModal: (type: ModalType, data?: any) => void;
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
  modalData: null,
  filterCategoryIds: [],
  filterFrom: '',
  filterTo: '',
  activeFilters: {},
  activeRanges: {},

  filterPanelOpen: false,
  toggleFilterPanel: () => set((s) => ({ filterPanelOpen: !s.filterPanelOpen })),

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
  openModal: (type, data) => set({ modal: type, modalData: data }),
  closeModal: () => set({ modal: null, modalData: null, pendingMarker: null, pendingShape: null }),
  setFilterCategories: (ids) => set({ filterCategoryIds: ids }),
  setFilterFrom: (from) => set({ filterFrom: from }),
  setFilterTo: (to) => set({ filterTo: to }),
  setActiveFilter: (key, vals) => set((s) => ({ activeFilters: { ...s.activeFilters, [key]: vals } })),
  setActiveRange: (key, range) => set((s) => ({ activeRanges: { ...s.activeRanges, [key]: range } })),
  clearFilters: () => set({ filterCategoryIds: [], filterFrom: '', filterTo: '', activeFilters: {}, activeRanges: {} }),
}));
