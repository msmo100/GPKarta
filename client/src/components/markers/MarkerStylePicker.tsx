import React from 'react';
import type { MarkerShape, MarkerSize } from '@gpkarta/shared';

// ── Shape previews rendered as inline SVG so they look exactly like the map icons ──

const SHAPES: { value: MarkerShape; label: string }[] = [
  { value: 'pin',     label: 'Pin' },
  { value: 'circle',  label: 'Circle' },
  { value: 'square',  label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'star',    label: 'Star' },
];

const SIZES: { value: MarkerSize; label: string; px: number }[] = [
  { value: 'sm', label: 'S', px: 14 },
  { value: 'md', label: 'M', px: 18 },
  { value: 'lg', label: 'L', px: 24 },
];

const SUGGESTED_ICONS = [
  '📍','⭐','❗','❓','🔴','🟡','🟢','🔵',
  '🏠','🏢','🏥','🏫','🚗','🚌','✈️','⚓',
  '🔥','💧','⚡','🌿','🎯','🎪','🎭','🎬',
];

interface ShapePreviewProps {
  shape: MarkerShape;
  color: string;
  icon: string | null;
  size?: number;
}

function ShapePreview({ shape, color, icon, size = 28 }: ShapePreviewProps) {
  const s = size;
  const inner = icon
    ? <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize={s * 0.46}>{icon}</text>
    : null;

  switch (shape) {
    case 'pin': {
      // Rotated square pointing down
      const sq = s * 0.7;
      const off = (s - sq) / 2;
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect
            x={off} y={off} width={sq} height={sq} rx={2}
            fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1}
            transform={`rotate(45,${s/2},${s/2})`}
          />
          {inner}
        </svg>
      );
    }
    case 'circle':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={s/2} cy={s/2} r={s/2 - 1} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
          {inner}
        </svg>
      );
    case 'square':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect x={1} y={1} width={s-2} height={s-2} rx={3} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
          {inner}
        </svg>
      );
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon
            points={`${s/2},1 ${s-1},${s/2} ${s/2},${s-1} 1,${s/2}`}
            fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1}
          />
          {inner}
        </svg>
      );
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const angle = (i * 36 - 90) * (Math.PI / 180);
        const r = i % 2 === 0 ? s / 2 - 1 : s / 4;
        return `${s/2 + r * Math.cos(angle)},${s/2 + r * Math.sin(angle)}`;
      }).join(' ');
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={pts} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
          {inner}
        </svg>
      );
    }
  }
}

interface MarkerStylePickerProps {
  color: string;
  shape: MarkerShape;
  markerSize: MarkerSize;
  markerIcon: string;
  onShapeChange: (s: MarkerShape) => void;
  onSizeChange: (s: MarkerSize) => void;
  onIconChange: (s: string) => void;
}

export function MarkerStylePicker({
  color, shape, markerSize, markerIcon,
  onShapeChange, onSizeChange, onIconChange,
}: MarkerStylePickerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Live preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ShapePreview shape={shape} color={color} icon={markerIcon || null} size={40} />
        <span style={{ fontSize: 12, color: '#6b7280' }}>Preview</span>
      </div>

      {/* Shape */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Shape</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {SHAPES.map((s) => (
            <button
              key={s.value}
              type="button"
              title={s.label}
              onClick={() => onShapeChange(s.value)}
              style={{
                width: 44, height: 44,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                borderRadius: 7,
                border: `2px solid ${shape === s.value ? '#2563eb' : '#e5e7eb'}`,
                background: shape === s.value ? '#eff6ff' : '#f9fafb',
                cursor: 'pointer', padding: 0,
              }}
            >
              <ShapePreview shape={s.value} color={shape === s.value ? '#2563eb' : '#9ca3af'} icon={null} size={22} />
              <span style={{ fontSize: 9, color: shape === s.value ? '#2563eb' : '#9ca3af', fontWeight: 500 }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Size</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSizeChange(s.value)}
              style={{
                width: 44, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 7,
                border: `2px solid ${markerSize === s.value ? '#2563eb' : '#e5e7eb'}`,
                background: markerSize === s.value ? '#eff6ff' : '#f9fafb',
                cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                color: markerSize === s.value ? '#2563eb' : '#6b7280',
              }}
            >
              <ShapePreview shape={shape} color={markerSize === s.value ? '#2563eb' : '#9ca3af'} icon={null} size={s.px} />
            </button>
          ))}
        </div>
      </div>

      {/* Icon / Emoji */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Icon (optional)</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => onIconChange('')}
            style={{
              width: 32, height: 32, borderRadius: 6, fontSize: 11,
              border: `2px solid ${!markerIcon ? '#2563eb' : '#e5e7eb'}`,
              background: !markerIcon ? '#eff6ff' : '#f9fafb',
              cursor: 'pointer', color: '#6b7280',
            }}
          >
            ✕
          </button>
          {SUGGESTED_ICONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onIconChange(emoji)}
              style={{
                width: 32, height: 32, borderRadius: 6, fontSize: 16,
                border: `2px solid ${markerIcon === emoji ? '#2563eb' : '#e5e7eb'}`,
                background: markerIcon === emoji ? '#eff6ff' : '#f9fafb',
                cursor: 'pointer',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={markerIcon}
          onChange={(e) => onIconChange(e.target.value.slice(0, 4))}
          placeholder="Or type any emoji / text…"
          style={{
            width: '100%', padding: '6px 10px',
            border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13,
          }}
        />
      </div>
    </div>
  );
}
