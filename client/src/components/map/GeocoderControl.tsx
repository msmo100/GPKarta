import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
// @ts-ignore
import * as GeocoderLib from 'leaflet-control-geocoder';

export function GeocoderControl() {
  const map = useMap();

  useEffect(() => {
    const Geocoder = GeocoderLib.default ?? GeocoderLib;
    const geocoder = Geocoder.geocoder
      ? Geocoder.geocoder({ defaultMarkGeocode: false })
      : (L.Control as any).geocoder({ defaultMarkGeocode: false });

    geocoder.on('markgeocode', (e: any) => {
      const { bbox, center } = e.geocode;
      if (bbox) {
        map.fitBounds([[bbox.getSouth(), bbox.getWest()], [bbox.getNorth(), bbox.getEast()]]);
      } else {
        map.setView(center, 14);
      }
    });

    geocoder.addTo(map);

    return () => {
      geocoder.remove();
    };
  }, [map]);

  return null;
}
