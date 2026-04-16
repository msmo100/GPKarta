import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Marker } from '@gpkarta/shared';
import type { EmbedData } from '../../api/embed';
import { MarkerLayer } from './MarkerLayer';
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

  return (
    <div className="embed-map" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={!config.hideControls}
        attributionControl={!config.hideAttribution}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerLayer markers={filteredMarkers} readOnly />
      </MapContainer>
    </div>
  );
}
