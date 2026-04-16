import { useMapEvents } from 'react-leaflet';
import { useUiStore } from '../../store/uiStore';

export function MapClickHandler() {
  const isAddingMarker = useUiStore((s) => s.isAddingMarker);
  const setPendingMarker = useUiStore((s) => s.setPendingMarker);
  const openModal = useUiStore((s) => s.openModal);

  useMapEvents({
    click(e) {
      if (!isAddingMarker) return;
      setPendingMarker({ lat: e.latlng.lat, lng: e.latlng.lng });
      openModal('createMarker');
    },
  });

  return null;
}
