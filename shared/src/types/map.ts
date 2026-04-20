export type TileLayerKey =
  | 'osm'
  | 'carto-light'
  | 'carto-light-nolabels'
  | 'carto-dark'
  | 'carto-dark-nolabels'
  | 'carto-voyager'
  | 'esri-satellite'
  | 'esri-topo'
  | 'opentopomap';

export interface MapRecord {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  embedToken: string | null;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  tileLayer: TileLayerKey;
  clusterMarkers: boolean;
  clusterColor: string | null;
  clusterBorderColor: string | null;
  showMinimap: boolean;
  showScaleBar: boolean;
  popupBg: string | null;
  popupTextColor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMapInput {
  title: string;
  description?: string;
  isPublic?: boolean;
  centerLat?: number;
  centerLng?: number;
  defaultZoom?: number;
  tileLayer?: TileLayerKey;
  clusterMarkers?: boolean;
  clusterColor?: string | null;
  clusterBorderColor?: string | null;
  showMinimap?: boolean;
  showScaleBar?: boolean;
  popupBg?: string | null;
  popupTextColor?: string | null;
}

export interface UpdateMapInput {
  title?: string;
  description?: string;
  isPublic?: boolean;
  centerLat?: number;
  centerLng?: number;
  defaultZoom?: number;
  tileLayer?: TileLayerKey;
  clusterMarkers?: boolean;
  clusterColor?: string | null;
  clusterBorderColor?: string | null;
  showMinimap?: boolean;
  showScaleBar?: boolean;
  popupBg?: string | null;
  popupTextColor?: string | null;
}
