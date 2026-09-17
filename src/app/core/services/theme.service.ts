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
      globalThis.document?.documentElement.classList.toggle('dark', theme === 'dark');
      globalThis.localStorage?.setItem(this.themeKey, theme);
    });
  }

  toggle(): void {
    this.themeSignal.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  private loadTheme(): void {
    const saved = globalThis.localStorage?.getItem(this.themeKey) as 'light' | 'dark' | null;
    const prefersDark = globalThis.window?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    this.themeSignal.set(saved || (prefersDark ? 'dark' : 'light'));
  }
}
