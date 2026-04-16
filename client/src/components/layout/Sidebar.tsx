import React, { useState } from 'react';
import type { MapRecord, Marker, Category, Shape } from '@gpkarta/shared';
import { useUiStore } from '../../store/uiStore';
import { FilterBar } from '../filters/FilterBar';
import { MarkerPanel } from '../markers/MarkerPanel';
import { MarkerCard } from '../markers/MarkerCard';
import { CategoryList } from '../categories/CategoryList';
import { ShapeList } from '../shapes/ShapeList';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { MapSettingsForm } from '../maps/MapSettingsForm';
import { EmbedSettings } from '../maps/EmbedSettings';
import { CsvImport } from '../import/CsvImport';
import { GeoImport } from '../import/GeoImport';
import { useMapStore } from '../../store/mapStore';

type Tab = 'markers' | 'shapes' | 'categories';

interface SidebarProps {
  map: MapRecord;
  markers: Marker[];
  filteredMarkers: Marker[];
  categories: Category[];
  shapes: Shape[];
}

export function Sidebar({ map, markers, filteredMarkers, categories, shapes }: SidebarProps) {
  const activeMarkerId = useUiStore((s) => s.activeMarkerId);
  const activeShapeId = useUiStore((s) => s.activeShapeId);
  const setActiveMarker = useUiStore((s) => s.setActiveMarker);
  const setActiveShape = useUiStore((s) => s.setActiveShape);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setCurrentMap = useMapStore((s) => s.setCurrentMap);

  const [tab, setTab] = useState<Tab>('markers');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [geoOpen, setGeoOpen] = useState(false);

  const activeMarker = markers.find((m) => m.id === activeMarkerId);
  const activeShape = shapes.find((s) => s.id === activeShapeId);

  // Auto-switch tab when a shape is activated
  React.useEffect(() => {
    if (activeShapeId) setTab('shapes');
  }, [activeShapeId]);

  return (
    <aside className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>
      {/* Header */}
      <div className="sidebar-header">
        {activeMarker ? (
          <button
            onClick={() => setActiveMarker(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Back
          </button>
        ) : activeShape ? (
          <button
            onClick={() => setActiveShape(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Back
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <TabButton active={tab === 'markers'} onClick={() => setTab('markers')}>
              Markers ({filteredMarkers.length})
            </TabButton>
            <TabButton active={tab === 'shapes'} onClick={() => setTab('shapes')}>
              Shapes ({shapes.length})
            </TabButton>
            <TabButton active={tab === 'categories'} onClick={() => setTab('categories')}>
              Categories
            </TabButton>
          </div>
        )}
        <div style={{ display: 'flex', gap: 4 }}>
          <Button variant="ghost" size="sm" onClick={() => setCsvOpen(true)} title="Import CSV">
            ↑ CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setGeoOpen(true)} title="Import/Export GeoJSON, GPX, KML">
            ↑ Geo
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)} title="Map settings">
            ⚙
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEmbedOpen(true)} title="Embed">
            {'</>'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {activeMarker ? (
          <MarkerPanel marker={activeMarker} mapId={map.id} categories={categories} />
        ) : activeShape ? (
          <ShapePanel shape={activeShape} mapId={map.id} categories={categories} onBack={() => setActiveShape(null)} />
        ) : tab === 'markers' ? (
          <>
            <FilterBar categories={categories} />
            <div style={{ padding: '10px 0' }}>
              {filteredMarkers.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>
                  {markers.length === 0
                    ? 'Click "+ Add marker" or use the drawing tools on the map'
                    : 'No markers match the active filters'}
                </p>
              ) : (
                filteredMarkers.map((m) => (
                  <MarkerCard key={m.id} marker={m} active={m.id === activeMarkerId} />
                ))
              )}
            </div>
          </>
        ) : tab === 'shapes' ? (
          <ShapeList mapId={map.id} shapes={shapes} categories={categories} />
        ) : (
          <CategoryList mapId={map.id} categories={categories} />
        )}
      </div>

      {/* Map settings modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Map settings" width={520}>
        <MapSettingsForm
          existing={map}
          onSave={(updated) => { setCurrentMap(updated); setSettingsOpen(false); }}
          onClose={() => setSettingsOpen(false)}
        />
      </Modal>

      {/* Embed modal */}
      <Modal open={embedOpen} onClose={() => setEmbedOpen(false)} title="Embed map">
        <EmbedSettings map={map} onMapUpdate={(updated) => setCurrentMap(updated)} />
      </Modal>

      {/* CSV import modal */}
      <Modal open={csvOpen} onClose={() => setCsvOpen(false)} title="Import CSV" width={600}>
        <CsvImport
          mapId={map.id}
          categories={categories}
          onDone={() => setCsvOpen(false)}
        />
      </Modal>

      {/* Geo import/export modal */}
      <Modal open={geoOpen} onClose={() => setGeoOpen(false)} title="Import / Export" width={520}>
        <GeoImport
          mapId={map.id}
          categories={categories}
          onDone={() => setGeoOpen(false)}
        />
      </Modal>
    </aside>
  );
}

// Inline shape detail panel (shown when a shape is active)
function ShapePanel({ shape, mapId, categories, onBack }: {
  shape: Shape; mapId: string; categories: Category[]; onBack: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const removeShape = useMapStore((s) => s.removeShape);
  const { shapesApi } = require('../../api/shapes');
  const { ShapeForm } = require('../shapes/ShapeForm');
  const { Modal: ModalComp } = require('../common/Modal');

  async function handleDelete() {
    if (!confirm(`Delete "${shape.title || 'this shape'}"?`)) return;
    await shapesApi.delete(mapId, shape.id);
    removeShape(shape.id);
    onBack();
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: shape.color, flexShrink: 0 }} />
        <h2 style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>
          {shape.title || (shape.type === 'polygon' ? 'Untitled polygon' : 'Untitled line')}
        </h2>
      </div>

      {shape.description && (
        <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 12 }}>{shape.description}</p>
      )}

      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
        {shape.type === 'polygon' ? 'Polygon' : 'Polyline'} · {shape.coordinates.length} vertices
        {shape.category && (
          <span style={{
            display: 'inline-block', marginLeft: 8,
            background: shape.category.color + '20', color: shape.category.color,
            border: `1px solid ${shape.category.color}40`,
            borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 500,
          }}>{shape.category.name}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" onClick={() => setEditOpen(true)} style={{ flex: 1 }}>Edit</Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} style={{ color: '#dc2626' }}>Delete</Button>
      </div>

      <ModalComp open={editOpen} onClose={() => setEditOpen(false)} title="Edit shape">
        <ShapeForm
          mapId={mapId}
          categories={categories}
          existing={shape}
          onClose={() => setEditOpen(false)}
        />
      </ModalComp>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: active ? 600 : 400,
        background: active ? '#2563eb' : 'transparent',
        color: active ? '#fff' : '#6b7280',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
