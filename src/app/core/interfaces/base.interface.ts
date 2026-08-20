export interface BaseEntity {
  _id: string;
  code: string;
  slug: string;
  createdBy?: string | Record<string, unknown>;
  updatedBy?: string | Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  token?: string;
}

