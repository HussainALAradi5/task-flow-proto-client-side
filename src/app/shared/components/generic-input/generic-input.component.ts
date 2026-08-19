import { Component, input } from '@angular/core';

@Component({
  selector: 'app-generic-input',
  standalone: true,
  template: `
    <div class="mb-4">
      @if (label()) {
        <label [for]="id()" class="block text-sm font-medium text-gray-700 mb-1">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }
      <input
        [id]="id()"
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
      />
      @if (error()) {
        <p class="mt-1 text-sm text-red-600">{{ error() }}</p>
      }
    </div>
  `,
})
export class GenericInputComponent {
  id = input<string>();
  label = input<string>();
  type = input<string>('text');
  placeholder = input<string>();
  value = input<string>();
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  error = input<string>();
}
