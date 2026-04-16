import { apiClient } from './client';
import type { Shape, CreateShapeInput, UpdateShapeInput } from '@gpkarta/shared';

export const shapesApi = {
  list: (mapId: string) =>
    apiClient.get<{ data: Shape[] }>(`/maps/${mapId}/shapes`).then((r) => r.data.data),

  create: (mapId: string, data: CreateShapeInput) =>
    apiClient.post<{ data: Shape }>(`/maps/${mapId}/shapes`, data).then((r) => r.data.data),

  update: (mapId: string, shapeId: string, data: UpdateShapeInput) =>
    apiClient.patch<{ data: Shape }>(`/maps/${mapId}/shapes/${shapeId}`, data).then((r) => r.data.data),

  delete: (mapId: string, shapeId: string) =>
    apiClient.delete(`/maps/${mapId}/shapes/${shapeId}`),
};
