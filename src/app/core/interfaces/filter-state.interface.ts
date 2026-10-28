export interface FilterState {
  search: string;
  exactMatch: boolean;
  includeInactive: boolean;
  page: number;
  limit: number;
}
