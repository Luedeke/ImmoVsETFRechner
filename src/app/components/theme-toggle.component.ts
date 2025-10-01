import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button 
      class="theme-toggle"
      (click)="toggleTheme()" 
      [attr.aria-label]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      [title]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
      <span class="theme-icon">
        @if (themeService.isDark()) {
          ☀️
        } @else {
          🌙
        }
      </span>
      <span class="theme-text">
        {{ themeService.isDark() ? 'Light' : 'Dark' }}
      </span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 25px;
      background: rgba(255, 255, 255, 0.15);
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      min-width: 90px;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .theme-toggle:active {
      transform: translateY(0);
    }
    
    .theme-icon {
      font-size: 18px;
      transition: transform 0.3s ease;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }
    
    .theme-toggle:hover .theme-icon {
      transform: scale(1.15);
    }
    
    .theme-text {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    /* Dark theme adjustments */
    :global(.dark-theme) .theme-toggle {
      background: rgba(0, 0, 0, 0.2);
      color: #e0e0e0;
    }
    
    :global(.dark-theme) .theme-toggle:hover {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    /* Mobile optimizations */
    @media (max-width: 480px) {
      .theme-toggle {
        padding: 6px 10px;
        font-size: 12px;
        min-width: 70px;
      }
      
      .theme-icon {
        font-size: 14px;
      }
      
      .theme-text {
        font-size: 10px;
      }
    }
  `]
})
export class ThemeToggleComponent {
  protected themeService = inject(ThemeService);
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}