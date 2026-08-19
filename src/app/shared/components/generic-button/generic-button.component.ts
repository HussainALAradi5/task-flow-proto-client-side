import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

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
  variant = input<ButtonVariant>('solid');
  color = input<ButtonColor>('primary');
  size = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  onClick = output<void>();

  buttonClasses(): string {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all';

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variants: Record<ButtonVariant, Record<ButtonColor, string>> = {
      solid: {
        primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
        secondary: 'text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 shadow-sm',
        success: 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-sm',
        danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm',
        warning: 'text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 shadow-sm',
      },
      outline: {
        primary: 'text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        secondary: 'text-gray-600 border-2 border-gray-600 hover:bg-gray-50 focus:ring-gray-500',
        success: 'text-green-600 border-2 border-green-600 hover:bg-green-50 focus:ring-green-500',
        danger: 'text-red-600 border-2 border-red-600 hover:bg-red-50 focus:ring-red-500',
        warning: 'text-yellow-600 border-2 border-yellow-500 hover:bg-yellow-50 focus:ring-yellow-500',
      },
      ghost: {
        primary: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        secondary: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
        success: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
        danger: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
        warning: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      },
      link: {
        primary: 'text-blue-600 hover:underline focus:ring-blue-500 p-0',
        secondary: 'text-gray-600 hover:underline focus:ring-gray-500 p-0',
        success: 'text-green-600 hover:underline focus:ring-green-500 p-0',
        danger: 'text-red-600 hover:underline focus:ring-red-500 p-0',
        warning: 'text-yellow-600 hover:underline focus:ring-yellow-500 p-0',
      },
    };

    return `${base} ${sizes[this.size()]} ${variants[this.variant()][this.color()]}`;
  }
}
