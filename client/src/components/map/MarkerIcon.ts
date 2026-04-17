import L from 'leaflet';
import type { MarkerShape, MarkerSize } from '@gpkarta/shared';

const SIZE_MAP: Record<MarkerSize, number> = { sm: 18, md: 24, lg: 32 };

const cache = new Map<string, L.DivIcon>();

function shapeClipPath(shape: MarkerShape): string {
  switch (shape) {
    case 'circle':   return 'border-radius:50%';
    case 'square':   return 'border-radius:3px';
    case 'diamond':  return 'border-radius:3px;transform:rotate(45deg)';
    case 'star':     return 'border-radius:2px;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)';
    case 'pin':
    default:         return 'border-radius:50% 50% 50% 0;transform:rotate(-45deg)';
  }
}

/** For shapes that rotate the container we need a counter-rotation on the icon text */
function iconRotation(shape: MarkerShape): string {
  if (shape === 'pin')     return 'transform:rotate(45deg)';
  if (shape === 'diamond') return 'transform:rotate(-45deg)';
  return '';
}

export function createMarkerIcon(
  color: string,
  shape: MarkerShape = 'pin',
  size: MarkerSize = 'md',
  icon: string | null = null,
  selected = false,
  strokeColor: string | null = null,
  strokeWidth = 1.5,
  opacity = 1.0,
): L.DivIcon {
  const key = `${color}-${shape}-${size}-${icon}-${selected}-${strokeColor}-${strokeWidth}-${opacity}`;
  if (cache.has(key)) return cache.get(key)!;

  const px = SIZE_MAP[size] + (selected ? 4 : 0);

  const resolvedStroke = strokeColor ?? 'rgba(0,0,0,0.22)';
  const resolvedWidth = selected ? Math.max(strokeWidth, 2.5) : strokeWidth;
  const extraShadow = selected
    ? ';box-shadow:0 0 0 2.5px rgba(0,0,0,0.35),0 2px 6px rgba(0,0,0,0.4)'
    : ';box-shadow:0 2px 5px rgba(0,0,0,0.25)';

  const shapeStyle = shapeClipPath(shape);
  const iconRot    = iconRotation(shape);
  const fontSize   = Math.round(px * 0.52);

  const innerHtml = icon
    ? `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;line-height:1;${iconRot}">${icon}</span>`
    : '';

  const html = `
    <div style="
      width:${px}px;height:${px}px;
      background:${color};
      opacity:${opacity};
      ${shapeStyle};
      border:${resolvedWidth}px solid ${resolvedStroke}${extraShadow};
      position:relative;
      display:flex;align-items:center;justify-content:center;
    ">${innerHtml}</div>`;

  const anchorX = px / 2;
  const anchorY = shape === 'pin' ? px : px / 2;

  const divIcon = L.divIcon({
    className: '',
    html,
    iconSize:    [px, px],
    iconAnchor:  [anchorX, anchorY],
    popupAnchor: [0, -anchorY],
  });

  cache.set(key, divIcon);
  return divIcon;
}

export function createDefaultIcon(): L.DivIcon {
  return createMarkerIcon('#2563eb', 'pin', 'md', null, false);
}
