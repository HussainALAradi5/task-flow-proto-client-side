import { Component, computed, input } from '@angular/core';
import { ProgressSize, ProgressTone } from '../../../core/enums/ui-control.enum';

@Component({
  selector: 'app-generic-progress-bar',
  standalone: true,
  host: { class: 'block w-full' },
  template: `
    <div
      role="progressbar"
      [attr.aria-label]="label()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="percentage()"
      class="w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      [class.h-1.5]="size() === ProgressSize.Small"
      [class.h-2]="size() === ProgressSize.Medium"
    >
      <div
        class="h-full rounded-full bg-gradient-to-r from-blue-500 transition-[width] duration-500"
        [class.to-blue-600]="tone() === ProgressTone.Blue"
        [class.to-emerald-500]="tone() === ProgressTone.Mixed"
        [style.width.%]="percentage()"
      ></div>
    </div>
  `,
})
export class GenericProgressBarComponent {
  readonly ProgressSize = ProgressSize;
  readonly ProgressTone = ProgressTone;
  value = input.required<number>();
  label = input.required<string>();
  size = input<ProgressSize>(ProgressSize.Medium);
  tone = input<ProgressTone>(ProgressTone.Blue);

  percentage = computed(() => {
    const value = this.value();
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  });
}
