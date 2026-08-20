import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generic-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './generic-search.component.html',
})
export class GenericSearchComponent {
  placeholder = input<string>('Search...');
  value = input<string>('');
  valueChange = output<string>();
  search = output<string>();

  localValue = signal('');

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.localValue.set(target.value);
  }

  onSearch(): void {
    this.valueChange.emit(this.localValue());
    this.search.emit(this.localValue());
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
