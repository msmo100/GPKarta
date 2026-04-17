import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { MapRecord, Marker, Category, Shape } from '@gpkarta/shared';
import { apiClient } from '../api/client';
import { useUiStore } from '../store/uiStore';
import { MarkerLayer } from '../components/map/MarkerLayer';
import { ShapeLayer } from '../components/map/ShapeLayer';
import { GeocoderControl } from '../components/map/GeocoderControl';
import { getTileLayer } from '../config/tileLayers';
import { FullPageSpinner } from '../components/common/Spinner';
import { MarkerPopupModal } from '../components/markers/MarkerPopupModal';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PublicMapData extends MapRecord {
  markers: Marker[];
  categories: Category[];
  shapes: Shape[];
}

export function PublicMapPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();
  const { markerPopupOpen, closeMarkerPopup, activeMarkerId } = useUiStore();
  const [data, setData] = useState<PublicMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mapId) return;
    apiClient
      .get<{ data: PublicMapData }>(`/public/maps/${mapId}`)
      .then((r) => setData(r.data.data))
      .catch((err) => {
        const status = err.response?.status;
        setError(status === 403 ? 'Den här kartan är inte publik.' : 'Kartan hittades inte.');
      })
      .finally(() => setLoading(false));
  }, [mapId]);

  if (loading) return <FullPageSpinner message="Laddar karta…" />;

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12 }}>
        <p style={{ fontSize: 16, color: '#374151' }}>{error || 'Kartan hittades inte'}</p>
        <button
          onClick={() => navigate('/')}
          style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Gå till startsidan
        </button>
      </div>
    );
  }

  const tileLayerDef = getTileLayer(data.tileLayer ?? 'osm');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal header */}
      <div style={{
        height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', background: '#fff', borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🗺️</span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{data.title}</span>
          {data.description && (
            <span style={{ fontSize: 12, color: '#9ca3af' }}>— {data.description}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9ca3af' }}>
          <span>{data.markers.length} markörer</span>
          {data.shapes.length > 0 && <span>{data.shapes.length} former</span>}
        </div>
      </div>

      <MarkerPopupModal
        marker={data.markers.find((m) => m.id === activeMarkerId) ?? null}
        open={markerPopupOpen}
        onClose={closeMarkerPopup}
        readOnly
        popupBg={data.popupBg}
        popupTextColor={data.popupTextColor}
      />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MapContainer
          center={[data.centerLat, data.centerLng]}
          zoom={data.defaultZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            key={tileLayerDef.key}
            attribution={tileLayerDef.attribution}
            url={tileLayerDef.url}
          />
          <MarkerLayer markers={data.markers} readOnly />
          <ShapeLayer shapes={data.shapes} readOnly />
          <GeocoderControl />
        </MapContainer>
      </div>
    </div>
  );
}
