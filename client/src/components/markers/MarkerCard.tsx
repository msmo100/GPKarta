import React from 'react';
import type { Marker } from '@gpkarta/shared';
import { useUiStore } from '../../store/uiStore';

interface MarkerCardProps {
  marker: Marker;
  active?: boolean;
}

export function MarkerCard({ marker, active }: MarkerCardProps) {
  const setActiveMarker = useUiStore((s) => s.setActiveMarker);
  const color = marker.category?.color ?? '#2563eb';

  return (
    <div
      onClick={() => setActiveMarker(marker.id)}
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        border: `1px solid ${active ? color : '#e5e7eb'}`,
        background: active ? color + '08' : '#fff',
        cursor: 'pointer',
        marginBottom: 6,
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)', background: color,
          flexShrink: 0, marginTop: 4,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {marker.title}
          </p>
          {marker.description && (
            <p style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {marker.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 11, color: '#9ca3af' }}>
            {marker.date && <span>{new Date(marker.date).toLocaleDateString()}</span>}
            {marker.images?.length > 0 && <span>{marker.images.length} foto{marker.images.length > 1 ? 'n' : ''}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
