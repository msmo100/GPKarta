import React, { useState, useRef } from 'react';
import type { Category } from '@gpkarta/shared';
import { markersApi } from '../../api/markers';
import { shapesApi } from '../../api/shapes';
import { categoriesApi } from '../../api/categories';
import { useMapStore } from '../../store/mapStore';
import { Button } from '../common/Button';

interface GeoImportProps {
  mapId: string;
  categories: Category[];
  onDone: () => void;
}

type ImportFormat = 'geojson' | 'gpx' | 'kml';

interface ParsedFeature {
  type: 'marker' | 'polyline' | 'polygon';
  title?: string;
  description?: string;
  lat?: number;
  lng?: number;
  coordinates?: number[][];
  color?: string;
}

// ── GeoJSON parser ──────────────────────────────────────────
function parseGeoJSON(text: string): ParsedFeature[] {
  const json = JSON.parse(text);
  const features = json.type === 'FeatureCollection' ? json.features : [json];
  const result: ParsedFeature[] = [];

  for (const f of features) {
    const props = f.properties ?? {};
    const title = props.title ?? props.name ?? props.label ?? undefined;
    const description = props.description ?? props.desc ?? props.notes ?? undefined;
    const color = props.color ?? props['marker-color'] ?? props.stroke ?? undefined;
    const geom = f.geometry;
    if (!geom) continue;

    if (geom.type === 'Point') {
      result.push({ type: 'marker', title, description, lat: geom.coordinates[1], lng: geom.coordinates[0] });
    } else if (geom.type === 'LineString') {
      result.push({ type: 'polyline', title, description, color, coordinates: geom.coordinates.map((c: number[]) => [c[1], c[0]]) });
    } else if (geom.type === 'Polygon') {
      result.push({ type: 'polygon', title, description, color, coordinates: geom.coordinates[0].map((c: number[]) => [c[1], c[0]]) });
    } else if (geom.type === 'MultiPoint') {
      for (const c of geom.coordinates) {
        result.push({ type: 'marker', title, description, lat: c[1], lng: c[0] });
      }
    }
  }
  return result;
}

// ── GPX parser ──────────────────────────────────────────────
function parseGPX(text: string): ParsedFeature[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const result: ParsedFeature[] = [];

  // Waypoints → markers
  for (const wpt of Array.from(doc.querySelectorAll('wpt'))) {
    const lat = parseFloat(wpt.getAttribute('lat') ?? '0');
    const lng = parseFloat(wpt.getAttribute('lon') ?? '0');
    const title = wpt.querySelector('name')?.textContent ?? undefined;
    const description = wpt.querySelector('desc')?.textContent ?? undefined;
    result.push({ type: 'marker', title, description, lat, lng });
  }

  // Tracks → polylines
  for (const trk of Array.from(doc.querySelectorAll('trk'))) {
    const title = trk.querySelector('name')?.textContent ?? undefined;
    const coords: number[][] = [];
    for (const pt of Array.from(trk.querySelectorAll('trkpt'))) {
      const lat = parseFloat(pt.getAttribute('lat') ?? '0');
      const lng = parseFloat(pt.getAttribute('lon') ?? '0');
      coords.push([lat, lng]);
    }
    if (coords.length >= 2) result.push({ type: 'polyline', title, coordinates: coords });
  }

  // Routes → polylines
  for (const rte of Array.from(doc.querySelectorAll('rte'))) {
    const title = rte.querySelector('name')?.textContent ?? undefined;
    const coords: number[][] = [];
    for (const pt of Array.from(rte.querySelectorAll('rtept'))) {
      const lat = parseFloat(pt.getAttribute('lat') ?? '0');
      const lng = parseFloat(pt.getAttribute('lon') ?? '0');
      coords.push([lat, lng]);
    }
    if (coords.length >= 2) result.push({ type: 'polyline', title, coordinates: coords });
  }

  return result;
}

// ── KML parser ──────────────────────────────────────────────
function parseKML(text: string): ParsedFeature[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const result: ParsedFeature[] = [];

  for (const pm of Array.from(doc.querySelectorAll('Placemark'))) {
    const title = pm.querySelector('name')?.textContent ?? undefined;
    const description = pm.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '') ?? undefined;

    const point = pm.querySelector('Point coordinates');
    if (point) {
      const parts = point.textContent!.trim().split(',');
      result.push({ type: 'marker', title, description, lat: parseFloat(parts[1]), lng: parseFloat(parts[0]) });
      continue;
    }

    const line = pm.querySelector('LineString coordinates');
    if (line) {
      const coords = line.textContent!.trim().split(/\s+/).map((p) => {
        const parts = p.split(',');
        return [parseFloat(parts[1]), parseFloat(parts[0])];
      }).filter((c) => !isNaN(c[0]));
      if (coords.length >= 2) result.push({ type: 'polyline', title, description, coordinates: coords });
      continue;
    }

    const poly = pm.querySelector('Polygon outerBoundaryIs coordinates, Polygon outerBoundaryIs LinearRing coordinates');
    if (poly) {
      const coords = poly.textContent!.trim().split(/\s+/).map((p) => {
        const parts = p.split(',');
        return [parseFloat(parts[1]), parseFloat(parts[0])];
      }).filter((c) => !isNaN(c[0]));
      if (coords.length >= 3) result.push({ type: 'polygon', title, description, coordinates: coords });
    }
  }
  return result;
}

