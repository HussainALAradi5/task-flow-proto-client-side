import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <app-header />
    <div class="flex min-h-[calc(100vh-4rem)]">
      @if (authService.isLoggedIn()) {
        <app-sidebar [items]="sidebarItems" />
      }
      <main class="flex-1 bg-gray-50 dark:bg-gray-900">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App {
  authService = inject(AuthService);

  sidebarItems = [
    { label: 'Projects', path: '/board', icon: '📋', exact: true },
    { label: 'Teams', path: '/teams', icon: '👥' },
  ];
}
