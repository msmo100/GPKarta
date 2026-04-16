export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface EmbedConfig {
  zoom?: number;
  lat?: number;
  lng?: number;
  category?: string;
  hideControls?: boolean;
  hideAttribution?: boolean;
}

export interface MarkerFilters {
  categoryId?: string;
  from?: string;
  to?: string;
}
