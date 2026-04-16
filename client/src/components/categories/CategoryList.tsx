import React, { useState } from 'react';
import type { Category } from '@gpkarta/shared';
import { categoriesApi } from '../../api/categories';
import { useMapStore } from '../../store/mapStore';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { CategoryForm } from './CategoryForm';

interface CategoryListProps {
  mapId: string;
  categories: Category[];
}

export function CategoryList({ mapId, categories }: CategoryListProps) {
  const removeCategory = useMapStore((s) => s.removeCategory);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"? Markers will be unassigned.`)) return;
    await categoriesApi.delete(mapId, cat.id);
    removeCategory(cat.id);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Categories</h3>
        <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>+ New</Button>
      </div>

      {categories.length === 0 ? (
        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>
          No categories yet
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 6,
                background: '#f9fafb', border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
              <button
                onClick={() => setEditTarget(cat)}
                style={{ background: 'none', border: 'none', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat)}
                style={{ background: 'none', border: 'none', fontSize: 12, color: '#dc2626', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New category">
        <CategoryForm mapId={mapId} onClose={() => setAddOpen(false)} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit category">
        {editTarget && (
          <CategoryForm mapId={mapId} existing={editTarget} onClose={() => setEditTarget(null)} />
        )}
      </Modal>
    </div>
  );
}
