import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mapsApi } from '../api/maps';
import { markersApi } from '../api/markers';
import { categoriesApi } from '../api/categories';
import { shapesApi } from '../api/shapes';
import { useMapStore } from '../store/mapStore';
import { useUiStore } from '../store/uiStore';
import { Navbar } from '../components/layout/Navbar';
import { MapView } from '../components/map/MapView';
import { Sidebar } from '../components/layout/Sidebar';
import { Modal } from '../components/common/Modal';
import { MarkerForm } from '../components/markers/MarkerForm';
import { MarkerPopupModal } from '../components/markers/MarkerPopupModal';
import { ShapeForm } from '../components/shapes/ShapeForm';
import { Button } from '../components/common/Button';
import { FullPageSpinner } from '../components/common/Spinner';
import { FilterPanel } from '../components/filters/FilterPanel';
import '../styles/map.css';

export function MapEditorPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();

  const { currentMap, markers, categories, shapes, setCurrentMap, setMarkers, setCategories, setShapes, reset } = useMapStore();
  const {
    sidebarOpen, toggleSidebar, isAddingMarker, setAddingMarker,
    modal, closeModal, pendingMarker, pendingShape,
    filterCategoryIds, filterFrom, filterTo,
    filterGenderVictim, filterAgeMin, filterAgeMax,
    filterGenderPerpetrator, filterPunishment,
    filterPunishmentYearsMin, filterPunishmentYearsMax,
    markerPopupOpen, closeMarkerPopup, activeMarkerId,
    toggleFilterPanel,
  } = useUiStore();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  useEffect(() => {
    if (!mapId) return;
    reset();
    setLoading(true);

    Promise.all([
      mapsApi.get(mapId),
      markersApi.list(mapId),
      categoriesApi.list(mapId),
      shapesApi.list(mapId),
    ])
      .then(([map, mkrs, cats, shps]) => {
        setCurrentMap(map);
        setMarkers(mkrs);
        setCategories(cats);
        setShapes(shps);
      })
      .catch(() => setError('Det gick inte att ladda kartan'))
      .finally(() => setLoading(false));

    return () => reset();
  }, [mapId]);

  const filteredMarkers = useMemo(() => {
    let result = markers;
    if (filterCategoryIds.length > 0)
      result = result.filter((m) => m.categoryId ? filterCategoryIds.includes(m.categoryId) : false);
    if (filterFrom)
      result = result.filter((m) => m.date && new Date(m.date) >= new Date(filterFrom));
    if (filterTo) {
      const to = new Date(filterTo); to.setHours(23, 59, 59, 999);
      result = result.filter((m) => m.date && new Date(m.date) <= to);
    }
    if (filterGenderVictim.length > 0)
      result = result.filter((m) => m.genderVictim && filterGenderVictim.includes(m.genderVictim));
    if (filterAgeMin > 0 || filterAgeMax < 100)
      result = result.filter((m) => m.ageVictim != null && m.ageVictim >= filterAgeMin && m.ageVictim <= filterAgeMax);
    if (filterGenderPerpetrator.length > 0)
      result = result.filter((m) => m.genderPerpetrator && filterGenderPerpetrator.includes(m.genderPerpetrator));
    if (filterPunishment.length > 0)
      result = result.filter((m) => m.punishment && filterPunishment.includes(m.punishment));
    if (filterPunishmentYearsMin > 0 || filterPunishmentYearsMax < 100)
      result = result.filter((m) => m.punishmentYears != null && m.punishmentYears >= filterPunishmentYearsMin && m.punishmentYears <= filterPunishmentYearsMax);
    return result;
  }, [markers, filterCategoryIds, filterFrom, filterTo,
      filterGenderVictim, filterAgeMin, filterAgeMax,
      filterGenderPerpetrator, filterPunishment,
      filterPunishmentYearsMin, filterPunishmentYearsMax]);

  if (loading) return <FullPageSpinner message="Laddar karta…" />;
  if (error || !currentMap) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ marginBottom: 16, color: '#dc2626' }}>{error || 'Kartan hittades inte'}</p>
        <Button onClick={() => navigate('/dashboard')}>Tillbaka till instrumentpanelen</Button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar
        title={currentMap.title}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="ghost" onClick={toggleFilterPanel}>
              Filter
            </Button>
            <Button
              size="sm"
              variant={isAddingMarker ? 'secondary' : 'primary'}
              onClick={() => setAddingMarker(!isAddingMarker)}
            >
              {isAddingMarker ? '✕ Avbryt' : '+ Lägg till markör'}
            </Button>
            <Button size="sm" variant="ghost" onClick={toggleSidebar}>
              {sidebarOpen ? '→ Dölj panel' : '← Visa panel'}
            </Button>
          </div>
        }
      />

      {isAddingMarker && (
        <div style={{
          background: '#fef3c7', borderBottom: '1px solid #fde68a',
          padding: '8px 16px', fontSize: 13, textAlign: 'center', color: '#92400e',
        }}>
          Klicka var som helst på kartan för att placera en markör
        </div>
      )}

      <div className="map-editor-layout" style={{ position: 'relative' }}>
        <FilterPanel
          categories={categories}
          markers={markers}
          totalCount={markers.length}
          filteredCount={filteredMarkers.length}
        />
        <MapView
          map={currentMap}
          markers={markers}
          filteredMarkers={filteredMarkers}
          shapes={shapes}
        />
        <Sidebar
          map={currentMap}
          markers={markers}
          filteredMarkers={filteredMarkers}
          categories={categories}
          shapes={shapes}
        />
      </div>

      {/* Create marker modal */}
      <Modal open={modal === 'createMarker'} onClose={closeModal} title="Ny markör">
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

      {/* Marker popup */}
      <MarkerPopupModal
        marker={markers.find((m) => m.id === activeMarkerId) ?? null}
        open={markerPopupOpen}
        onClose={closeMarkerPopup}
        mapId={currentMap.id}
        categories={categories}
        popupBg={currentMap.popupBg}
        popupTextColor={currentMap.popupTextColor}
      />

      {/* Create shape modal */}
      <Modal open={modal === 'createShape'} onClose={closeModal} title={`Ny ${pendingShape?.type === 'polygon' ? 'polygon' : pendingShape?.type === 'polyline' ? 'linje' : 'form'}`}>
        {pendingShape && (
          <ShapeForm
            mapId={currentMap.id}
            categories={categories}
            pendingType={pendingShape.type}
            pendingCoordinates={pendingShape.coordinates}
            onClose={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}
