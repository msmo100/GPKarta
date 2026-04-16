import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { embedApi, type EmbedData } from '../api/embed';
import { EmbedMapView } from '../components/map/EmbedMapView';
import type { EmbedConfig } from '@gpkarta/shared';
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

  useEffect(() => {
    if (!embedToken) return;
    embedApi
      .get(embedToken)
      .then(setData)
      .catch(() => setError('Map not found or embed is disabled'));
  }, [embedToken]);

  const filteredMarkers = useMemo(() => {
    if (!data) return [];
    if (!config.category) return data.markers;
    const allowed = config.category.split(',');
    return data.markers.filter((m) => m.categoryId && allowed.includes(m.categoryId));
  }, [data, config.category]);

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
