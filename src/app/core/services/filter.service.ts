import { Injectable, signal } from '@angular/core';

export interface FilterState {
  search: string;
  exactMatch: boolean;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class FilterService {
  private state = signal<FilterState>({ search: '', exactMatch: false, page: 1, limit: 10 });
  readonly filterState = this.state.asReadonly();

  setSearch(search: string): void {
    this.state.update((s) => ({ ...s, search, page: 1 }));
  }

  setExactMatch(exactMatch: boolean): void {
    this.state.update((s) => ({ ...s, exactMatch, page: 1 }));
  }

  setPage(page: number): void {
    this.state.update((s) => ({ ...s, page }));
  }

  reset(): void {
    this.state.set({ search: '', exactMatch: false, page: 1, limit: 10 });
  }

  getParams(): FilterState {
    return this.state();
  }
}
