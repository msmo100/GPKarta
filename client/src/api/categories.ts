import { apiClient } from './client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@gpkarta/shared';

export const categoriesApi = {
  list: (mapId: string) =>
    apiClient.get<{ data: Category[] }>(`/maps/${mapId}/categories`).then((r) => r.data.data),

  create: (mapId: string, data: CreateCategoryInput) =>
    apiClient
      .post<{ data: Category }>(`/maps/${mapId}/categories`, data)
      .then((r) => r.data.data),

  update: (mapId: string, categoryId: string, data: UpdateCategoryInput) =>
    apiClient
      .patch<{ data: Category }>(`/maps/${mapId}/categories/${categoryId}`, data)
      .then((r) => r.data.data),

  delete: (mapId: string, categoryId: string) =>
    apiClient.delete(`/maps/${mapId}/categories/${categoryId}`),
};
