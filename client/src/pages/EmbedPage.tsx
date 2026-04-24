import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { embedApi, type EmbedData } from '../api/embed';
import { EmbedMapView } from '../components/map/EmbedMapView';
import type { EmbedConfig } from '@gpkarta/shared';
import { useUiStore } from '../store/uiStore';
import '../styles/embed.css';

function parseEmbedConfig(): EmbedConfig {
  const params = new URLSearchParams(window.location.search);
  return {
    zoom: params.get('zoom') ? Number(params.get('zoom')) : undefined,
    lat: params.get('lat') ? Number(params.get('lat')) : undefined,
    lng: params.get('lng') ? Number(params.get('lng')) : undefined,
    category: params.get('category') ?? undefined,
    hideControls: params.get('hideControls') === 'true',
    hideAttribution: params.get('hideAttribution') === 'true',
  };
}

export function EmbedPage() {
  const { embedToken } = useParams<{ embedToken: string }>();
  const [data, setData] = useState<EmbedData | null>(null);
  const [error, setError] = useState('');

  const config = useMemo(() => parseEmbedConfig(), []);
  const { filterCategoryIds, filterFrom, filterTo, activeFilters, activeRanges, setFilterDarkMode } = useUiStore();

  useEffect(() => {
    if (!embedToken) return;
    embedApi
      .get(embedToken)
      .then((d) => { setData(d); setFilterDarkMode((d as any).filterDarkMode ?? false); })
      .catch(() => setError('Map not found or embed is disabled'));
  }, [embedToken]);

  const filteredMarkers = useMemo(() => {
    if (!data) return [];
    let result = data.markers;

    // URL-param category filter
    if (config.category) {
      const allowed = config.category.split(',');
      result = result.filter((m) => m.categoryId && allowed.includes(m.categoryId));
    }

    // Panel category filter
    if (filterCategoryIds.length > 0)
      result = result.filter((m) => m.categoryId ? filterCategoryIds.includes(m.categoryId) : false);
    if (filterFrom)
      result = result.filter((m) => m.date && new Date(m.date) >= new Date(filterFrom));
    if (filterTo) {
      const to = new Date(filterTo); to.setHours(23, 59, 59, 999);
      result = result.filter((m) => m.date && new Date(m.date) <= to);
    }
    for (const [key, vals] of Object.entries(activeFilters)) {
      if (!vals.length) continue;
      if (key.startsWith('cf:')) {
        const cfKey = key.slice(3);
        result = result.filter((m) => { const v = m.customFields?.[cfKey]; return v != null && vals.includes(String(v)); });
      } else {
        result = result.filter((m) => { const v = (m as any)[key]; return v != null && vals.includes(String(v)); });
      }
    }
    for (const [key, [min, max]] of Object.entries(activeRanges)) {
      if (key.startsWith('cf:')) {
        const cfKey = key.slice(3);
        result = result.filter((m) => { const v = m.customFields?.[cfKey]; return typeof v === 'number' && v >= min && v <= max; });
      } else {
        result = result.filter((m) => { const v = (m as any)[key]; return typeof v === 'number' && v >= min && v <= max; });
      }
    }
    return result;
  }, [data, config.category, filterCategoryIds, filterFrom, filterTo, activeFilters, activeRanges]);

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', fontFamily: 'sans-serif', color: '#6b7280', fontSize: 14,
      }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', fontFamily: 'sans-serif', color: '#9ca3af', fontSize: 13,
      }}>
        Loading…
      </div>
    );
  }

  return (
    <EmbedMapView
      data={data}
      config={config}
      filteredMarkers={filteredMarkers}
    />
  );
}
