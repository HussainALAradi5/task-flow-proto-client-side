import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

describe('App', () => {
  it('shows the signed-in navigation and profile', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: signal(true), currentUser: signal({ userName: 'demo_leader' }), logout: () => {} } },
        { provide: ThemeService, useValue: { theme: signal('light'), toggle: () => {} } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('demo_leader');
    expect(text).toContain('Projects');
    expect(text).toContain('Teams');
  });
});
