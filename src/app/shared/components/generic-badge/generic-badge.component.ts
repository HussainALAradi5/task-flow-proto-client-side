import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-generic-badge',
  standalone: true,
  templateUrl: './generic-badge.component.html',
})
export class GenericBadgeComponent {
  variant = input<'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'>('default');

  classes = computed(() => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variants: Record<string, string> = {
      default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return `${base} ${variants[this.variant()]}`;
  });
}
