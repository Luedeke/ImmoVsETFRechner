import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MobileGesturesService, SwipeEvent } from '../services/mobile-gestures.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mobile-enhanced-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mobile-chart-container" #chartContainer>
      <div class="chart-header" *ngIf="showHeader">
        <h4>{{ title }}</h4>
        <div class="chart-controls">
          <button 
            class="control-btn" 
            [class.active]="currentView === 0"
            (click)="switchView(0)"
            *ngIf="chartConfigs.length > 1">
            📊
          </button>
          <button 
            class="control-btn" 
            [class.active]="currentView === 1"
            (click)="switchView(1)"
            *ngIf="chartConfigs.length > 1">
            📈
          </button>
          <button 
            class="control-btn fullscreen-btn" 
            (click)="toggleFullscreen()"
            [class.active]="isFullscreen">
            {{ isFullscreen ? '🗗' : '⛶' }}
          </button>
        </div>
      </div>
      
      <div class="chart-wrapper" 
           [class.fullscreen]="isFullscreen"
           #chartWrapper>
        <canvas 
          baseChart
          #chart
          [data]="currentChartData"
          [options]="currentChartOptions"
          [type]="currentChartType">
        </canvas>
        
        <!-- Touch overlay for gestures -->
        <div class="touch-overlay" 
             #touchOverlay
             [class.visible]="showTouchHints">
          <div class="touch-hint">
            <div class="swipe-hint">👈 👉 Wischen zum Navigieren</div>
            <div class="pinch-hint" *ngIf="allowPinchZoom">🤏 Pinch zum Zoomen</div>
          </div>
        </div>
      </div>
      
      <!-- Mobile-specific chart navigation -->
      <div class="chart-nav" *ngIf="chartConfigs.length > 1 && !isFullscreen">
        <div class="nav-dots">
          <span 
            class="nav-dot" 
            *ngFor="let config of chartConfigs; let i = index"
            [class.active]="i === currentView"
            (click)="switchView(i)">
          </span>
        </div>
      </div>
      
      <!-- Loading overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Chart wird geladen...</div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-chart-container {
      position: relative;
      background: var(--bg-secondary);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--card-shadow);
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-bottom: 1px solid #dee2e6;
    }
    
    .chart-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .chart-controls {
      display: flex;
      gap: 8px;
    }
    
    .control-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      background: rgba(25, 118, 210, 0.1);
      color: #1976d2;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
    .control-btn:hover, .control-btn.active {
      background: var(--accent-primary);
      color: var(--text-on-accent);
      transform: scale(1.05);
    }
    
    .chart-wrapper {
      position: relative;
      height: 300px;
      padding: 16px;
      transition: all 0.3s ease;
    }
    
    .chart-wrapper.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: var(--bg-secondary);
      height: 100vh;
      padding: 20px;
      border-radius: 0;
    }
    
    .touch-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    
    .touch-overlay.visible {
      opacity: 1;
    }
    
    .touch-hint {
      text-align: center;
      color: var(--text-on-accent);
      font-size: 14px;
    }
    
    .swipe-hint, .pinch-hint {
      margin: 8px 0;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    
    .chart-nav {
      padding: 12px;
      display: flex;
      justify-content: center;
      background: #f8f9fa;
    }
    
    .nav-dots {
      display: flex;
      gap: 8px;
    }
    
    .nav-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ccc;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .nav-dot.active {
      background: #1976d2;
      transform: scale(1.3);
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    
    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e3f2fd;
      border-top: 3px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-text {
      color: #666;
      font-size: 14px;
    }
    
    /* Mobile specific styles */
    @media (max-width: 480px) {
      .chart-header h4 {
        font-size: 1rem;
      }
      
      .control-btn {
        width: 32px;
        height: 32px;
        font-size: 14px;
      }
      
      .chart-wrapper {
        height: 250px;
        padding: 12px;
      }
      
      .chart-wrapper.fullscreen {
        padding: 16px;
      }
    }
    
    @media (max-width: 768px) and (min-width: 481px) {
      .chart-wrapper {
        height: 280px;
      }
    }
  `]
})
export class MobileEnhancedChartComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() chartConfigs: ChartConfiguration<any>[] = [];
  @Input() showHeader = true;
  @Input() allowPinchZoom = true;
  @Input() allowSwipeNavigation = true;
  @Input() showTouchHints = false;
  
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLElement>;
  @ViewChild('chartWrapper') chartWrapper!: ElementRef<HTMLElement>;
  @ViewChild('touchOverlay') touchOverlay!: ElementRef<HTMLElement>;
  @ViewChild('chart') chartElement!: BaseChartDirective;
  
  currentView = 0;
  isFullscreen = false;
  isLoading = false;
  private readonly destroy$ = new Subject<void>();
  private gestureCleanupFunctions: (() => void)[] = [];

  constructor(
    private readonly mobileGestures: MobileGesturesService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get currentChartData() {
    return this.chartConfigs[this.currentView]?.data || { labels: [], datasets: [] };
  }

  get currentChartOptions() {
    return this.chartConfigs[this.currentView]?.options || {};
  }

  get currentChartType() {
    return this.chartConfigs[this.currentView]?.type || 'line';
  }

  ngOnInit(): void {
    if (this.mobileGestures.isMobileDevice()) {
      this.setupMobileGestures();
    }
    
    // Show touch hints initially on mobile
    if (this.showTouchHints && this.mobileGestures.isMobileDevice()) {
      setTimeout(() => {
        this.showTouchHintsTemporarily();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupGestures();
  }

  private setupMobileGestures(): void {
    setTimeout(() => {
      if (this.chartContainer?.nativeElement) {
        this.setupSwipeGestures();
        if (this.allowPinchZoom) {
          this.setupPinchZoom();
        }
        this.setupLongPress();
      }
    }, 100);
  }

  private setupSwipeGestures(): void {
    if (!this.allowSwipeNavigation || this.chartConfigs.length <= 1) return;

    const cleanup = this.mobileGestures.addSwipeListener(this.chartContainer.nativeElement);
    this.gestureCleanupFunctions.push(cleanup);

    this.mobileGestures.swipe$
      .pipe(takeUntil(this.destroy$))
      .subscribe((swipe: SwipeEvent) => {
        if (swipe.element === this.chartContainer.nativeElement) {
          if (swipe.direction === 'left' && this.currentView < this.chartConfigs.length - 1) {
            this.switchView(this.currentView + 1);
          } else if (swipe.direction === 'right' && this.currentView > 0) {
            this.switchView(this.currentView - 1);
          }
        }
      });
  }

  private setupPinchZoom(): void {
    const cleanup = this.mobileGestures.addPinchListener(this.chartWrapper.nativeElement);
    this.gestureCleanupFunctions.push(cleanup);

    this.mobileGestures.pinch$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pinch) => {
        if (pinch.element === this.chartWrapper.nativeElement) {
          // Apply zoom to chart if supported
          this.applyChartZoom(pinch.scale);
        }
      });
  }

  private setupLongPress(): void {
    const cleanup = this.mobileGestures.addLongPressListener(
      this.chartContainer.nativeElement,
      () => {
        this.toggleFullscreen();
      },
      800
    );
    this.gestureCleanupFunctions.push(cleanup);
  }

  private applyChartZoom(scale: number): void {
    // This would require chart.js zoom plugin in a real implementation
    if (this.chartElement?.chart) {
      const chartOptions = this.chartElement.chart.options as any;
      if (chartOptions.scales?.x) {
        // Simplified zoom logic - in practice use chart.js zoom plugin
        console.log(`Zoom scale: ${scale}`);
      }
    }
  }

  switchView(index: number): void {
    if (index >= 0 && index < this.chartConfigs.length && index !== this.currentView) {
      this.isLoading = true;
      this.currentView = index;
      
      // Simulate loading delay for smooth transition
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }, 200);
      
      this.cdr.markForCheck();
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    
    if (this.isFullscreen) {
      // Prevent body scroll when in fullscreen
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Trigger chart resize after fullscreen toggle
    setTimeout(() => {
      if (this.chartElement?.chart) {
        this.chartElement.chart.resize();
      }
    }, 300);
    
    this.cdr.markForCheck();
  }

  private showTouchHintsTemporarily(): void {
    this.showTouchHints = true;
    this.cdr.markForCheck();
    
    setTimeout(() => {
      this.showTouchHints = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  private cleanupGestures(): void {
    this.gestureCleanupFunctions.forEach(cleanup => cleanup());
    this.gestureCleanupFunctions = [];
  }
}