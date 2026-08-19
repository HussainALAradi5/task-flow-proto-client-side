import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeKey = 'taskflow_theme';
  private themeSignal = signal<'light' | 'dark'>('light');

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.loadTheme();
    effect(() => {
      const theme = this.themeSignal();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem(this.themeKey, theme);
    });
  }

  toggle(): void {
    this.themeSignal.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  private loadTheme(): void {
    const saved = localStorage.getItem(this.themeKey) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.themeSignal.set(saved || (prefersDark ? 'dark' : 'light'));
  }
}
