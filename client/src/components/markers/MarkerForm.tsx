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
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl ?? '');
  const [color, setColor] = useState<string | null>(existing?.color ?? null);
  const [strokeColor, setStrokeColor] = useState<string | null>(existing?.strokeColor ?? null);
  const [strokeWidth, setStrokeWidth] = useState(existing?.strokeWidth ?? 1.5);
  const [opacity, setOpacity] = useState(existing?.opacity ?? 1.0);
  const [showStyle, setShowStyle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!existing;

  // Derive category colour for the style picker's "use category" fallback
  const categoryColor = categories.find((c) => c.id === categoryId)?.color ?? '#2563eb';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError('');
    try {
      const styleFields = {
        shape, markerSize, markerIcon: markerIcon || undefined,
        color: color || null,
        strokeColor: strokeColor || null,
        strokeWidth,
        opacity,
        videoUrl: videoUrl.trim() || null,
      };
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
      setError(err.response?.data?.error || 'Det gick inte att spara markören');
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
          placeholder="Markörens titel"
          required
          autoFocus
        />
      </FormField>

      <FormField label="Beskrivning">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Vad hände här?"
          rows={3}
        />
      </FormField>

      <FormField label="Kategori">
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— Ingen —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Datum">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormField>

      <FormField label="Video-URL (valfri)">
        <Input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube, Vimeo, eller direkt .mp4-länk…"
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
          Utseende
        </button>

        {showStyle && (
          <div style={{ marginTop: 12, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <MarkerStylePicker
              categoryColor={categoryColor}
              color={color}
              shape={shape}
              markerSize={markerSize}
              markerIcon={markerIcon}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              opacity={opacity}
              onColorChange={setColor}
              onShapeChange={setShape}
              onSizeChange={setMarkerSize}
              onIconChange={setMarkerIcon}
              onStrokeColorChange={setStrokeColor}
              onStrokeWidthChange={setStrokeWidth}
              onOpacityChange={setOpacity}
            />
          </div>
        )}
      </div>

      {isEdit && (
        <FormField label="Bilder">
          <ImageUpload
            markerId={existing.id}
            images={images}
            onImagesChange={setImages}
          />
        </FormField>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Button type="button" variant="secondary" onClick={onClose}>Avbryt</Button>
        <Button type="submit" loading={loading}>{isEdit ? 'Spara ändringar' : 'Lägg till markör'}</Button>
      </div>
    </form>
  );
}
