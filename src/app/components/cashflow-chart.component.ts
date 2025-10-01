import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorService, ProjectionRow } from '../services/calculator.service';
import { Subject, takeUntil } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-cashflow-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>💰 Cashflow-Entwicklung über Zeit</h3>
      
      <div class="chart-tabs">
        <button 
          class="tab-button" 
          [class.active]="activeChart === 'cashflow'"
          (click)="setActiveChart('cashflow')">
          💰 Jährlicher Cashflow
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeChart === 'cumulative'"
          (click)="setActiveChart('cumulative')">
          📊 Kumulativer Cashflow
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeChart === 'breakdown'"
          (click)="setActiveChart('breakdown')">
          🔍 Cashflow-Komponenten
        </button>
      </div>
      
      <div class="chart-container" *ngIf="chartData.datasets.length > 0">
        <canvas 
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          [type]="chartType"
          [legend]="chartLegend">
        </canvas>
      </div>
      
      <div class="cashflow-stats" *ngIf="cashflowStats">
        <div class="stats-grid">
          <div class="stat-item positive" *ngIf="cashflowStats.totalPositiveCashflow > 0">
            <div class="stat-value">{{ formatCurrency(cashflowStats.totalPositiveCashflow) }}</div>
            <div class="stat-label">Gesamter positiver Cashflow</div>
          </div>
          <div class="stat-item negative" *ngIf="cashflowStats.totalNegativeCashflow < 0">
            <div class="stat-value">{{ formatCurrency(getAbsNegativeCashflow()) }}</div>
            <div class="stat-label">Gesamter negativer Cashflow</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatCurrency(cashflowStats.averageCashflow) }}</div>
            <div class="stat-label">Durchschnittlicher Cashflow</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">Jahr {{ cashflowStats.breakEvenYear || 'N/A' }}</div>
            <div class="stat-label">Break-Even Point</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      background: #f8f9fa;
      padding: 4px;
      border-radius: 8px;
    }
    
    .tab-button {
      flex: 1;
      padding: 12px 16px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
      color: #666;
    }
    
    .tab-button:hover {
      background: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }
    
    .tab-button.active {
      background: #1976d2;
      color: white;
      box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
    }
    
    .chart-container {
      position: relative;
      height: 400px;
      margin: 20px 0;
    }
    
    .chart-container canvas {
      max-height: 400px !important;
    }
    
    .cashflow-stats {
      margin-top: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .stat-item {
      text-align: center;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .stat-item.positive {
      border-left: 4px solid #4caf50;
    }
    
    .stat-item.negative {
      border-left: 4px solid #f44336;
    }
    
    .stat-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1976d2;
      margin-bottom: 4px;
    }
    
    .stat-item.positive .stat-value {
      color: #4caf50;
    }
    
    .stat-item.negative .stat-value {
      color: #f44336;
    }
    
    .stat-label {
      font-size: 0.9rem;
      color: #666;
    }
    
    /* Enhanced mobile responsiveness */
    @media (max-width: 480px) {
      .chart-tabs {
        flex-direction: column;
        margin: 16px -12px; /* Extend to card edges */
        border-radius: 0;
        padding: 2px;
      }
      
      .tab-button {
        padding: 10px 12px;
        font-size: 13px;
        text-align: center;
      }
      
      .chart-container {
        height: 280px;
        margin: 16px -12px; /* Extend to card edges */
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .stat-item {
        padding: 12px;
      }
      
      .stat-value {
        font-size: 1.2rem;
      }
      
      .stat-label {
        font-size: 0.8rem;
      }
    }
    
    @media (max-width: 768px) and (min-width: 481px) {
      .chart-tabs {
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .tab-button {
        flex: 1;
        min-width: 140px;
        font-size: 14px;
      }
      
      .chart-container {
        height: 320px;
      }
      
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
    }
    
    @media (max-width: 1024px) and (min-width: 769px) {
      .chart-container {
        height: 380px;
      }
    }
  `]
})
export class CashflowChartComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  projectionRows: ProjectionRow[] = [];
  activeChart: 'cashflow' | 'cumulative' | 'breakdown' = 'cashflow';
  cashflowStats: any = null;
  
  chartType: 'bar' | 'line' = 'bar';
  chartLegend = true;
  
  chartData: ChartConfiguration<'bar' | 'line'>['data'] = {
    labels: [],
    datasets: []
  };
  
  chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Jahre'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Cashflow (€)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value as number);
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(context.parsed.y);
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  constructor(
    private readonly calc: CalculatorService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.calc.inputsObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateChartData();
      });
    
    this.updateChartData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveChart(chart: 'cashflow' | 'cumulative' | 'breakdown'): void {
    this.activeChart = chart;
    this.updateChartData();
  }

  private updateChartData(): void {
    this.projectionRows = this.calc.projection();
    this.calculateCashflowStats();
    
    switch (this.activeChart) {
      case 'cashflow':
        this.generateCashflowChart();
        break;
      case 'cumulative':
        this.generateCumulativeChart();
        break;
      case 'breakdown':
        this.generateBreakdownChart();
        break;
    }
    
    this.cdr.markForCheck();
  }

  private generateCashflowChart(): void {
    this.chartType = 'bar';
    
    const years = this.projectionRows.map(row => `Jahr ${row.year}`);
    const cashflows = this.projectionRows.map(row => row.cashflow_nach_steuern);
    
    // Farben für positive/negative Cashflows
    const backgroundColors = cashflows.map(cf => 
      cf >= 0 ? 'rgba(76, 175, 80, 0.7)' : 'rgba(244, 67, 54, 0.7)'
    );
    const borderColors = cashflows.map(cf => 
      cf >= 0 ? '#4caf50' : '#f44336'
    );
    
    this.chartData = {
      labels: years,
      datasets: [
        {
          data: cashflows,
          label: '💰 Jährlicher Cashflow',
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2
        }
      ]
    };
  }

  private generateCumulativeChart(): void {
    this.chartType = 'line';
    
    const years = this.projectionRows.map(row => `Jahr ${row.year}`);
    const cashflows = this.projectionRows.map(row => row.cashflow_nach_steuern);
    
    // Kumulativer Cashflow berechnen
    const cumulativeCashflows: number[] = [];
    let cumulative = 0;
    for (const cf of cashflows) {
      cumulative += cf;
      cumulativeCashflows.push(cumulative);
    }
    
    this.chartData = {
      labels: years,
      datasets: [
        {
          data: cumulativeCashflows,
          label: '📊 Kumulativer Cashflow',
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }

  private generateBreakdownChart(): void {
    this.chartType = 'bar';
    
    const years = this.projectionRows.map(row => `Jahr ${row.year}`);
    const mieteinnahmen = this.projectionRows.map(row => row.mieteinnahmen);
    const zinsaufwand = this.projectionRows.map(row => -row.zinsaufwand);
    const tilgung = this.projectionRows.map(row => -row.tilgung);
    
    this.chartData = {
      labels: years,
      datasets: [
        {
          data: mieteinnahmen,
          label: '🏠 Mieteinnahmen',
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: '#4caf50',
          borderWidth: 1
        },
        {
          data: zinsaufwand,
          label: '💸 Zinsaufwand',
          backgroundColor: 'rgba(244, 67, 54, 0.7)',
          borderColor: '#f44336',
          borderWidth: 1
        },
        {
          data: tilgung,
          label: '🏦 Tilgung',
          backgroundColor: 'rgba(255, 152, 0, 0.7)',
          borderColor: '#ff9800',
          borderWidth: 1
        }
      ]
    };
  }

  private calculateCashflowStats(): void {
    if (this.projectionRows.length === 0) {
      this.cashflowStats = null;
      return;
    }

    const cashflows = this.projectionRows.map(row => row.cashflow_nach_steuern);
    
    const totalPositiveCashflow = cashflows
      .filter(cf => cf > 0)
      .reduce((sum, cf) => sum + cf, 0);
    
    const totalNegativeCashflow = cashflows
      .filter(cf => cf < 0)
      .reduce((sum, cf) => sum + cf, 0);
    
    const averageCashflow = cashflows.reduce((sum, cf) => sum + cf, 0) / cashflows.length;
    
    // Break-Even Point finden
    let cumulativeCashflow = 0;
    let breakEvenYear: number | null = null;
    
    for (let i = 0; i < cashflows.length; i++) {
      cumulativeCashflow += cashflows[i];
      if (cumulativeCashflow >= 0 && breakEvenYear === null) {
        breakEvenYear = i + 1;
      }
    }
    
    this.cashflowStats = {
      totalPositiveCashflow,
      totalNegativeCashflow,
      averageCashflow,
      breakEvenYear
    };
  }

  getAbsNegativeCashflow(): number {
    return this.cashflowStats ? Math.abs(this.cashflowStats.totalNegativeCashflow) : 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}