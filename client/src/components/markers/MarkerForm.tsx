import React, { useState } from 'react';
import type { Marker, Category, MarkerShape, MarkerSize } from '@gpkarta/shared';
import { markersApi } from '../../api/markers';
import { useMapStore } from '../../store/mapStore';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../common/Button';
import { FormField, Input, Textarea, Select } from '../common/FormField';
import { ImageUpload } from '../common/ImageUpload';
import { MarkerStylePicker } from './MarkerStylePicker';

interface MarkerFormProps {
  mapId: string;
  categories: Category[];
  onClose: () => void;
  existing?: Marker;
  pendingLat?: number;
  pendingLng?: number;
}

export function MarkerForm({ mapId, categories, onClose, existing, pendingLat, pendingLng }: MarkerFormProps) {
  const addMarker = useMapStore((s) => s.addMarker);
  const updateMarkerInStore = useMapStore((s) => s.updateMarker);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [date, setDate] = useState(
    existing?.date ? new Date(existing.date).toISOString().slice(0, 10) : '',
  );
  const [images, setImages] = useState(existing?.images ?? []);
  const [shape, setShape] = useState<MarkerShape>(existing?.shape ?? 'pin');
  const [markerSize, setMarkerSize] = useState<MarkerSize>(existing?.markerSize ?? 'md');
  const [markerIcon, setMarkerIcon] = useState(existing?.markerIcon ?? '');
  const [showStyle, setShowStyle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!existing;

  // Derive preview colour from selected category
  const previewColor = categories.find((c) => c.id === categoryId)?.color ?? '#2563eb';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError('');
    try {
      const styleFields = { shape, markerSize, markerIcon: markerIcon || undefined };
      if (isEdit) {
        const updated = await markersApi.update(mapId, existing.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId || null,
          date: date ? new Date(date).toISOString() : undefined,
          ...styleFields,
        });
        updateMarkerInStore({ ...updated, images });
      } else {
        const created = await markersApi.create(mapId, {
          title: title.trim(),
          description: description.trim() || undefined,
          lat: pendingLat!,
          lng: pendingLng!,
          categoryId: categoryId || undefined,
          date: date ? new Date(date).toISOString() : undefined,
          ...styleFields,
        });
        addMarker(created);
        useUiStore.getState().setActiveMarker(created.id);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save marker');
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
          placeholder="Marker title"
          required
          autoFocus
        />
      </FormField>

      <FormField label="Description">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened here?"
          rows={3}
        />
      </FormField>

      <FormField label="Category">
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Date">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormField>

      {/* Collapsible style section */}
      <div style={{ marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => setShowStyle((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, color: '#2563eb', padding: 0,
          }}
        >
          <span style={{ fontSize: 11, transition: 'transform 0.15s', transform: showStyle ? 'rotate(90deg)' : 'none' }}>▶</span>
          Appearance
        </button>

        {showStyle && (
          <div style={{ marginTop: 12, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <MarkerStylePicker
              color={previewColor}
              shape={shape}
              markerSize={markerSize}
              markerIcon={markerIcon}
              onShapeChange={setShape}
              onSizeChange={setMarkerSize}
              onIconChange={setMarkerIcon}
            />
          </div>
        )}
      </div>

      {isEdit && (
        <FormField label="Images">
          <ImageUpload
            markerId={existing.id}
            images={images}
            onImagesChange={setImages}
          />
        </FormField>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{isEdit ? 'Save changes' : 'Add marker'}</Button>
      </div>
    </form>
  );
}
