import React, { useState } from 'react';
import type { Category } from '@gpkarta/shared';
import { categoriesApi } from '../../api/categories';
import { useMapStore } from '../../store/mapStore';
import { Button } from '../common/Button';
import { FormField, Input } from '../common/FormField';

const PRESET_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#d97706',
  '#7c3aed', '#db2777', '#0891b2', '#374151',
];

interface CategoryFormProps {
  mapId: string;
  existing?: Category;
  onClose: () => void;
}

export function CategoryForm({ mapId, existing, onClose }: CategoryFormProps) {
  const addCategory = useMapStore((s) => s.addCategory);
  const updateCategoryInStore = useMapStore((s) => s.updateCategory);

  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? '#2563eb');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      if (existing) {
        const updated = await categoriesApi.update(mapId, existing.id, { name: name.trim(), color });
        updateCategoryInStore(updated);
      } else {
        const created = await categoriesApi.create(mapId, { name: name.trim(), color });
        addCategory(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Name" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Incidents"
          required
          autoFocus
        />
      </FormField>

      <FormField label="Color">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 28, height: 28, borderRadius: '50%', background: c,
                border: color === c ? '3px solid white' : '2px solid transparent',
                outline: color === c ? `2px solid ${c}` : 'none',
                cursor: 'pointer',
              }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer' }}
            title="Custom color"
          />
        </div>
      </FormField>

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{existing ? 'Save' : 'Create'}</Button>
      </div>
    </form>
  );
}
