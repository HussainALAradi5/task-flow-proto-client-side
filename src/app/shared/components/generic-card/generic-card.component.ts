import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-generic-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      @if (title()) {
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ title() }}</h3>
      }
      @if (subtitle()) {
        <p class="text-sm text-gray-500 mb-4">{{ subtitle() }}</p>
      }
      <ng-content />
      @if (showActions()) {
        <div class="flex gap-2 mt-4 pt-4 border-t">
          <button (click)="onEdit.emit()" class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Edit
          </button>
          <button (click)="onDelete.emit()" class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      }
    </div>
  `,
})
export class GenericCardComponent {
  title = input<string>();
  subtitle = input<string>();
  showActions = input<boolean>(false);
  onEdit = output<void>();
  onDelete = output<void>();
}
