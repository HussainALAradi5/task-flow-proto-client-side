import { Component, input, output } from '@angular/core';
import { PaginationMeta } from '../../../core/models/pagination.model';

@Component({
  selector: 'app-generic-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          (click)="onPageChange.emit(meta().page - 1)"
          [disabled]="meta().page <= 1"
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          (click)="onPageChange.emit(meta().page + 1)"
          [disabled]="meta().page >= meta().totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Showing {{ (meta().page - 1) * meta().limit + 1 }} to {{ meta().page * meta().limit > meta().total ? meta().total : meta().page * meta().limit }} of {{ meta().total }} results
        </p>
        <nav class="flex gap-1">
          <button
            (click)="onPageChange.emit(meta().page - 1)"
            [disabled]="meta().page <= 1"
            class="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Prev
          </button>
          @for (p of getPages(); track p) {
            <button
              (click)="onPageChange.emit(p)"
              [class]="p === meta().page ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
              class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
            >
              {{ p }}
            </button>
          }
          <button
            (click)="onPageChange.emit(meta().page + 1)"
            [disabled]="meta().page >= meta().totalPages"
            class="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  `,
})
export class GenericPaginationComponent {
  meta = input.required<PaginationMeta>();
  onPageChange = output<number>();

  getPages(): number[] {
    const pages: number[] = [];
    const total = this.meta().totalPages;
    const current = this.meta().page;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
