export interface ApiValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: ApiValidationError[];
}
