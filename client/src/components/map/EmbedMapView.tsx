import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Marker } from '@gpkarta/shared';
import type { EmbedData } from '../../api/embed';
import { MarkerLayer } from './MarkerLayer';
import { FilterPanel } from '../filters/FilterPanel';
import { getTileLayer } from '../../config/tileLayers';
import type { EmbedConfig } from '@gpkarta/shared';
import L from 'leaflet';

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface EmbedMapViewProps {
  data: EmbedData;
  config: EmbedConfig;
  filteredMarkers: Marker[];
}

export function EmbedMapView({ data, config, filteredMarkers }: EmbedMapViewProps) {
  const centerLat = config.lat ?? data.centerLat;
  const centerLng = config.lng ?? data.centerLng;
  const zoom = config.zoom ?? data.defaultZoom;
  const tileLayer = getTileLayer((data as any).tileLayer ?? 'osm');

  return (
    <div className="embed-map" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!config.hideControls && (
        <FilterPanel
          categories={data.categories}
          markers={data.markers}
          totalCount={data.markers.length}
          filteredCount={filteredMarkers.length}
        />
      )}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={!config.hideControls}
        attributionControl={!config.hideAttribution}
      >
        <TileLayer attribution={tileLayer.attribution} url={tileLayer.url} />
        <MarkerLayer markers={filteredMarkers} readOnly />
      </MapContainer>
    </div>
  );
}
