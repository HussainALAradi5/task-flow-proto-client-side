export interface ApiError {
  status: 'error';
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
