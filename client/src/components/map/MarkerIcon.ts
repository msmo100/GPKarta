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
): L.DivIcon {
  const key = `${color}-${shape}-${size}-${icon}-${selected}`;
  if (cache.has(key)) return cache.get(key)!;

  const px = SIZE_MAP[size] + (selected ? 4 : 0);
  const border = selected
    ? '2.5px solid white; box-shadow:0 0 0 2.5px rgba(0,0,0,0.35),0 2px 6px rgba(0,0,0,0.4)'
    : '1.5px solid rgba(0,0,0,0.22); box-shadow:0 2px 5px rgba(0,0,0,0.25)';

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
      ${shapeStyle};
      border:${border};
      position:relative;
      display:flex;align-items:center;justify-content:center;
    ">${innerHtml}</div>`;

  // For pin shape the anchor is at the bottom point of the rotated square
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
