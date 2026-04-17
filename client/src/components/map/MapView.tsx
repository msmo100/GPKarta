import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import type { MapRecord, Marker, Shape, MarkerShape, MarkerSize } from '@gpkarta/shared';
import { MarkerLayer } from './MarkerLayer';
import { MapClickHandler } from './MapClickHandler';
import { ShapeLayer } from './ShapeLayer';
import { DrawingTools } from './DrawingTools';
import { GeocoderControl } from './GeocoderControl';
import { useUiStore } from '../../store/uiStore';
import { getTileLayer } from '../../config/tileLayers';
import { createMarkerIcon } from './MarkerIcon';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  map: MapRecord;
  markers: Marker[];
  filteredMarkers: Marker[];
  shapes?: Shape[];
  readOnly?: boolean;
}

// Fly to active marker
function FlyToMarker({ markerId, markers }: { markerId: string | null; markers: Marker[] }) {
  const leafletMap = useMap();
  useEffect(() => {
    if (!markerId) return;
    const m = markers.find((x) => x.id === markerId);
    if (m) leafletMap.flyTo([m.lat, m.lng], Math.max(leafletMap.getZoom(), 15), { duration: 0.8 });
  }, [markerId, markers, leafletMap]);
  return null;
}

// Scale bar
function ScaleBar() {
  const map = useMap();
  useEffect(() => {
    const scale = L.control.scale({ imperial: false, position: 'bottomright' });
    scale.addTo(map);
    return () => { scale.remove(); };
  }, [map]);
  return null;
}

// Geolocation button
function GeolocationControl() {
  const map = useMap();
  useEffect(() => {
    const btn = (L.control as any)({ position: 'bottomright' });
    btn.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      const a = L.DomUtil.create('a', '', div);
      a.title = 'Show my location';
      a.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:16px;text-decoration:none;color:#374151;width:30px;height:30px;';
      a.innerHTML = '⊕';
      L.DomEvent.on(a, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        map.locate({ setView: true, maxZoom: 16 });
      });
      return div;
    };
    btn.addTo(map);
    return () => { btn.remove(); };
  }, [map]);
  return null;
}

// Minimap
function MiniMap({ tileUrl, attribution }: { tileUrl: string; attribution: string }) {
  const map = useMap();
  const miniRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = L.DomUtil.create('div');
    div.style.cssText = 'width:150px;height:100px;border:2px solid rgba(0,0,0,0.3);border-radius:4px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.2)';
    containerRef.current = div;

    const corner = (L.control as any)({ position: 'bottomleft' });
    corner.onAdd = () => div;
    corner.addTo(map);

    const mini = L.map(div, {
      zoomControl: false, attributionControl: false,
      dragging: false, scrollWheelZoom: false, touchZoom: false,
      doubleClickZoom: false, boxZoom: false, keyboard: false,
    });
    L.tileLayer(tileUrl, { attribution }).addTo(mini);
    mini.setView(map.getCenter(), Math.max(map.getZoom() - 5, 1));
    miniRef.current = mini;

    // Draw a rectangle showing main map viewport
    let rect = L.rectangle(map.getBounds(), { color: '#2563eb', weight: 2, fillOpacity: 0.1 }).addTo(mini);

    const sync = () => {
      mini.setView(map.getCenter(), Math.max(map.getZoom() - 5, 1));
      rect.setBounds(map.getBounds());
    };
    map.on('move zoom', sync);

    return () => {
      map.off('move zoom', sync);
      mini.remove();
      corner.remove();
    };
  }, [map, tileUrl]);

  return null;
}

// Clustered marker layer (imperative, bypasses react-leaflet)
function ClusteredMarkerLayer({ markers }: { markers: Marker[] }) {
  const map = useMap();
  const activeMarkerId = useUiStore((s) => s.activeMarkerId);
  const setActiveMarker = useUiStore((s) => s.setActiveMarker);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const openMarkerPopup = useUiStore((s) => s.openMarkerPopup);

  useEffect(() => {
    const cluster = (L as any).markerClusterGroup({ maxClusterRadius: 40 });

    markers.forEach((m) => {
      const color = m.color ?? m.category?.color ?? '#2563eb';
      const isSelected = m.id === activeMarkerId;
      const icon = createMarkerIcon(
        color,
        (m.shape as MarkerShape) ?? 'pin',
        (m.markerSize as MarkerSize) ?? 'md',
        m.markerIcon ?? null,
        isSelected,
        m.strokeColor ?? null,
        m.strokeWidth ?? 1.5,
        m.opacity ?? 1.0,
      );
      const leafletMarker = L.marker([m.lat, m.lng], { icon });
      leafletMarker.on('click', () => {
        setActiveMarker(m.id);
        openMarkerPopup();
        setSidebarOpen(true);
      });
      cluster.addLayer(leafletMarker);
    });

    map.addLayer(cluster);
    return () => { map.removeLayer(cluster); };
  }, [markers, activeMarkerId, map]);

  return null;
}

export function MapView({ map, markers, filteredMarkers, shapes = [], readOnly = false }: MapViewProps) {
  const activeMarkerId = useUiStore((s) => s.activeMarkerId);
  const isAddingMarker = useUiStore((s) => s.isAddingMarker);
  const isDrawingShape = useUiStore((s) => s.isDrawingShape);
  const tileLayerDef = getTileLayer(map.tileLayer ?? 'osm');

  return (
    <div
      className={`map-container${isAddingMarker ? ' adding-marker' : ''}${isDrawingShape ? ' drawing-shape' : ''}`}
      style={{ height: '100%' }}
    >
      <MapContainer
        center={[map.centerLat, map.centerLng]}
        zoom={map.defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          key={tileLayerDef.key}
          attribution={tileLayerDef.attribution}
          url={tileLayerDef.url}
        />

        {/* Markers — clustered or regular */}
        {map.clusterMarkers
          ? <ClusteredMarkerLayer markers={filteredMarkers} />
          : <MarkerLayer markers={filteredMarkers} readOnly={readOnly} />
        }

        {/* Shapes */}
        <ShapeLayer shapes={shapes} readOnly={readOnly} />

        {/* Drawing tools (editor only) */}
        {!readOnly && <DrawingTools enabled={true} />}

        {/* Map utilities */}
        {!readOnly && <MapClickHandler />}
        <FlyToMarker markerId={activeMarkerId} markers={markers} />
        <GeocoderControl />
        {map.showScaleBar && <ScaleBar />}
        {map.showMinimap && <MiniMap tileUrl={tileLayerDef.url} attribution={tileLayerDef.attribution} />}
        {!readOnly && <GeolocationControl />}
      </MapContainer>
    </div>
  );
}
