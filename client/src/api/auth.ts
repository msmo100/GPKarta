import { apiClient } from './client';
import type { AuthResponse } from '@gpkarta/shared';

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    apiClient.post<{ data: AuthResponse }>('/auth/register', data).then((r) => r.data.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<{ data: AuthResponse }>('/auth/login', data).then((r) => r.data.data),

  me: () =>
    apiClient.get<{ data: AuthResponse['user'] }>('/auth/me').then((r) => r.data.data),
};
