import { Component, input, output } from '@angular/core';

export interface BadgeOption {
  value: string;
  label: string;
  selectedClass: string;
  unselectedClass: string;
}

@Component({
  selector: 'app-generic-badge-select',
  standalone: true,
  templateUrl: './generic-badge-select.component.html',
})
export class GenericBadgeSelectComponent {
  label = input<string>();
  options = input<BadgeOption[]>([]);
  value = input<string>('');
  valueChange = output<string>();

  select(val: string): void {
    this.valueChange.emit(val);
  }
}
