import { apiClient } from './client';
import type { MapRecord, CreateMapInput, UpdateMapInput } from '@gpkarta/shared';

export const mapsApi = {
  list: () =>
    apiClient.get<{ data: MapRecord[] }>('/maps').then((r) => r.data.data),

  get: (mapId: string) =>
    apiClient.get<{ data: MapRecord }>(`/maps/${mapId}`).then((r) => r.data.data),

  create: (data: CreateMapInput) =>
    apiClient.post<{ data: MapRecord }>('/maps', data).then((r) => r.data.data),

  update: (mapId: string, data: UpdateMapInput) =>
    apiClient.patch<{ data: MapRecord }>(`/maps/${mapId}`, data).then((r) => r.data.data),

  delete: (mapId: string) =>
    apiClient.delete(`/maps/${mapId}`),

  duplicate: (mapId: string) =>
    apiClient.post<{ data: MapRecord }>(`/maps/${mapId}/duplicate`).then((r) => r.data.data),

  generateEmbedToken: (mapId: string) =>
    apiClient.post<{ data: { embedToken: string } }>(`/maps/${mapId}/embed-token`).then((r) => r.data.data),

  revokeEmbedToken: (mapId: string) =>
    apiClient.delete(`/maps/${mapId}/embed-token`),
};
