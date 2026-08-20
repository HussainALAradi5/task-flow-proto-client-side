import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
  icon?: string;
}

@Component({
  selector: 'app-generic-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mb-4">
      @if (label()) {
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }
      <div class="relative">
        <select
          [ngModel]="value()"
          (ngModelChange)="valueChange.emit($event)"
          [disabled]="disabled()"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
        >
          @if (placeholder()) {
            <option value="">{{ placeholder() }}</option>
          }
          @for (option of options(); track option.value) {
            <option [value]="option.value">{{ option.label }}</option>
          }
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  `,
})
export class GenericSelectComponent {
  label = input<string>();
  placeholder = input<string>('Select...');
  value = input<string>('');
  options = input<SelectOption[]>([]);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  valueChange = output<string>();
}
