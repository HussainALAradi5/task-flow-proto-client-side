import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-generic-switch',
  standalone: true,
  template: `
    <label class="inline-flex items-center gap-2 cursor-pointer select-none" [class.opacity-50 pointer-events-none]="disabled()">
      <div class="relative">
        <input
          type="checkbox"
          class="sr-only"
          [checked]="checked()"
          [disabled]="disabled()"
          (change)="toggle()"
        />
        <div [class]="trackClasses()">
          <div [class]="thumbClasses()"></div>
        </div>
      </div>
      @if (label()) {
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ label() }}</span>
      }
    </label>
  `,
})
export class GenericSwitchComponent {
  label = input<string>('');
  checked = input<boolean>(false);
  disabled = input<boolean>(false);
  checkedChange = output<boolean>();

  toggle(): void {
    if (this.disabled()) return;
    this.checkedChange.emit(!this.checked());
  }

  trackClasses(): string {
    const base = 'block w-9 h-5 rounded-full transition-colors duration-200 ease-in-out';
    const color = this.checked()
      ? 'bg-blue-600'
      : 'bg-gray-300 dark:bg-gray-600';
    return `${base} ${color}`;
  }

  thumbClasses(): string {
    const base = 'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ease-in-out';
    const transform = this.checked() ? 'translate-x-4' : 'translate-x-0';
    return `${base} ${transform}`;
  }
}
