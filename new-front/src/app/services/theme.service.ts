import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'light' | 'dark' | 'system'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'light'
  );

  constructor() {
    effect(() => {
      const t = this.theme();
      localStorage.setItem('theme', t);

      const isDark = t === 'dark' ||
        (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    // Listen for system preference changes when in system mode.
    // Setting the signal to the same value won't retrigger the effect,
    // so we directly update the class instead.
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.theme() === 'system') {
          document.documentElement.classList.toggle('dark', e.matches);
        }
      });
    }
  }
}
