import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-container" [ngClass]="'skeleton-' + type">
      <!-- Form skeleton -->
      <ng-container *ngIf="type === 'form'">
        <div class="skeleton-form-section" *ngFor="let section of [1,2,3,4]">
          <div class="skeleton-section-header"></div>
          <div class="skeleton-form-row" *ngFor="let row of [1,2,3]">
            <div class="skeleton-input" *ngFor="let input of [1,2,3]"></div>
          </div>
        </div>
      </ng-container>

      <!-- Chart skeleton -->
      <ng-container *ngIf="type === 'chart'">
        <div class="skeleton-chart-header">
          <div class="skeleton-chart-title"></div>
          <div class="skeleton-chart-controls">
            <div class="skeleton-control-btn" *ngFor="let btn of [1,2,3]"></div>
          </div>
        </div>
        <div class="skeleton-chart-area">
          <div class="skeleton-chart-legend">
            <div class="skeleton-legend-item" *ngFor="let item of [1,2,3]"></div>
          </div>
          <div class="skeleton-chart-content">
            <div class="skeleton-y-axis"></div>
            <div class="skeleton-chart-bars">
              <div class="skeleton-bar" 
                   *ngFor="let bar of [1,2,3,4,5,6,7,8]"
                   [style.height.%]="getRandomHeight()"></div>
            </div>
            <div class="skeleton-x-axis"></div>
          </div>
        </div>
      </ng-container>

      <!-- Table skeleton -->
      <ng-container *ngIf="type === 'table'">
        <div class="skeleton-table-header"></div>
        <div class="skeleton-table">
          <div class="skeleton-table-row skeleton-table-header-row">
            <div class="skeleton-table-cell" *ngFor="let cell of [1,2,3,4]"></div>
          </div>
          <div class="skeleton-table-row" *ngFor="let row of getRows()">
            <div class="skeleton-table-cell" *ngFor="let cell of [1,2,3,4]"></div>
          </div>
        </div>
      </ng-container>

      <!-- Card skeleton -->
      <ng-container *ngIf="type === 'card'">
        <div class="skeleton-card-header">
          <div class="skeleton-card-title"></div>
          <div class="skeleton-card-icon"></div>
        </div>
        <div class="skeleton-card-content">
          <div class="skeleton-card-row" *ngFor="let row of getRows()">
            <div class="skeleton-card-label"></div>
            <div class="skeleton-card-value"></div>
          </div>
        </div>
      </ng-container>

      <!-- Text lines skeleton -->
      <ng-container *ngIf="type === 'text'">
        <div class="skeleton-text-line" 
             *ngFor="let line of getRows()"
             [style.width.%]="getRandomWidth()"></div>
      </ng-container>

      <!-- Summary grid skeleton -->
      <ng-container *ngIf="type === 'summary'">
        <div class="skeleton-summary-grid">
          <div class="skeleton-summary-item" *ngFor="let item of [1,2,3]">
            <div class="skeleton-summary-icon"></div>
            <div class="skeleton-summary-content">
              <div class="skeleton-summary-title"></div>
              <div class="skeleton-summary-value"></div>
              <div class="skeleton-summary-label"></div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .skeleton-container {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }

    .skeleton-container > * {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200px 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    /* Form skeleton styles */
    .skeleton-form-section {
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .skeleton-section-header {
      height: 20px;
      width: 150px;
      margin-bottom: 16px;
      border-radius: 4px;
    }

    .skeleton-form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .skeleton-input {
      flex: 1;
      height: 40px;
      border-radius: 6px;
    }

    /* Chart skeleton styles */
    .skeleton-chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-bottom: 16px;
    }

    .skeleton-chart-title {
      height: 24px;
      width: 200px;
      border-radius: 4px;
    }

    .skeleton-chart-controls {
      display: flex;
      gap: 8px;
    }

    .skeleton-control-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
    }

    .skeleton-chart-area {
      height: 300px;
      padding: 16px;
    }

    .skeleton-chart-legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .skeleton-legend-item {
      height: 16px;
      width: 80px;
      border-radius: 4px;
    }

    .skeleton-chart-content {
      display: flex;
      height: 200px;
      gap: 8px;
    }

    .skeleton-y-axis {
      width: 40px;
      height: 100%;
      border-radius: 4px;
    }

    .skeleton-chart-bars {
      flex: 1;
      display: flex;
      align-items: end;
      gap: 4px;
      padding: 0 8px;
    }

    .skeleton-bar {
      flex: 1;
      min-height: 20px;
      border-radius: 4px 4px 0 0;
    }

    .skeleton-x-axis {
      width: 100%;
      height: 20px;
      margin-top: 8px;
      border-radius: 4px;
    }

    /* Table skeleton styles */
    .skeleton-table-header {
      height: 24px;
      width: 180px;
      margin-bottom: 16px;
      border-radius: 4px;
    }

    .skeleton-table {
      width: 100%;
    }

    .skeleton-table-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .skeleton-table-header-row .skeleton-table-cell {
      height: 32px;
      background: #e0e0e0;
    }

    .skeleton-table-cell {
      flex: 1;
      height: 28px;
      border-radius: 4px;
    }

    /* Card skeleton styles */
    .skeleton-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .skeleton-card-title {
      height: 20px;
      width: 120px;
      border-radius: 4px;
    }

    .skeleton-card-icon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }

    .skeleton-card-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .skeleton-card-label {
      height: 16px;
      width: 100px;
      border-radius: 4px;
    }

    .skeleton-card-value {
      height: 16px;
      width: 80px;
      border-radius: 4px;
    }

    /* Text skeleton styles */
    .skeleton-text-line {
      height: 16px;
      margin-bottom: 8px;
      border-radius: 4px;
    }

    /* Summary skeleton styles */
    .skeleton-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .skeleton-summary-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--bg-secondary);
      border-radius: 12px;
      box-shadow: var(--card-shadow);
    }

    .skeleton-summary-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .skeleton-summary-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-summary-title {
      height: 18px;
      width: 80px;
      border-radius: 4px;
    }

    .skeleton-summary-value {
      height: 24px;
      width: 120px;
      border-radius: 4px;
    }

    .skeleton-summary-label {
      height: 14px;
      width: 100px;
      border-radius: 4px;
    }

    /* Mobile optimizations */
    @media (max-width: 480px) {
      .skeleton-form-row {
        flex-direction: column;
        gap: 12px;
      }

      .skeleton-chart-area {
        height: 250px;
        padding: 12px;
      }

      .skeleton-chart-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .skeleton-chart-controls {
        justify-content: center;
      }

      .skeleton-summary-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .skeleton-summary-item {
        padding: 16px;
        flex-direction: column;
        text-align: center;
      }
    }

    @media (max-width: 768px) and (min-width: 481px) {
      .skeleton-chart-area {
        height: 280px;
      }
      
      .skeleton-summary-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .skeleton-container,
      .skeleton-container > * {
        animation: none;
      }
      
      .skeleton-container > * {
        background: #f0f0f0;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'form' | 'chart' | 'table' | 'card' | 'text' | 'summary' = 'card';
  @Input() rows = 5;

  getRows(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i + 1);
  }

  getRandomHeight(): number {
    return Math.floor(Math.random() * 60) + 20; // 20-80%
  }

  getRandomWidth(): number {
    return Math.floor(Math.random() * 40) + 60; // 60-100%
  }
}