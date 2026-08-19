import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-gray-900 text-white min-h-screen">
      <nav class="p-4">
        <ul class="space-y-2">
          @for (item of items(); track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-gray-700"
                class="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                {{ item.label }}
              </a>
            </li>
          }
        </ul>
      </nav>
    </aside>
  `,
})
export class SidebarComponent {
  items = input.required<Array<{ label: string; path: string }>>();
}
