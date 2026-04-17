import React, { useState } from 'react';
import type { MarkerShape, MarkerSize } from '@gpkarta/shared';
import { markersApi } from '../../api/markers';
import { useMapStore } from '../../store/mapStore';
import { Button } from '../common/Button';
import { MarkerStylePicker } from './MarkerStylePicker';

interface GlobalStylePanelProps {
  mapId: string;
  markerCount: number;
}

export function GlobalStylePanel({ mapId, markerCount }: GlobalStylePanelProps) {
  const setMarkers = useMapStore((s) => s.setMarkers);
  const markers = useMapStore((s) => s.markers);

  const [color, setColor] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState<string | null>(null);
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [opacity, setOpacity] = useState(1.0);
  const [shape, setShape] = useState<MarkerShape>('pin');
  const [markerSize, setMarkerSize] = useState<MarkerSize>('md');
  const [markerIcon, setMarkerIcon] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function handleApply() {
    if (!confirm(`Tillämpa den här stilen på alla ${markerCount} markörer? Detta skriver över deras individuella utseende.`)) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await markersApi.bulkStyle(mapId, {
        color,
        strokeColor,
        strokeWidth,
        opacity,
        shape,
        markerSize,
        markerIcon: markerIcon || null,
      });
      // Apply the same style to all markers in the store
      setMarkers(markers.map((m) => ({
        ...m,
        color,
        strokeColor,
        strokeWidth,
        opacity,
        shape,
        markerSize,
        markerIcon: markerIcon || null,
      })));
      setResult(res.updated);
    } catch {
      setError('Det gick inte att tillämpa stilen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>
        Ange ett enhetligt utseende för alla {markerCount} markörer på den här kartan.
      </p>

      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 16 }}>
        <MarkerStylePicker
          categoryColor="#2563eb"
          color={color}
          shape={shape}
          markerSize={markerSize}
          markerIcon={markerIcon}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          opacity={opacity}
          onColorChange={setColor}
          onShapeChange={setShape}
          onSizeChange={setMarkerSize}
          onIconChange={setMarkerIcon}
          onStrokeColorChange={setStrokeColor}
          onStrokeWidthChange={setStrokeWidth}
          onOpacityChange={setOpacity}
        />
      </div>

      {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 10 }}>{error}</p>}
      {result !== null && (
        <p style={{ fontSize: 13, color: '#16a34a', marginBottom: 10 }}>
          Tillämpades på {result} markörer.
        </p>
      )}

      <Button onClick={handleApply} loading={loading} disabled={markerCount === 0}>
        Tillämpa på alla {markerCount} markörer
      </Button>
    </div>
  );
}
