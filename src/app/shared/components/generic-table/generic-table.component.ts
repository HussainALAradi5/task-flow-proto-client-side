import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr class="bg-gray-50">
            @for (column of columns(); track column.key) {
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                {{ column.label }}
              </th>
            }
            @if (showActions()) {
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Actions
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          @for (row of data(); track $index) {
            <tr class="hover:bg-gray-50">
              @for (column of columns(); track column.key) {
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getValue(row, column.key) }}
                </td>
              }
              @if (showActions()) {
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button (click)="onEdit.emit(row)" class="text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                  <button (click)="onDelete.emit(row)" class="text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length + (showActions() ? 1 : 0)" class="px-6 py-12 text-center text-gray-500">
                No data available
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class GenericTableComponent<T extends Record<string, any>> {
  data = input.required<T[]>();
  columns = input.required<Array<{ key: string; label: string }>>();
  showActions = input<boolean>(false);
  onEdit = output<T>();
  onDelete = output<T>();

  getValue(row: T, key: string): any {
    return row[key];
  }
}
