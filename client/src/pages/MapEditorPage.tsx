import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mapsApi } from '../api/maps';
import { markersApi } from '../api/markers';
import { categoriesApi } from '../api/categories';
import { useMapStore } from '../store/mapStore';
import { useUiStore } from '../store/uiStore';
import { Navbar } from '../components/layout/Navbar';
import { MapView } from '../components/map/MapView';
import { Sidebar } from '../components/layout/Sidebar';
import { Modal } from '../components/common/Modal';
import { MarkerForm } from '../components/markers/MarkerForm';
import { Button } from '../components/common/Button';
import { FullPageSpinner } from '../components/common/Spinner';
import '../styles/map.css';

export function MapEditorPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();

  const { currentMap, markers, categories, setCurrentMap, setMarkers, setCategories, reset } = useMapStore();
  const {
    sidebarOpen, toggleSidebar, isAddingMarker, setAddingMarker,
    modal, closeModal, pendingMarker, filterCategoryIds, filterFrom, filterTo,
  } = useUiStore();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Load map, markers, categories
  useEffect(() => {
    if (!mapId) return;
    reset();
    setLoading(true);

    Promise.all([
      mapsApi.get(mapId),
      markersApi.list(mapId),
      categoriesApi.list(mapId),
    ])
      .then(([map, markers, cats]) => {
        setCurrentMap(map);
        setMarkers(markers);
        setCategories(cats);
      })
      .catch(() => setError('Failed to load map'))
      .finally(() => setLoading(false));

    return () => reset();
  }, [mapId]);

  // Compute filtered markers
  const filteredMarkers = useMemo(() => {
    let result = markers;
    if (filterCategoryIds.length > 0) {
      result = result.filter((m) =>
        m.categoryId ? filterCategoryIds.includes(m.categoryId) : false,
      );
    }
    if (filterFrom) {
      const from = new Date(filterFrom);
      result = result.filter((m) => m.date && new Date(m.date) >= from);
    }
    if (filterTo) {
      const to = new Date(filterTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((m) => m.date && new Date(m.date) <= to);
    }
    return result;
  }, [markers, filterCategoryIds, filterFrom, filterTo]);

  if (loading) return <FullPageSpinner message="Loading map…" />;
  if (error || !currentMap) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ marginBottom: 16, color: '#dc2626' }}>{error || 'Map not found'}</p>
        <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar
        title={currentMap.title}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="sm"
              variant={isAddingMarker ? 'secondary' : 'primary'}
              onClick={() => setAddingMarker(!isAddingMarker)}
            >
              {isAddingMarker ? '✕ Cancel' : '+ Add marker'}
            </Button>
            <Button size="sm" variant="ghost" onClick={toggleSidebar}>
              {sidebarOpen ? '→ Hide panel' : '← Show panel'}
            </Button>
          </div>
        }
      />

      {isAddingMarker && (
        <div style={{
          background: '#fef3c7', borderBottom: '1px solid #fde68a',
          padding: '8px 16px', fontSize: 13, textAlign: 'center', color: '#92400e',
        }}>
          Click anywhere on the map to place a marker
        </div>
      )}

      <div className="map-editor-layout">
        <MapView
          map={currentMap}
          markers={markers}
          filteredMarkers={filteredMarkers}
        />
        <Sidebar
          map={currentMap}
          markers={markers}
          filteredMarkers={filteredMarkers}
          categories={categories}
        />
      </div>

      {/* Create marker modal — triggered after clicking on map */}
      <Modal
        open={modal === 'createMarker'}
        onClose={closeModal}
        title="New marker"
      >
        {pendingMarker && (
          <MarkerForm
            mapId={currentMap.id}
            categories={categories}
            pendingLat={pendingMarker.lat}
            pendingLng={pendingMarker.lng}
            onClose={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}
