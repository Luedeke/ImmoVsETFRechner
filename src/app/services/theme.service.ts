import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'immo-rechner-theme';
  private readonly darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Signal for reactive theme state
  public theme = signal<Theme>(this.getInitialTheme());
  
  constructor() {
    // Apply theme changes to document
    effect(() => {
      this.applyTheme(this.theme());
    });
    
    // Listen to system theme changes
    this.darkModeQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.theme.set(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  private getInitialTheme(): Theme {
    // Check localStorage first
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Fall back to system preference
    return this.darkModeQuery.matches ? 'dark' : 'light';
  }
  
  public toggleTheme(): void {
    const newTheme: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  public setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }
  
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light-theme', 'dark-theme');
    
    // Apply new theme class
    root.classList.add(`${theme}-theme`);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }
  
  private updateMetaThemeColor(theme: Theme): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#1a1a1a' : '#1976d2';
      metaThemeColor.setAttribute('content', color);
    }
  }
  
  public isDark(): boolean {
    return this.theme() === 'dark';
  }
  
  public isLight(): boolean {
    return this.theme() === 'light';
  }
}