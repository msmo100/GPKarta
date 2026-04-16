export type TileLayerKey =
  | 'osm'
  | 'carto-light'
  | 'carto-light-nolabels'
  | 'carto-dark'
  | 'carto-dark-nolabels';

export interface MapRecord {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  embedToken: string | null;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  tileLayer: TileLayerKey;
  clusterMarkers: boolean;
  showMinimap: boolean;
  showScaleBar: boolean;
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
  showMinimap?: boolean;
  showScaleBar?: boolean;
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
  showMinimap?: boolean;
  showScaleBar?: boolean;
}
