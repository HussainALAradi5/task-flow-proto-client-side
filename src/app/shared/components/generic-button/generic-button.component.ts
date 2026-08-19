import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-generic-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()"
      (click)="onClick.emit()"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading...
      } @else {
        <ng-content />
      }
    </button>
  `,
})
export class GenericButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  onClick = output<void>();

  buttonClasses(): string {
    const base = 'inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all';
    const variants: Record<string, string> = {
      primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm',
      secondary: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
      danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:focus:ring-red-400 shadow-sm',
    };
    return `${base} ${variants[this.variant()]}`;
  }
}
