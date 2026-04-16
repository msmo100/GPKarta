import React, { useState } from 'react';
import type { MapRecord, TileLayerKey } from '@gpkarta/shared';
import { mapsApi } from '../../api/maps';
import { Button } from '../common/Button';
import { FormField, Input, Textarea } from '../common/FormField';
import { TILE_LAYERS } from '../../config/tileLayers';

interface MapSettingsFormProps {
  existing?: MapRecord;
  onSave: (map: MapRecord) => void;
  onClose: () => void;
}

export function MapSettingsForm({ existing, onSave, onClose }: MapSettingsFormProps) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [isPublic, setIsPublic] = useState(existing?.isPublic ?? false);
  const [tileLayer, setTileLayer] = useState<TileLayerKey>(existing?.tileLayer ?? 'osm');
  const [clusterMarkers, setClusterMarkers] = useState(existing?.clusterMarkers ?? false);
  const [showMinimap, setShowMinimap] = useState(existing?.showMinimap ?? false);
  const [showScaleBar, setShowScaleBar] = useState(existing?.showScaleBar ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        isPublic,
        tileLayer,
        clusterMarkers,
        showMinimap,
        showScaleBar,
      };
      const map = existing
        ? await mapsApi.update(existing.id, payload)
        : await mapsApi.create(payload);
      onSave(map);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save map');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Title" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Map"
          required
          autoFocus
        />
      </FormField>

      <FormField label="Description">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this map about?"
          rows={2}
        />
      </FormField>

      <FormField label="Map style">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {TILE_LAYERS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTileLayer(t.key)}
              style={{
                padding: '8px 10px',
                borderRadius: 7,
                border: `2px solid ${tileLayer === t.key ? '#2563eb' : '#e5e7eb'}`,
                background: t.dark ? '#1a1a2e' : '#f8fafc',
                color: t.dark ? '#e2e8f0' : '#374151',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: tileLayer === t.key ? 600 : 400,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                transition: 'border-color 0.15s',
              }}
            >
              <span style={{
                width: 24, height: 16, borderRadius: 3, flexShrink: 0,
                background: t.dark
                  ? 'linear-gradient(135deg,#1a1a2e,#16213e)'
                  : 'linear-gradient(135deg,#e8f4f8,#d1e8d1)',
                border: '1px solid rgba(0,0,0,0.1)',
              }} />
              {t.label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Display options">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Make this map publicly viewable (shareable link)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={clusterMarkers} onChange={(e) => setClusterMarkers(e.target.checked)} />
            Cluster nearby markers
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={showScaleBar} onChange={(e) => setShowScaleBar(e.target.checked)} />
            Show scale bar
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={showMinimap} onChange={(e) => setShowMinimap(e.target.checked)} />
            Show minimap
          </label>
        </div>
      </FormField>

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{existing ? 'Save changes' : 'Create map'}</Button>
      </div>
    </form>
  );
}
