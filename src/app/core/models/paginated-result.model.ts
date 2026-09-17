import { PaginationMeta } from './pagination-meta.model';

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}
