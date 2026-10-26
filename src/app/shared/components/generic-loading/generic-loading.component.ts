import { Component, input } from '@angular/core';

@Component({
  selector: 'app-generic-loading',
  standalone: true,
  template: `
    <div role="status" class="flex justify-center py-12">
      <div aria-hidden="true" class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      <span class="sr-only">{{ label() }}</span>
    </div>
  `,
})
export class GenericLoadingComponent {
  label = input('Loading...');
}
