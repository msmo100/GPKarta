import React, { useState } from 'react';
import type { Marker, Category } from '@gpkarta/shared';
import { markersApi } from '../../api/markers';
import { useMapStore } from '../../store/mapStore';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { MarkerForm } from './MarkerForm';
import { ImageUpload } from '../common/ImageUpload';

interface MarkerPanelProps {
  marker: Marker;
  mapId: string;
  categories: Category[];
}

export function MarkerPanel({ marker, mapId, categories }: MarkerPanelProps) {
  const removeMarker = useMapStore((s) => s.removeMarker);
  const updateMarker = useMapStore((s) => s.updateMarker);
  const setActiveMarker = useUiStore((s) => s.setActiveMarker);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Ta bort "${marker.title}"?`)) return;
    setDeleting(true);
    try {
      await markersApi.delete(mapId, marker.id);
      removeMarker(marker.id);
      setActiveMarker(null);
    } finally {
      setDeleting(false);
    }
  }

  const categoryColor = marker.category?.color ?? '#2563eb';

  return (
    <div>
      {/* Image gallery */}
      {marker.images?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <img
            src={marker.images[0].url}
            alt={marker.title}
            style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, display: 'block' }}
          />
          {marker.images.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginTop: 4 }}>
              {marker.images.slice(1).map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  style={{ width: '100%', height: 56, objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category badge */}
      {marker.category && (
        <span style={{
          display: 'inline-block', marginBottom: 10,
          background: categoryColor + '18',
          color: categoryColor,
          border: `1px solid ${categoryColor}40`,
          borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600,
        }}>
          {marker.category.name}
        </span>
      )}

      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{marker.title}</h2>

      {marker.date && (
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
          {new Date(marker.date).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}

      {marker.description && (
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 12, whiteSpace: 'pre-wrap' }}>
          {marker.description}
        </p>
      )}

      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
        {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
        {' · '}Tillagd {new Date(marker.createdAt).toLocaleDateString()}
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>Redigera</Button>
        <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>Ta bort</Button>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Redigera markör">
        <MarkerForm
          mapId={mapId}
          categories={categories}
          existing={marker}
          onClose={() => setEditOpen(false)}
        />
      </Modal>
    </div>
  );
}
