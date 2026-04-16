import type { TileLayerKey } from '@gpkarta/shared';

export interface TileLayerDef {
  key: TileLayerKey;
  label: string;
  url: string;
  attribution: string;
  dark?: boolean;
}

export const TILE_LAYERS: TileLayerDef[] = [
  {
    key: 'osm',
    label: 'OpenStreetMap (Standard)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    key: 'carto-light',
    label: 'Carto Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
  {
    key: 'carto-light-nolabels',
    label: 'Carto Light (no labels)',
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
  {
    key: 'carto-dark',
    label: 'Carto Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    dark: true,
  },
  {
    key: 'carto-dark-nolabels',
    label: 'Carto Dark (no labels)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    dark: true,
  },
];

export function getTileLayer(key: TileLayerKey): TileLayerDef {
  return TILE_LAYERS.find((t) => t.key === key) ?? TILE_LAYERS[0];
}
