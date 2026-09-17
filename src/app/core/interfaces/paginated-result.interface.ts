import { PaginationMeta } from './pagination-meta.interface';

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}
