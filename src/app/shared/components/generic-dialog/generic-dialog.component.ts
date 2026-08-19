import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-generic-dialog',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black bg-opacity-50" (click)="close()"></div>
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
            <button (click)="close()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-4">
            <ng-content />
          </div>
          <div class="flex justify-end gap-2 p-4 border-t">
            <button (click)="close()" class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
              Cancel
            </button>
            <button (click)="onConfirm.emit()" class="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class GenericDialogComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Dialog');
  confirmText = input<string>('Confirm');
  onClose = output<void>();
  onConfirm = output<void>();

  close(): void {
    this.onClose.emit();
  }
}
