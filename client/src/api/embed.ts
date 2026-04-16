import axios from 'axios';
import type { Marker, Category, MapRecord } from '@gpkarta/shared';

export interface EmbedData {
  id: string;
  title: string;
  description: string | null;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  categories: Category[];
  markers: Marker[];
}

export const embedApi = {
  get: (embedToken: string) =>
    axios
      .get<{ data: EmbedData }>(`/api/embed/${embedToken}`)
      .then((r) => r.data.data),
};
