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

const COLOR_PALETTE = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#f9fafb','#6b7280','#374151','#111827',
  '#fca5a5','#86efac','#93c5fd','#c4b5fd',
];

const STROKE_PALETTE = [
  '#111827','#374151','#6b7280','#ffffff',
  '#ef4444','#3b82f6','#22c55e','#eab308',
];

const STROKE_WIDTHS = [
  { value: 0,   label: '0' },
  { value: 1,   label: '1' },
  { value: 1.5, label: '1.5' },
  { value: 2.5, label: '2.5' },
  { value: 4,   label: '4' },
];

interface ShapePreviewProps {
  shape: MarkerShape;
  color: string;
  icon: string | null;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

function ShapePreview({ shape, color, icon, size = 28, strokeColor = 'rgba(0,0,0,0.2)', strokeWidth = 1 }: ShapePreviewProps) {
  const s = size;
  const sw = strokeWidth;
  const stroke = strokeColor;
  const inner = icon
    ? <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize={s * 0.46}>{icon}</text>
    : null;

  switch (shape) {
    case 'pin': {
      const sq = s * 0.7;
      const off = (s - sq) / 2;
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect
            x={off} y={off} width={sq} height={sq} rx={2}
            fill={color} stroke={stroke} strokeWidth={sw}
            transform={`rotate(45,${s/2},${s/2})`}
          />
          {inner}
        </svg>
      );
    }
    case 'circle':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={s/2} cy={s/2} r={s/2 - sw/2 - 0.5} fill={color} stroke={stroke} strokeWidth={sw} />
          {inner}
        </svg>
      );
    case 'square':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect x={sw/2 + 0.5} y={sw/2 + 0.5} width={s - sw - 1} height={s - sw - 1} rx={3} fill={color} stroke={stroke} strokeWidth={sw} />
          {inner}
        </svg>
      );
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon
            points={`${s/2},${sw} ${s-sw},${s/2} ${s/2},${s-sw} ${sw},${s/2}`}
            fill={color} stroke={stroke} strokeWidth={sw}
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
          <polygon points={pts} fill={color} stroke={stroke} strokeWidth={sw} />
          {inner}
        </svg>
      );
    }
  }
}

// ── Small color swatch grid ──────────────────────────────────────────────────

interface ColorSwatchesProps {
  palette: string[];
  value: string | null;
  nullLabel: string;
  onChange: (v: string | null) => void;
}

function ColorSwatches({ palette, value, nullLabel, onChange }: ColorSwatchesProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {/* "null" = use default */}
      <button
        type="button"
        title={nullLabel}
        onClick={() => onChange(null)}
        style={{
          width: 24, height: 24, borderRadius: 5,
          border: `2px solid ${value === null ? '#2563eb' : '#d1d5db'}`,
          background: 'linear-gradient(135deg,#fff 40%,#e5e7eb 40%)',
          cursor: 'pointer', fontSize: 9, color: '#6b7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {value === null && <span style={{ color: '#2563eb', fontSize: 11, fontWeight: 700 }}>✓</span>}
      </button>
      {palette.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          onClick={() => onChange(c)}
          style={{
            width: 24, height: 24, borderRadius: 5,
            border: `2px solid ${value === c ? '#2563eb' : 'transparent'}`,
            background: c,
            cursor: 'pointer',
            outline: c === '#f9fafb' ? '1px solid #e5e7eb' : undefined,
            outlineOffset: '-2px',
          }}
        />
      ))}
      {/* Custom hex input */}
      <input
        type="color"
        value={value ?? '#2563eb'}
        onChange={(e) => onChange(e.target.value)}
        title="Custom color"
        style={{
          width: 24, height: 24, borderRadius: 5, border: '1px solid #d1d5db',
          padding: 1, cursor: 'pointer', background: 'none',
        }}
      />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface MarkerStylePickerProps {
  categoryColor: string;
  color: string | null;
  shape: MarkerShape;
  markerSize: MarkerSize;
  markerIcon: string;
  strokeColor: string | null;
  strokeWidth: number;
  opacity: number;
  onColorChange: (v: string | null) => void;
  onShapeChange: (s: MarkerShape) => void;
  onSizeChange: (s: MarkerSize) => void;
  onIconChange: (s: string) => void;
  onStrokeColorChange: (v: string | null) => void;
  onStrokeWidthChange: (v: number) => void;
  onOpacityChange: (v: number) => void;
}

export function MarkerStylePicker({
  categoryColor, color, shape, markerSize, markerIcon,
  strokeColor, strokeWidth, opacity,
  onColorChange, onShapeChange, onSizeChange, onIconChange,
  onStrokeColorChange, onStrokeWidthChange, onOpacityChange,
}: MarkerStylePickerProps) {
  const previewColor = color ?? categoryColor;
  const previewStroke = strokeColor ?? 'rgba(0,0,0,0.22)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Live preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ShapePreview
          shape={shape} color={previewColor} icon={markerIcon || null} size={40}
          strokeColor={previewStroke} strokeWidth={strokeWidth}
        />
        <span style={{ fontSize: 12, color: '#6b7280' }}>Förhandsgranskning</span>
        {opacity < 1 && (
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{Math.round(opacity * 100)}% opacity</span>
        )}
      </div>

      {/* Fill color */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Fyllningsfärg</p>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
          Markerad färg = använd kategorifärg
        </p>
        <ColorSwatches
          palette={COLOR_PALETTE}
          value={color}
          nullLabel="Använd kategorifärg"
          onChange={onColorChange}
        />
      </div>

      {/* Shape */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Form</p>
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
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Storlek</p>
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

      {/* Outline color */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Kantfärg</p>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
          Markerad färg = standard (mörk halvtransparent)
        </p>
        <ColorSwatches
          palette={STROKE_PALETTE}
          value={strokeColor}
          nullLabel="Standardkant"
          onChange={onStrokeColorChange}
        />
      </div>

      {/* Outline width */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Kantbredd</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => onStrokeWidthChange(w.value)}
              style={{
                minWidth: 36, height: 32, padding: '0 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6,
                border: `2px solid ${strokeWidth === w.value ? '#2563eb' : '#e5e7eb'}`,
                background: strokeWidth === w.value ? '#eff6ff' : '#f9fafb',
                cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                color: strokeWidth === w.value ? '#2563eb' : '#6b7280',
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
          Opacitet — {Math.round(opacity * 100)}%
        </p>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#2563eb' }}
        />
      </div>

      {/* Icon / Emoji */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Ikon (valfri)</p>
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
          placeholder="Eller skriv valfri emoji / text…"
          style={{
            width: '100%', padding: '6px 10px',
            border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13,
          }}
        />
      </div>
    </div>
  );
}
