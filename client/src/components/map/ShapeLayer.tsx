import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Shape } from '@gpkarta/shared';
import { useUiStore } from '../../store/uiStore';

interface ShapeLayerProps {
  shapes: Shape[];
  readOnly?: boolean;
}

export function ShapeLayer({ shapes, readOnly }: ShapeLayerProps) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const activeShapeId = useUiStore((s) => s.activeShapeId);
  const setActiveShape = useUiStore((s) => s.setActiveShape);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  useEffect(() => {
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }
    return () => {
      layerGroupRef.current?.remove();
      layerGroupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    shapes.forEach((shape) => {
      const latlngs: L.LatLngTuple[] = shape.coordinates.map((c) => [c[0], c[1]]);
      const isActive = shape.id === activeShapeId;

      const style = {
        color: shape.color,
        weight: isActive ? shape.weight + 2 : shape.weight,
        opacity: shape.opacity,
        fillColor: shape.fillColor ?? shape.color,
        fillOpacity: shape.type === 'polygon' ? shape.fillOpacity : 0,
      };

      const layer =
        shape.type === 'polygon'
          ? L.polygon(latlngs, style)
          : L.polyline(latlngs, style);

      if (shape.title) {
        layer.bindTooltip(shape.title, { sticky: true });
      }

      if (!readOnly) {
        layer.on('click', () => {
          setActiveShape(shape.id);
          setSidebarOpen(true);
        });
      } else if (shape.title || shape.description) {
        layer.bindPopup(
          `<b>${shape.title ?? ''}</b>${shape.description ? `<br/><span style="font-size:12px;color:#6b7280">${shape.description}</span>` : ''}`,
        );
      }

      layerGroupRef.current!.addLayer(layer);
    });
  }, [shapes, activeShapeId, readOnly]);

  return null;
}
