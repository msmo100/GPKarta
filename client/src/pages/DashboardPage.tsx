import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MapRecord } from '@gpkarta/shared';
import { mapsApi } from '../api/maps';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { MapSettingsForm } from '../components/maps/MapSettingsForm';
import { Spinner } from '../components/common/Spinner';

export function DashboardPage() {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<MapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    mapsApi.list().then(setMaps).finally(() => setLoading(false));
  }, []);

  async function handleDelete(map: MapRecord) {
    if (!confirm(`Ta bort "${map.title}"? Detta kan inte ångras.`)) return;
    setDeleting(map.id);
    try {
      await mapsApi.delete(map.id);
      setMaps((prev) => prev.filter((m) => m.id !== map.id));
    } finally {
      setDeleting(null);
    }
  }

  async function handleDuplicate(map: MapRecord) {
    setDuplicating(map.id);
    try {
      const copy = await mapsApi.duplicate(map.id);
      setMaps((prev) => [copy, ...prev]);
    } finally {
      setDuplicating(null);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            + Ny karta
          </Button>
        }
      />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mina kartor</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            {maps.length} karta{maps.length !== 1 ? 'r' : ''}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
            <Spinner />
          </div>
        ) : maps.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            background: '#fff', borderRadius: 12, border: '1px dashed #e5e7eb',
          }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Inga kartor än</p>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
              Skapa din första karta för att börja lägga till platser
            </p>
            <Button onClick={() => setCreateOpen(true)}>+ Skapa karta</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {maps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                onOpen={() => navigate(`/map/${map.id}`)}
                onDelete={() => handleDelete(map)}
                onDuplicate={() => handleDuplicate(map)}
                deleting={deleting === map.id}
                duplicating={duplicating === map.id}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Ny karta">
        <MapSettingsForm
          onSave={(map) => {
            setMaps((prev) => [map, ...prev]);
            setCreateOpen(false);
            navigate(`/map/${map.id}`);
          }}
          onClose={() => setCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}

function MapCard({
  map, onOpen, onDelete, onDuplicate, deleting, duplicating,
}: {
  map: MapRecord & { _count?: { markers: number } };
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  deleting: boolean;
  duplicating: boolean;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div
        onClick={onOpen}
        style={{
          height: 100, background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 32 }}>🗺️</span>
      </div>

      <div style={{ padding: '14px 16px', flex: 1 }}>
        <h3
          onClick={onOpen}
          style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, cursor: 'pointer', color: '#111827' }}
        >
          {map.title}
        </h3>
        {map.description && (
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {map.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#9ca3af', marginBottom: 12, flexWrap: 'wrap' }}>
          <span>{(map as any)._count?.markers ?? 0} markörer</span>
          {map.isPublic && (
            <a
              href={`/map/public/${map.id}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: '#16a34a', textDecoration: 'none' }}
            >
              Public ↗
            </a>
          )}
          {map.embedToken && <span style={{ color: '#7c3aed' }}>Inbäddningsbar</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Button size="sm" onClick={onOpen} style={{ flex: 1 }}>Öppna</Button>
          <Button size="sm" variant="ghost" loading={duplicating} onClick={onDuplicate} title="Duplicate map">
            ⧉
          </Button>
          <Button size="sm" variant="ghost" loading={deleting} onClick={onDelete} style={{ color: '#dc2626' }}>
            Ta bort
          </Button>
        </div>
      </div>
    </div>
  );
}
