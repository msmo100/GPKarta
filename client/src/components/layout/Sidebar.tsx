import React, { useState } from 'react';
import type { MapRecord, Marker, Category, Shape } from '@gpkarta/shared';
import { useUiStore } from '../../store/uiStore';
import { useMapStore } from '../../store/mapStore';
import { FilterBar } from '../filters/FilterBar';
import { MarkerPanel } from '../markers/MarkerPanel';
import { MarkerCard } from '../markers/MarkerCard';
import { CategoryList } from '../categories/CategoryList';
import { ShapeList } from '../shapes/ShapeList';
import { ShapeForm } from '../shapes/ShapeForm';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { MapSettingsForm } from '../maps/MapSettingsForm';
import { EmbedSettings } from '../maps/EmbedSettings';
import { CsvImport } from '../import/CsvImport';
import { GeoImport } from '../import/GeoImport';
import { GlobalStylePanel } from '../markers/GlobalStylePanel';
import { shapesApi } from '../../api/shapes';

type Tab = 'markers' | 'shapes' | 'categories' | 'appearance';

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

  React.useEffect(() => {
    if (activeShapeId) setTab('shapes');
  }, [activeShapeId]);

  return (
    <aside className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>
      <div className="sidebar-header">
        {activeMarker ? (
          <button
            onClick={() => setActiveMarker(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Tillbaka
          </button>
        ) : activeShape ? (
          <button
            onClick={() => setActiveShape(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Tillbaka
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <TabButton active={tab === 'markers'} onClick={() => setTab('markers')}>
              Markörer ({filteredMarkers.length})
            </TabButton>
            <TabButton active={tab === 'shapes'} onClick={() => setTab('shapes')}>
              Former ({shapes.length})
            </TabButton>
            <TabButton active={tab === 'categories'} onClick={() => setTab('categories')}>
              Kategorier
            </TabButton>
            <TabButton active={tab === 'appearance'} onClick={() => setTab('appearance')}>
              Utseende
            </TabButton>
          </div>
        )}
        <div style={{ display: 'flex', gap: 4 }}>
          <Button variant="ghost" size="sm" onClick={() => setCsvOpen(true)} title="Importera CSV">↑ CSV</Button>
          <Button variant="ghost" size="sm" onClick={() => setGeoOpen(true)} title="Importera/Exportera GeoJSON, GPX, KML">↑ Geo</Button>
          <button
            onClick={() => setSettingsOpen(true)}
            title="Kartinställningar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 6, border: '1px solid #e5e7eb',
              background: '#f9fafb', cursor: 'pointer', fontSize: 16, color: '#374151',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
          >⚙</button>
          <Button variant="ghost" size="sm" onClick={() => setEmbedOpen(true)} title="Bädda in">{'</>'}</Button>
        </div>
      </div>

      <div className="sidebar-content">
        {activeMarker ? (
          <MarkerPanel key={activeMarker.id} marker={activeMarker} mapId={map.id} categories={categories} />
        ) : activeShape ? (
          <ShapeDetailPanel shape={activeShape} mapId={map.id} categories={categories} onBack={() => setActiveShape(null)} />
        ) : tab === 'markers' ? (
          <>
            <FilterBar categories={categories} />
            <div style={{ padding: '10px 0' }}>
              {filteredMarkers.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>
                  {markers.length === 0
                    ? 'Klicka "+ Lägg till markör" eller använd ritverktygen på kartan'
                    : 'Inga markörer matchar de aktiva filtren'}
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
        ) : tab === 'categories' ? (
          <CategoryList mapId={map.id} categories={categories} />
        ) : (
          <GlobalStylePanel mapId={map.id} markerCount={markers.length} />
        )}
      </div>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Kartinställningar" width={520}>
        <MapSettingsForm
          existing={map}
          onSave={(updated) => { setCurrentMap(updated); setSettingsOpen(false); }}
          onClose={() => setSettingsOpen(false)}
        />
      </Modal>

      <Modal open={embedOpen} onClose={() => setEmbedOpen(false)} title="Bädda in karta">
        <EmbedSettings map={map} onMapUpdate={(updated) => setCurrentMap(updated)} />
      </Modal>

      <Modal open={csvOpen} onClose={() => setCsvOpen(false)} title="Importera CSV" width={600}>
        <CsvImport mapId={map.id} categories={categories} onDone={() => setCsvOpen(false)} />
      </Modal>

      <Modal open={geoOpen} onClose={() => setGeoOpen(false)} title="Importera / Exportera" width={520}>
        <GeoImport mapId={map.id} categories={categories} onDone={() => setGeoOpen(false)} />
      </Modal>
    </aside>
  );
}

function ShapeDetailPanel({ shape, mapId, categories, onBack }: {
  shape: Shape; mapId: string; categories: Category[]; onBack: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const removeShape = useMapStore((s) => s.removeShape);

  async function handleDelete() {
    if (!confirm(`Ta bort "${shape.title || 'den här formen'}"?`)) return;
    await shapesApi.delete(mapId, shape.id);
    removeShape(shape.id);
    onBack();
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: shape.color, flexShrink: 0 }} />
        <h2 style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>
          {shape.title || (shape.type === 'polygon' ? 'Namnlös polygon' : 'Namnlös linje')}
        </h2>
      </div>

      {shape.description && (
        <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 12 }}>{shape.description}</p>
      )}

      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
        {shape.type === 'polygon' ? 'Polygon' : 'Linje'} · {shape.coordinates.length} hörn
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
        <Button size="sm" onClick={() => setEditOpen(true)} style={{ flex: 1 }}>Redigera</Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} style={{ color: '#dc2626' }}>Ta bort</Button>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Redigera form">
        <ShapeForm
          mapId={mapId}
          categories={categories}
          existing={shape}
          onClose={() => setEditOpen(false)}
        />
      </Modal>
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
