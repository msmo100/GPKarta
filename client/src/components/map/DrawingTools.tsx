import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useUiStore } from '../../store/uiStore';

interface DrawingToolsProps {
  enabled: boolean;
}

export function DrawingTools({ enabled }: DrawingToolsProps) {
  const map = useMap();
  const setDrawingShape = useUiStore((s) => s.setDrawingShape);
  const setPendingShape = useUiStore((s) => s.setPendingShape);
  const openModal = useUiStore((s) => s.openModal);

  useEffect(() => {
    if (!enabled) return;

    (map as any).pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawRectangle: true,
      drawPolyline: true,
      drawPolygon: true,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: false,
      rotateMode: false,
    });

    const handleDrawStart = () => setDrawingShape(true);
    const handleDrawEnd = () => setDrawingShape(false);

    const handleCreate = (e: any) => {
      const { layer, shape } = e;
      map.removeLayer(layer);
      setDrawingShape(false);

      let coordinates: number[][] = [];
      if (shape === 'Polygon' || shape === 'Rectangle') {
        const latlngs = (layer as L.Polygon).getLatLngs();
        const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
        coordinates = (ring as L.LatLng[]).map((ll) => [ll.lat, ll.lng]);
      } else {
        const latlngs = (layer as L.Polyline).getLatLngs() as L.LatLng[];
        coordinates = latlngs.map((ll) => [ll.lat, ll.lng]);
      }

      const type = shape === 'Line' ? 'polyline' : 'polygon';
      setPendingShape({ type, coordinates });
      openModal('createShape');
    };

    map.on('pm:drawstart', handleDrawStart);
    map.on('pm:drawend', handleDrawEnd);
    map.on('pm:create', handleCreate);

    return () => {
      map.off('pm:drawstart', handleDrawStart);
      map.off('pm:drawend', handleDrawEnd);
      map.off('pm:create', handleCreate);
      (map as any).pm.removeControls();
    };
  }, [map, enabled]);

  return null;
}
