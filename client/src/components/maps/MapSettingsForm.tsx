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
  const [clusterColor, setClusterColor] = useState(existing?.clusterColor ?? '#2563eb');
  const [clusterBorderColor, setClusterBorderColor] = useState(existing?.clusterBorderColor ?? '#ffffff');
  const [showMinimap, setShowMinimap] = useState(existing?.showMinimap ?? false);
  const [showScaleBar, setShowScaleBar] = useState(existing?.showScaleBar ?? true);
  const [popupBg, setPopupBg] = useState(existing?.popupBg ?? '');
  const [popupTextColor, setPopupTextColor] = useState(existing?.popupTextColor ?? '');
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
        clusterColor: clusterMarkers ? clusterColor : null,
        clusterBorderColor: clusterMarkers ? clusterBorderColor : null,
        showMinimap,
        showScaleBar,
        popupBg: popupBg || null,
        popupTextColor: popupTextColor || null,
      };
      const map = existing
        ? await mapsApi.update(existing.id, payload)
        : await mapsApi.create(payload);
      onSave(map);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Det gick inte att spara kartan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Titel" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Min karta"
          required
          autoFocus
        />
      </FormField>

      <FormField label="Beskrivning">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Vad handlar den här kartan om?"
          rows={2}
        />
      </FormField>

      <FormField label="Kartstil">
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

      <FormField label="Visningsalternativ">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Gör kartan offentlig (delningsbar länk)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={clusterMarkers} onChange={(e) => setClusterMarkers(e.target.checked)} />
            Gruppera närliggande markörer
          </label>
          {clusterMarkers && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#374151', width: 90 }}>Klusterfärg</span>
                <input
                  type="color"
                  value={clusterColor}
                  onChange={(e) => setClusterColor(e.target.value)}
                  style={{ width: 36, height: 28, padding: 2, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#374151', width: 90 }}>Kantlinjefärg</span>
                <input
                  type="color"
                  value={clusterBorderColor}
                  onChange={(e) => setClusterBorderColor(e.target.value)}
                  style={{ width: 36, height: 28, padding: 2, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer' }}
                />
              </div>
            </div>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={showScaleBar} onChange={(e) => setShowScaleBar(e.target.checked)} />
            Visa skalstock
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={showMinimap} onChange={(e) => setShowMinimap(e.target.checked)} />
            Visa minikarta
          </label>
        </div>
      </FormField>

      <FormField label="Popup-stil">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#374151', width: 110 }}>Bakgrundsfärg</span>
            <input
              type="color"
              value={popupBg || '#ffffff'}
              onChange={(e) => setPopupBg(e.target.value)}
              style={{ width: 36, height: 28, padding: 2, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer' }}
            />
            {popupBg && (
              <button
                type="button"
                onClick={() => setPopupBg('')}
                style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Återställ
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#374151', width: 110 }}>Textfärg</span>
            <input
              type="color"
              value={popupTextColor || '#111827'}
              onChange={(e) => setPopupTextColor(e.target.value)}
              style={{ width: 36, height: 28, padding: 2, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer' }}
            />
            {popupTextColor && (
              <button
                type="button"
                onClick={() => setPopupTextColor('')}
                style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Återställ
              </button>
            )}
          </div>
          {(popupBg || popupTextColor) && (
            <div style={{
              padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              background: popupBg || '#ffffff',
              color: popupTextColor || '#111827',
              border: '1px solid #e5e7eb',
            }}>
              Förhandsgranskning av popup-text
            </div>
          )}
        </div>
      </FormField>

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Button type="button" variant="secondary" onClick={onClose}>Avbryt</Button>
        <Button type="submit" loading={loading}>{existing ? 'Spara ändringar' : 'Skapa karta'}</Button>
      </div>
    </form>
  );
}
