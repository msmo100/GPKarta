import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Marker as MarkerType, MarkerShape, MarkerSize } from '@gpkarta/shared';
import { createMarkerIcon } from './MarkerIcon';
import { useUiStore } from '../../store/uiStore';

interface MarkerLayerProps {
  markers: MarkerType[];
  readOnly?: boolean;
}

export function MarkerLayer({ markers, readOnly }: MarkerLayerProps) {
  const activeMarkerId = useUiStore((s) => s.activeMarkerId);
  const setActiveMarker = useUiStore((s) => s.setActiveMarker);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <>
      {markers.map((marker) => {
        const color = marker.category?.color ?? '#2563eb';
        const isSelected = marker.id === activeMarkerId;
        const icon = createMarkerIcon(
          color,
          (marker.shape as MarkerShape) ?? 'pin',
          (marker.markerSize as MarkerSize) ?? 'md',
          marker.markerIcon ?? null,
          isSelected,
        );

        return (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                if (!readOnly) {
                  setActiveMarker(marker.id);
                  setSidebarOpen(true);
                }
              },
            }}
          >
            {readOnly && (
              <Popup>
                <EmbedPopupContent marker={marker} />
              </Popup>
            )}
          </Marker>
        );
      })}
    </>
  );
}

function EmbedPopupContent({ marker }: { marker: MarkerType }) {
  const firstImage = marker.images?.[0];
  return (
    <div className="embed-popup" style={{ minWidth: 180 }}>
      {firstImage && (
        <img
          src={firstImage.url}
          alt={marker.title}
          style={{ margin: '-12px -14px 8px', width: 'calc(100% + 28px)', height: 100, objectFit: 'cover', display: 'block' }}
        />
      )}
      <h3 style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{marker.title}</h3>
      {marker.description && (
        <p style={{ fontFamily: 'inherit', fontSize: 13, color: '#6b7280', lineHeight: 1.4 }}>{marker.description}</p>
      )}
      {marker.date && (
        <p style={{ fontFamily: 'inherit', fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
          {new Date(marker.date).toLocaleDateString()}
        </p>
      )}
      {marker.category && (
        <span style={{
          display: 'inline-block', marginTop: 6,
          background: marker.category.color + '20',
          color: marker.category.color,
          border: `1px solid ${marker.category.color}40`,
          borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 500,
        }}>
          {marker.category.name}
        </span>
      )}
    </div>
  );
}
