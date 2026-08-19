import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/generic-toast/generic-toast.component';
import { AlertComponent } from './shared/components/generic-alert/generic-alert.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, ToastComponent, AlertComponent],
  template: `
    <app-toast />
    <app-alert />
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
