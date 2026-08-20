import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/board', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./features/auth/components/signup/signup.component').then(m => m.SignupComponent) },
    ],
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/components/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'board',
    canActivate: [authGuard],
    loadComponent: () => import('./features/board/components/board/board.component').then(m => m.BoardComponent),
  },
  {
    path: 'teams',
    canActivate: [authGuard],
    loadComponent: () => import('./features/team/components/team/team.component').then(m => m.TeamComponent),
  },
  { path: '**', redirectTo: '/board' },
];
