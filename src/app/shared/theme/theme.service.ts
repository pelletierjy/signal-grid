import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const storageKey = 'signal-grid-theme';

/**
 * Light and dark theme. Without a choice the site follows the operating system. A choice is stored
 * in the browser and sets html[data-theme], which the design tokens react to.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private _chosen: ThemeMode | null = this._read();

  readonly isDark = signal(this._effectiveIsDark());

  constructor() {
    this._systemQuery.addEventListener('change', () => this.isDark.set(this._effectiveIsDark()));
  }

  toggle(): void {
    this._chosen = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this._chosen);
    try {
      localStorage.setItem(storageKey, this._chosen);
    } catch {
      // storage can be blocked, the choice then lasts until the page is reloaded
    }
    this.isDark.set(this._effectiveIsDark());
  }

  private _effectiveIsDark(): boolean {
    return this._chosen ? this._chosen === 'dark' : this._systemQuery.matches;
  }

  private _read(): ThemeMode | null {
    try {
      const value = localStorage.getItem(storageKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }
}
