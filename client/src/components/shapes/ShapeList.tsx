import React, { useState } from 'react';
import type { Shape, Category } from '@gpkarta/shared';
import { shapesApi } from '../../api/shapes';
import { useMapStore } from '../../store/mapStore';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ShapeForm } from './ShapeForm';

interface ShapeListProps {
  mapId: string;
  shapes: Shape[];
  categories: Category[];
}

export function ShapeList({ mapId, shapes, categories }: ShapeListProps) {
  const removeShape = useMapStore((s) => s.removeShape);
  const activeShapeId = useUiStore((s) => s.activeShapeId);
  const setActiveShape = useUiStore((s) => s.setActiveShape);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const [editingShape, setEditingShape] = useState<Shape | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(shape: Shape) {
    if (!confirm(`Delete "${shape.title || 'this shape'}"?`)) return;
    setDeleting(shape.id);
    try {
      await shapesApi.delete(mapId, shape.id);
      removeShape(shape.id);
      if (activeShapeId === shape.id) setActiveShape(null);
    } finally {
      setDeleting(null);
    }
  }

  if (shapes.length === 0) {
    return (
      <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>
        Use the drawing tools on the map to add lines and polygons
      </p>
    );
  }

  return (
    <>
      <div style={{ padding: '10px 0' }}>
        {shapes.map((shape) => {
          const isActive = shape.id === activeShapeId;
          return (
            <div
              key={shape.id}
              onClick={() => { setActiveShape(shape.id); setSidebarOpen(true); }}
              style={{
                padding: '10px 14px',
                marginBottom: 4,
                borderRadius: 8,
                border: `1px solid ${isActive ? shape.color : '#e5e7eb'}`,
                background: isActive ? `${shape.color}10` : '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {/* Shape type icon */}
              <svg width={20} height={20} viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                {shape.type === 'polygon' ? (
                  <polygon
                    points="10,2 18,7 15,17 5,17 2,7"
                    fill={shape.color + '40'} stroke={shape.color} strokeWidth={2}
                  />
                ) : (
                  <polyline
                    points="2,14 7,6 13,11 18,4"
                    fill="none" stroke={shape.color} strokeWidth={2.5} strokeLinecap="round"
                  />
                )}
              </svg>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shape.title || (shape.type === 'polygon' ? 'Untitled polygon' : 'Untitled line')}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>
                  {shape.type === 'polygon' ? 'Polygon' : 'Polyline'} · {shape.coordinates.length} points
                </p>
              </div>

              <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" onClick={() => setEditingShape(shape)}>Edit</Button>
                <Button
                  size="sm" variant="ghost"
                  loading={deleting === shape.id}
                  onClick={() => handleDelete(shape)}
                  style={{ color: '#dc2626' }}
                >
                  ✕
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!editingShape}
        onClose={() => setEditingShape(null)}
        title={`Edit ${editingShape?.type === 'polygon' ? 'polygon' : 'line'}`}
      >
        {editingShape && (
          <ShapeForm
            mapId={mapId}
            categories={categories}
            existing={editingShape}
            onClose={() => setEditingShape(null)}
          />
        )}
      </Modal>
    </>
  );
}
