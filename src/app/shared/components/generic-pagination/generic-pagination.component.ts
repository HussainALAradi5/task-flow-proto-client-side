import { Component, input, output } from '@angular/core';
import { PaginationMeta } from '../../../core/models/pagination.model';

@Component({
  selector: 'app-generic-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          (click)="onPageChange.emit(meta().page - 1)"
          [disabled]="meta().page <= 1"
          class="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          (click)="onPageChange.emit(meta().page + 1)"
          [disabled]="meta().page >= meta().totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ (meta().page - 1) * meta().limit + 1 }}</span>
            to
            <span class="font-medium">{{ meta().page * meta().limit > meta().total ? meta().total : meta().page * meta().limit }}</span>
            of
            <span class="font-medium">{{ meta().total }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              (click)="onPageChange.emit(meta().page - 1)"
              [disabled]="meta().page <= 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            @for (p of getPages(); track p) {
              <button
                (click)="onPageChange.emit(p)"
                [class]="p === meta().page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                {{ p }}
              </button>
            }
            <button
              (click)="onPageChange.emit(meta().page + 1)"
              [disabled]="meta().page >= meta().totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
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
