import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';

export function GeocoderControl() {
  const map = useMap();

  useEffect(() => {
    // leaflet-control-geocoder attaches itself to L.Control at import time
    const LC = L.Control as any;
    if (!LC.Geocoder) return;

    const geocoder = LC.geocoder({
      defaultMarkGeocode: false,
      geocoder: LC.Geocoder.nominatim(),
      placeholder: 'Search location…',
      errorMessage: 'Nothing found.',
    });

    geocoder.on('markgeocode', (e: any) => {
      const { bbox, center } = e.geocode;
      if (bbox) {
        map.fitBounds([
          [bbox.getSouth(), bbox.getWest()],
          [bbox.getNorth(), bbox.getEast()],
        ]);
      } else {
        map.setView(center, 14);
      }
    });

    geocoder.addTo(map);
    return () => { geocoder.remove(); };
  }, [map]);

  return null;
}
