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
  filterCategoryIds: string[];
  filterFrom: string;
  filterTo: string;
  filterGenderVictim: string[];
  filterAgeMin: number;
  filterAgeMax: number;
  filterGenderPerpetrator: string[];
  filterPunishment: string[];
  filterPunishmentYearsMin: number;
  filterPunishmentYearsMax: number;

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
  setFilterGenderVictim: (vals: string[]) => void;
  setFilterAge: (min: number, max: number) => void;
  setFilterGenderPerpetrator: (vals: string[]) => void;
  setFilterPunishment: (vals: string[]) => void;
  setFilterPunishmentYears: (min: number, max: number) => void;
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
  filterGenderVictim: [],
  filterAgeMin: 0,
  filterAgeMax: 100,
  filterGenderPerpetrator: [],
  filterPunishment: [],
  filterPunishmentYearsMin: 0,
  filterPunishmentYearsMax: 100,

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
  setFilterGenderVictim: (vals) => set({ filterGenderVictim: vals }),
  setFilterAge: (min, max) => set({ filterAgeMin: min, filterAgeMax: max }),
  setFilterGenderPerpetrator: (vals) => set({ filterGenderPerpetrator: vals }),
  setFilterPunishment: (vals) => set({ filterPunishment: vals }),
  setFilterPunishmentYears: (min, max) => set({ filterPunishmentYearsMin: min, filterPunishmentYearsMax: max }),
  clearFilters: () => set({
    filterCategoryIds: [], filterFrom: '', filterTo: '',
    filterGenderVictim: [], filterAgeMin: 0, filterAgeMax: 100,
    filterGenderPerpetrator: [], filterPunishment: [],
    filterPunishmentYearsMin: 0, filterPunishmentYearsMax: 100,
  }),
}));
