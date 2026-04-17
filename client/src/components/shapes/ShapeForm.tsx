import React, { useState } from 'react';
import type { Shape, Category } from '@gpkarta/shared';
import { shapesApi } from '../../api/shapes';
import { useMapStore } from '../../store/mapStore';
import { Button } from '../common/Button';
import { FormField, Input, Textarea, Select } from '../common/FormField';

interface ShapeFormProps {
  mapId: string;
  categories: Category[];
  onClose: () => void;
  existing?: Shape;
  pendingType?: 'polyline' | 'polygon';
  pendingCoordinates?: number[][];
}

const COLOR_PRESETS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#374151'];

export function ShapeForm({ mapId, categories, onClose, existing, pendingType, pendingCoordinates }: ShapeFormProps) {
  const addShape = useMapStore((s) => s.addShape);
  const updateShapeInStore = useMapStore((s) => s.updateShape);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [color, setColor] = useState(existing?.color ?? '#2563eb');
  const [weight, setWeight] = useState(existing?.weight ?? 3);
  const [fillOpacity, setFillOpacity] = useState(existing?.fillOpacity ?? 0.2);
  const [opacity, setOpacity] = useState(existing?.opacity ?? 1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!existing;
  const shapeType = existing?.type ?? pendingType ?? 'polyline';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        const updated = await shapesApi.update(mapId, existing.id, {
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          categoryId: categoryId || null,
          color,
          weight,
          fillOpacity,
          opacity,
        });
        updateShapeInStore(updated);
      } else {
        const created = await shapesApi.create(mapId, {
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          type: shapeType,
          coordinates: pendingCoordinates!,
          categoryId: categoryId || undefined,
          color,
          weight,
          fillOpacity,
          opacity,
        });
        addShape(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Det gick inte att spara formen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Titel">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={shapeType === 'polyline' ? 'Ruttnamn…' : 'Områdesnamn…'}
          autoFocus
        />
      </FormField>

      <FormField label="Beskrivning">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Valfri beskrivning"
          rows={2}
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

      <FormField label="Färg">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                cursor: 'pointer', outline: color === c ? `3px solid ${c}` : '3px solid transparent',
                outlineOffset: 2,
              }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: 32, height: 28, padding: 2, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer' }}
          />
        </div>
      </FormField>

      <FormField label={`Linjebredd: ${weight}px`}>
        <input
          type="range" min={1} max={12} value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </FormField>

      {shapeType === 'polygon' && (
        <FormField label={`Fyllningsopacitet: ${Math.round(fillOpacity * 100)}%`}>
          <input
            type="range" min={0} max={100} value={Math.round(fillOpacity * 100)}
            onChange={(e) => setFillOpacity(Number(e.target.value) / 100)}
            style={{ width: '100%' }}
          />
        </FormField>
      )}

      <FormField label={`Opacitet: ${Math.round(opacity * 100)}%`}>
        <input
          type="range" min={10} max={100} value={Math.round(opacity * 100)}
          onChange={(e) => setOpacity(Number(e.target.value) / 100)}
          style={{ width: '100%' }}
        />
      </FormField>

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Button type="button" variant="secondary" onClick={onClose}>Avbryt</Button>
        <Button type="submit" loading={loading}>{isEdit ? 'Spara ändringar' : 'Lägg till form'}</Button>
      </div>
    </form>
  );
}
