import React, { useEffect, useState } from 'react';
import type { Marker, Category } from '@gpkarta/shared';
import { Modal } from '../common/Modal';
import { MarkerForm } from './MarkerForm';
import { Button } from '../common/Button';

// ── Video embedding helpers ────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function VideoEmbed({ url }: { url: string }) {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: 16 }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
        />
      </div>
    );
  }

  const vmId = getVimeoId(url);
  if (vmId) {
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: 16 }}>
        <iframe
          src={`https://player.vimeo.com/video/${vmId}`}
          title="Vimeo video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
        />
      </div>
    );
  }

  if (isDirectVideo(url)) {
    return (
      <video
        src={url}
        controls
        style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-block', marginBottom: 16, fontSize: 13, color: '#2563eb' }}
    >
      ▶ Watch video
    </a>
  );
}

// ── Image gallery ──────────────────────────────────────────────────────────

function ImageGallery({ images }: { images: Marker['images'] }) {
  const [active, setActive] = useState(0);
  if (!images?.length) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <img
        src={images[active].url}
        alt=""
        style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 8, display: 'block' }}
      />
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              style={{
                width: 56, height: 40, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer',
                outline: i === active ? '2px solid #2563eb' : '2px solid transparent',
                outlineOffset: 1,
                overflow: 'hidden', flexShrink: 0,
              }}
            >
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface MarkerPopupModalProps {
  marker: Marker | null;
  open: boolean;
  onClose: () => void;
  readOnly?: boolean;
  mapId?: string;
  categories?: Category[];
  popupBg?: string | null;
  popupTextColor?: string | null;
}

export function MarkerPopupModal({
  marker, open, onClose, readOnly = false, mapId, categories = [],
  popupBg, popupTextColor,
}: MarkerPopupModalProps) {
  const [editOpen, setEditOpen] = useState(false);

  // Reset edit state whenever the popup closes or switches to a different marker
  useEffect(() => {
    if (!open) setEditOpen(false);
  }, [open, marker?.id]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !marker) return null;

  const accentColor = marker.color ?? marker.category?.color ?? '#2563eb';

  // Lighten the accent for the header background (use at low opacity)
  const headerBg = accentColor + '18';

  const cardBg = popupBg ?? '#fff';
  const textColor = popupTextColor ?? '#111827';
  const textColorMuted = popupTextColor ? popupTextColor + 'aa' : '#9ca3af';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
      >
        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: cardBg,
            borderRadius: 12,
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: 540,
            maxHeight: '88vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Colored header strip */}
          <div style={{
            background: headerBg,
            borderBottom: `3px solid ${accentColor}`,
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
          }}>
            {/* Marker color dot */}
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: accentColor, flexShrink: 0,
              boxShadow: `0 0 0 2px ${accentColor}40`,
            }} />

            <h2 style={{
              flex: 1, fontSize: 17, fontWeight: 700,
              color: textColor, lineHeight: 1.3, margin: 0,
            }}>
              {marker.title}
            </h2>

            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 22, color: '#6b7280', lineHeight: 1,
                padding: '0 2px', flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>

            {/* Category + date row */}
            {(marker.category || marker.date) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                {marker.category && (
                  <span style={{
                    background: accentColor + '18',
                    color: accentColor,
                    border: `1px solid ${accentColor}40`,
                    borderRadius: 4, padding: '2px 9px',
                    fontSize: 11, fontWeight: 600,
                  }}>
                    {marker.category.name}
                  </span>
                )}
                {marker.date && (
                  <span style={{ fontSize: 12, color: textColorMuted }}>
                    {new Date(marker.date).toLocaleDateString('sv-SE', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            )}

            {/* Primary image from CSV */}
            {marker.imageUrl && !marker.images?.length && (
              <img
                src={marker.imageUrl}
                alt=""
                style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 8, marginBottom: 16, display: 'block' }}
              />
            )}

            {/* Uploaded images */}
            {marker.images?.length > 0 && <ImageGallery images={marker.images} />}

            {/* Video */}
            {marker.videoUrl && <VideoEmbed url={marker.videoUrl} />}

            {/* Description */}
            {marker.description && (
              <p style={{
                fontSize: 14, color: textColor, lineHeight: 1.7,
                whiteSpace: 'pre-wrap', marginBottom: 16,
              }}>
                {marker.description}
              </p>
            )}

            {/* Coordinates */}
            <p style={{ fontSize: 11, color: textColorMuted, marginBottom: 4 }}>
              {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
            </p>
          </div>

          {/* Footer */}
          {!readOnly && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #f3f4f6',
              display: 'flex', justifyContent: 'flex-end', gap: 8,
              flexShrink: 0,
            }}>
              <Button variant="secondary" size="sm" onClick={onClose}>Stäng</Button>
              <Button size="sm" onClick={() => setEditOpen(true)}>Redigera markör</Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit form — opens on top of the popup */}
      {!readOnly && mapId && (
        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Redigera markör">
          <MarkerForm
            mapId={mapId}
            categories={categories}
            existing={marker}
            onClose={() => { setEditOpen(false); onClose(); }}
          />
        </Modal>
      )}
    </>
  );
}
