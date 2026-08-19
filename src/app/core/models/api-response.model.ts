export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  token?: string;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
