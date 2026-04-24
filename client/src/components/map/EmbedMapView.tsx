import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import type { Marker, MarkerShape, MarkerSize } from '@gpkarta/shared';
import type { EmbedData } from '../../api/embed';
import { MarkerLayer } from './MarkerLayer';
import { FilterPanel } from '../filters/FilterPanel';
import { getTileLayer } from '../../config/tileLayers';
import { createMarkerIcon } from './MarkerIcon';
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

function EmbedClusterLayer({ markers, clusterColor, clusterBorderColor }: { markers: Marker[]; clusterColor: string; clusterBorderColor: string }) {
  const map = useMap();
  useEffect(() => {
    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 40,
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount();
        return L.divIcon({
          html: `<div style="width:36px;height:36px;border-radius:50%;background:${clusterColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:3px solid ${clusterBorderColor};box-shadow:0 2px 6px rgba(0,0,0,0.25)">${count}</div>`,
          className: '', iconSize: L.point(36, 36), iconAnchor: L.point(18, 18),
        });
      },
    });
    markers.forEach((m) => {
      const color = m.color ?? m.category?.color ?? '#2563eb';
      const icon = createMarkerIcon(color, (m.shape as MarkerShape) ?? 'pin', (m.markerSize as MarkerSize) ?? 'md', m.markerIcon ?? null, false, m.strokeColor ?? null, m.strokeWidth ?? 1.5, m.opacity ?? 1.0);
      const lm = L.marker([m.lat, m.lng], { icon });
      lm.bindPopup(`<div style="font-family:sans-serif;min-width:160px"><strong style="font-size:14px">${m.title}</strong>${m.description ? `<p style="font-size:12px;color:#6b7280;margin-top:4px">${m.description}</p>` : ''}${m.date ? `<p style="font-size:11px;color:#9ca3af;margin-top:4px">${new Date(m.date).toLocaleDateString()}</p>` : ''}</div>`);
      cluster.addLayer(lm);
    });
    map.addLayer(cluster);
    return () => { map.removeLayer(cluster); };
  }, [markers, map]);
  return null;
}

export function EmbedMapView({ data, config, filteredMarkers }: EmbedMapViewProps) {
  const centerLat = config.lat ?? data.centerLat;
  const centerLng = config.lng ?? data.centerLng;
  const zoom = config.zoom ?? data.defaultZoom;
  const tileLayer = getTileLayer((data as any).tileLayer ?? 'osm');
  const clusterMarkers = (data as any).clusterMarkers ?? false;
  const clusterColor = (data as any).clusterColor ?? '#2563eb';
  const clusterBorderColor = (data as any).clusterBorderColor ?? '#ffffff';

  return (
    <div className="embed-map" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!config.hideControls && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1001, pointerEvents: 'none' }}>
          <FilterPanel
            categories={data.categories}
            markers={data.markers}
            totalCount={data.markers.length}
            filteredCount={filteredMarkers.length}
            hideable={false}
            initialHiddenKeys={data.hiddenFilterKeys ?? []}
          />
        </div>
      )}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={!config.hideControls}
        attributionControl={!config.hideAttribution}
      >
        <TileLayer attribution={tileLayer.attribution} url={tileLayer.url} />
        {clusterMarkers
          ? <EmbedClusterLayer markers={filteredMarkers} clusterColor={clusterColor} clusterBorderColor={clusterBorderColor} />
          : <MarkerLayer markers={filteredMarkers} readOnly />
        }
      </MapContainer>
    </div>
  );
}
