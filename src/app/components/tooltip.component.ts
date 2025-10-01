import { Component, Input, ChangeDetectionStrategy, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tooltip-container">
      <button 
        type="button"
        class="tooltip-trigger" 
        [attr.aria-label]="'Hilfe für: ' + text.split('.')[0]"
        [attr.aria-describedby]="tooltipId"
        [attr.aria-expanded]="showTooltip"
        (mouseenter)="onMouseEnter()" 
        (mouseleave)="onMouseLeave()"
        (click)="onToggle()"
        (keydown.escape)="onEscape()"
        (keydown.enter)="onToggle()"
        (keydown.space)="onToggle()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
      </button>
      <div 
        class="tooltip-content" 
        [class.visible]="showTooltip"
        [id]="tooltipId"
        role="tooltip"
        [attr.aria-hidden]="!showTooltip">
        <div class="tooltip-text">{{ text }}</div>
        <div class="tooltip-arrow" aria-hidden="true"></div>
      </div>
    </div>
  `,
  styles: [`
    .tooltip-container {
      position: relative;
      display: inline-block;
      margin-left: 8px;
    }

    .tooltip-trigger {
      background: none;
      border: none;
      padding: 0;
      color: #666;
      cursor: help;
      transition: color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .tooltip-trigger:focus {
      outline: 2px solid #1976d2;
      outline-offset: 2px;
    }

    .tooltip-trigger:hover {
      color: #1976d2;
    }

    .tooltip-trigger svg {
      width: 16px;
      height: 16px;
    }

    .tooltip-content {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
      background: #333;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.4;
      white-space: nowrap;
      max-width: 280px;
      white-space: normal;
      word-wrap: break-word;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .tooltip-content.visible {
      opacity: 1;
      visibility: visible;
    }

    .tooltip-text {
      font-weight: 400;
    }

    .tooltip-arrow {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #333;
    }

    @media (max-width: 768px) {
      .tooltip-content {
        position: fixed;
        bottom: auto;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
        max-width: 90vw;
        z-index: 2000;
      }

      .tooltip-arrow {
        display: none;
      }

      .tooltip-trigger {
        touch-action: manipulation;
      }
    }
  `]
})
export class TooltipComponent implements OnDestroy {
  @Input() text: string = '';
  
  showTooltip = false;
  tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  private hideTimeout?: number;

  onMouseEnter(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
    this.showTooltip = true;
  }

  onMouseLeave(): void {
    this.hideTimeout = window.setTimeout(() => {
      this.showTooltip = false;
    }, 100);
  }

  onToggle(): void {
    this.showTooltip = !this.showTooltip;
  }

  onEscape(): void {
    this.showTooltip = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.tooltip-container')) {
      this.showTooltip = false;
    }
  }

  ngOnDestroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
}