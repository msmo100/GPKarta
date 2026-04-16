export type ShapeType = 'polyline' | 'polygon';

export interface Shape {
  id: string;
  mapId: string;
  categoryId: string | null;
  title: string | null;
  description: string | null;
  type: ShapeType;
  coordinates: number[][];
  color: string;
  weight: number;
  fillColor: string | null;
  fillOpacity: number;
  opacity: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; color: string; icon: string | null } | null;
}

export interface CreateShapeInput {
  title?: string;
  description?: string;
  type: ShapeType;
  coordinates: number[][];
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
  opacity?: number;
  categoryId?: string;
}

export interface UpdateShapeInput {
  title?: string;
  description?: string;
  coordinates?: number[][];
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
  opacity?: number;
  categoryId?: string | null;
}
