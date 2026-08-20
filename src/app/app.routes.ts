import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./features/auth/components/signup/signup.component').then(m => m.SignupComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
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
    path: 'board/:projectCode',
    canActivate: [authGuard],
    loadComponent: () => import('./features/board/components/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
  },
  {
    path: 'teams',
    canActivate: [authGuard],
    loadComponent: () => import('./features/team/components/team/team.component').then(m => m.TeamComponent),
  },
  { path: '**', redirectTo: '' },
];
