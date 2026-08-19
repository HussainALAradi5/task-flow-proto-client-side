import { Component, input } from '@angular/core';

@Component({
  selector: 'app-generic-badge',
  standalone: true,
  template: `
    <span [class]="badgeClasses()">
      <ng-content />
    </span>
  `,
})
export class GenericBadgeComponent {
  variant = input<'default' | 'success' | 'warning' | 'danger' | 'info'>('default');

  badgeClasses(): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variants: Record<string, string> = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    };
    return `${base} ${variants[this.variant()]}`;
  }
}
