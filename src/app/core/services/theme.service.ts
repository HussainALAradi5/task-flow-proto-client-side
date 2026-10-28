import { Injectable, signal, effect } from '@angular/core';
import { ThemeMode } from '../enums/ui-control.enum';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeKey = 'taskflow_theme';
  private themeSignal = signal<ThemeMode>(ThemeMode.Light);

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.loadTheme();
    effect(() => {
      const theme = this.themeSignal();
      globalThis.document?.documentElement.classList.toggle('dark', theme === ThemeMode.Dark);
      globalThis.localStorage?.setItem(this.themeKey, theme);
    });
  }

  toggle(): void {
    this.themeSignal.update((t) => (t === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light));
  }

  private loadTheme(): void {
    const stored = globalThis.localStorage?.getItem(this.themeKey);
    const saved = Object.values(ThemeMode).includes(stored as ThemeMode) ? stored as ThemeMode : null;
    const prefersDark = globalThis.window?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    this.themeSignal.set(saved || (prefersDark ? ThemeMode.Dark : ThemeMode.Light));
  }
}
