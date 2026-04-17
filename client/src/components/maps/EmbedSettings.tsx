import React, { useState } from 'react';
import type { MapRecord } from '@gpkarta/shared';
import { mapsApi } from '../../api/maps';
import { Button } from '../common/Button';

interface EmbedSettingsProps {
  map: MapRecord;
  onMapUpdate: (map: MapRecord) => void;
}

export function EmbedSettings({ map, onMapUpdate }: EmbedSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedToken = map.embedToken;
  const embedSrc = embedToken
    ? `${window.location.origin}/embed/${embedToken}`
    : null;
  const iframeCode = embedSrc
    ? `<iframe src="${embedSrc}" width="800" height="500" frameborder="0" allowfullscreen></iframe>`
    : null;

  async function handleGenerate() {
    setLoading(true);
    try {
      const { embedToken: token } = await mapsApi.generateEmbedToken(map.id);
      onMapUpdate({ ...map, embedToken: token });
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    if (!confirm('Återkalla inbäddningstoken? Befintliga iframes slutar fungera.')) return;
    setLoading(true);
    try {
      await mapsApi.revokeEmbedToken(map.id);
      onMapUpdate({ ...map, embedToken: null });
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!iframeCode) return;
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, lineHeight: 1.6 }}>
        Generera en inbäddningstoken för att dela kartan som en skrivskyddad iframe på externa webbplatser.
      </p>

      {!embedToken ? (
        <Button onClick={handleGenerate} loading={loading} variant="secondary">
          Generera inbäddningstoken
        </Button>
      ) : (
        <>
          <div style={{
            background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 6,
            padding: 12, marginBottom: 12, fontFamily: 'monospace', fontSize: 11,
            wordBreak: 'break-all', color: '#374151', lineHeight: 1.5,
          }}>
            {iframeCode}
          </div>

          <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
            Anpassa med URL-parametrar: <code>?zoom=12&hideControls=true&category=id1,id2</code>
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" onClick={handleCopy} variant="secondary">
              {copied ? 'Kopierat!' : 'Kopiera iframe-kod'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              style={{ color: '#dc2626' }}
              onClick={handleRevoke}
              loading={loading}
            >
              Återkalla token
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