export function GeoImport({ mapId, categories, onDone }: GeoImportProps) {
  const addMarker = useMapStore((s) => s.addMarker);
  const addShape = useMapStore((s) => s.addShape);
  const addCategory = useMapStore((s) => s.addCategory);

  const [format, setFormat] = useState<ImportFormat>('geojson');
  const [features, setFeatures] = useState<ParsedFeature[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError('');
    setFeatures(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target!.result as string;
        let parsed: ParsedFeature[] = [];
        if (format === 'geojson') parsed = parseGeoJSON(text);
        else if (format === 'gpx') parsed = parseGPX(text);
        else parsed = parseKML(text);
        setFeatures(parsed);
      } catch {
        setError('Could not parse file — check format is correct');
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!features) return;
    setImporting(true);
    setError('');
    try {
      const markerFeatures = features.filter((f) => f.type === 'marker');
      const shapeFeatures = features.filter((f) => f.type !== 'marker');

      if (markerFeatures.length > 0) {
        const created = await markersApi.bulkCreate(mapId, markerFeatures.map((f) => ({
          title: f.title || 'Imported marker',
          description: f.description,
          lat: f.lat!,
          lng: f.lng!,
        })));
        created.forEach(addMarker);
      }

      for (const f of shapeFeatures) {
        const shape = await shapesApi.create(mapId, {
          title: f.title,
          description: f.description,
          type: f.type as 'polyline' | 'polygon',
          coordinates: f.coordinates!,
          color: f.color ?? '#2563eb',
        });
        addShape(shape);
      }

      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  // ── Export GeoJSON ──
  const markers = useMapStore((s) => s.markers);
  const shapes = useMapStore((s) => s.shapes);
  const currentMap = useMapStore((s) => s.currentMap);

  function handleExport() {
    const features: any[] = [
      ...markers.map((m) => ({
        type: 'Feature',
        properties: {
          title: m.title,
          description: m.description,
          date: m.date,
          category: m.category?.name,
        },
        geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
      })),
      ...shapes.map((s) => ({
        type: 'Feature',
        properties: {
          title: s.title,
          description: s.description,
          color: s.color,
          shapeType: s.type,
        },
        geometry: {
          type: s.type === 'polygon' ? 'Polygon' : 'LineString',
          coordinates: s.type === 'polygon'
            ? [s.coordinates.map((c) => [c[1], c[0]])]
            : s.coordinates.map((c) => [c[1], c[0]]),
        },
      })),
    ];

    const geojson = { type: 'FeatureCollection', features };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentMap?.title ?? 'map'}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Import complete!</p>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          {features!.filter((f) => f.type === 'marker').length} markers and{' '}
          {features!.filter((f) => f.type !== 'marker').length} shapes added.
        </p>
        <Button onClick={onDone}>Close</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Export section */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>Export map data</p>
        <p style={{ fontSize: 12, color: '#15803d', marginBottom: 10 }}>
          Download all {markers.length} markers and {shapes.length} shapes as GeoJSON.
        </p>
        <Button size="sm" variant="secondary" onClick={handleExport}>
          ↓ Download GeoJSON
        </Button>
      </div>

      {/* Import section */}
      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Import from file</p>

      {/* Format tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {(['geojson', 'gpx', 'kml'] as ImportFormat[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => { setFormat(f); setFeatures(null); setFileName(''); }}
            style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: format === f ? 600 : 400,
              background: format === f ? '#2563eb' : '#f3f4f6',
              color: format === f ? '#fff' : '#374151',
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        style={{
          border: '2px dashed #d1d5db', borderRadius: 8, padding: '28px 16px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 14,
          background: '#fafafa',
        }}
      >
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
          {fileName || `Drop a .${format} file here or click to browse`}
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af' }}>
          {format === 'geojson' ? 'GeoJSON FeatureCollection or Feature' :
           format === 'gpx' ? 'Waypoints, tracks, and routes' :
           'KML placemarks — points, lines, and polygons'}
        </p>
      </div>
      <input ref={fileRef} type="file" accept={`.${format}`} style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      {features && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: '#0369a1', fontWeight: 500, marginBottom: 4 }}>
            Ready to import {features.length} feature{features.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#0284c7' }}>
            <span>📍 {features.filter((f) => f.type === 'marker').length} markers</span>
            <span>〰 {features.filter((f) => f.type === 'polyline').length} lines</span>
            <span>⬡ {features.filter((f) => f.type === 'polygon').length} polygons</span>
          </div>
        </div>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button onClick={handleImport} loading={importing} disabled={!features}>
          Import
        </Button>
      </div>
    </div>
  );
}
