import { apiClient } from './client';
import type { Marker, CreateMarkerInput, UpdateMarkerInput } from '@gpkarta/shared';

export const markersApi = {
  list: (mapId: string, params?: { categoryId?: string; from?: string; to?: string }) =>
    apiClient
      .get<{ data: Marker[] }>(`/maps/${mapId}/markers`, { params })
      .then((r) => r.data.data),

  get: (mapId: string, markerId: string) =>
    apiClient
      .get<{ data: Marker }>(`/maps/${mapId}/markers/${markerId}`)
      .then((r) => r.data.data),

  create: (mapId: string, data: CreateMarkerInput) =>
    apiClient
      .post<{ data: Marker }>(`/maps/${mapId}/markers`, data)
      .then((r) => r.data.data),

  update: (mapId: string, markerId: string, data: UpdateMarkerInput) =>
    apiClient
      .patch<{ data: Marker }>(`/maps/${mapId}/markers/${markerId}`, data)
      .then((r) => r.data.data),

  delete: (mapId: string, markerId: string) =>
    apiClient.delete(`/maps/${mapId}/markers/${markerId}`),

  bulkCreate: (mapId: string, markers: CreateMarkerInput[]) =>
    apiClient
      .post<{ data: Marker[] }>(`/maps/${mapId}/markers/bulk`, { markers })
      .then((r) => r.data.data),

  bulkStyle: (mapId: string, style: {
    color?: string | null;
    strokeColor?: string | null;
    strokeWidth?: number;
    opacity?: number;
    shape?: string;
    markerSize?: string;
    markerIcon?: string | null;
  }) =>
    apiClient
      .patch<{ data: { updated: number } }>(`/maps/${mapId}/markers/bulk-style`, style)
      .then((r) => r.data.data),
};
