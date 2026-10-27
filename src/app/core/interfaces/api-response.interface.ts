import { ApiStatus } from '../enums/api-status.enum';

export interface ApiResponse<T> {
  status: ApiStatus;
  data: T;
  message?: string;
  token?: string;
}
