import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorService, ProjectionRow, ImmoVsEtfResult } from '../services/calculator.service';
import { Subject, takeUntil } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-comparison-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>📊 Vermögensentwicklung: Immobilie vs. ETF</h3>
      
      <div class="chart-container" *ngIf="lineChartData.datasets.length > 0">
        <canvas 
          baseChart
          [data]="lineChartData"
          [options]="lineChartOptions"
          [type]="lineChartType"
          [legend]="lineChartLegend">
        </canvas>
      </div>
      
      <div class="comparison-summary" *ngIf="finalComparison">
        <div class="summary-grid">
          <div class="summary-item immo">
            <div class="icon">🏠</div>
            <div class="content">
              <h4>Immobilie</h4>
              <div class="value">{{ formatCurrency(finalComparison.net_sale_proceeds) }}</div>
              <div class="label">Netto-Verkaufserlös</div>
            </div>
          </div>
          
          <div class="summary-item etf">
            <div class="icon">📈</div>
            <div class="content">
              <h4>ETF-Portfolio</h4>
              <div class="value">{{ formatCurrency(finalComparison.net_etf_value) }}</div>
              <div class="label">Netto-Endwert</div>
            </div>
          </div>
          
          <div class="summary-item advantage" [class.immo-advantage]="finalComparison.advantage_immo > 0" [class.etf-advantage]="finalComparison.advantage_immo < 0">
            <div class="icon">{{ finalComparison.advantage_immo > 0 ? '🏠' : '📈' }}</div>
            <div class="content">
              <h4>Vorteil</h4>
              <div class="value">{{ formatCurrency(getAbsoluteAdvantage()) }}</div>
              <div class="label">{{ finalComparison.advantage_immo > 0 ? 'Immobilie besser' : 'ETF besser' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 400px;
      margin: 20px 0;
    }
    
    .chart-container canvas {
      max-height: 400px !important;
    }
    
    .comparison-summary {
      margin-top: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .summary-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }
    
    .summary-item:hover {
      transform: translateY(-2px);
    }
    
    .summary-item.immo {
      border-left: 4px solid #2196f3;
    }
    
    .summary-item.etf {
      border-left: 4px solid #4caf50;
    }
    
    .summary-item.advantage.immo-advantage {
      border-left: 4px solid #2196f3;
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    }
    
    .summary-item.advantage.etf-advantage {
      border-left: 4px solid #4caf50;
      background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
    }
    
    .icon {
      font-size: 2rem;
      flex-shrink: 0;
    }
    
    .content h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.1rem;
    }
    
    .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1976d2;
      margin-bottom: 4px;
    }
    
    .label {
      font-size: 0.9rem;
      color: #666;
    }
    
    /* Mobile optimizations */
    @media (max-width: 480px) {
      .chart-container {
        height: 250px;
        margin: 16px -12px; /* Extend to card edges */
        border-radius: 0;
      }
      
      .summary-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .summary-item {
        padding: 12px;
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }
      
      .icon {
        font-size: 1.5rem;
      }
      
      .value {
        font-size: 1.2rem;
      }
      
      .content h4 {
        font-size: 1rem;
        margin-bottom: 4px;
      }
      
      .label {
        font-size: 0.8rem;
      }
    }
    
    @media (max-width: 768px) and (min-width: 481px) {
      .chart-container {
        height: 300px;
      }
      
      .summary-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      
      .summary-item {
        padding: 16px;
      }
      
      .value {
        font-size: 1.3rem;
      }
    }
    
    @media (max-width: 1024px) and (min-width: 769px) {
      .chart-container {
        height: 350px;
      }
    }
  `]
})
export class ComparisonChartComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  projectionRows: ProjectionRow[] = [];
  finalComparison: ImmoVsEtfResult | null = null;
  
  // Chart configuration
  lineChartType: 'line' = 'line';
  lineChartLegend = true;
  
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6
      },
      line: {
        tension: 0.2
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Jahre',
          font: {
            size: 12
          }
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Vermögenswert (€)',
          font: {
            size: 12
          }
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              notation: 'compact'
            }).format(value as number);
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#1976d2',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
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

  private updateChartData(): void {
    this.projectionRows = this.calc.projection();
    this.finalComparison = this.calc.immoVsEtf();
    
    this.generateChartData();
    this.cdr.markForCheck();
  }

  private generateChartData(): void {
    if (this.projectionRows.length === 0) return;

    const years = this.projectionRows.map(row => `Jahr ${row.year}`);
    const immobilienWerte = this.projectionRows.map(row => row.immobilienwert);
    const restschulden = this.projectionRows.map(row => row.restschuld);
    const eigenkapitalWerte = immobilienWerte.map((wert, index) => wert - restschulden[index]);
    
    // ETF-Wertentwicklung berechnen
    const inputs = this.calc.getInputs();
    const etfWerte = this.calculateETFProgression(inputs.eigenkapital, inputs.etf_rendite_pct / 100, years.length);
    
    this.lineChartData = {
      labels: years,
      datasets: [
        {
          data: eigenkapitalWerte,
          label: '🏠 Immobilie (Eigenkapital)',
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: false,
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          data: etfWerte,
          label: '📈 ETF-Portfolio',
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: false,
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          data: immobilienWerte,
          label: '🏠 Immobilienwert (gesamt)',
          borderColor: '#1565c0',
          backgroundColor: 'rgba(21, 101, 192, 0.05)',
          fill: false,
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 4,
          borderDash: [5, 5]
        }
      ]
    };
  }

  private calculateETFProgression(startCapital: number, yearlyReturn: number, years: number): number[] {
    const inputs = this.calc.getInputs();
    const monthlyContribution = this.getMonthlyETFContribution();
    const progression: number[] = [];
    
    let currentValue = startCapital;
    
    for (let year = 1; year <= years; year++) {
      // Jährliche Rendite auf aktuellen Wert
      currentValue = currentValue * (1 + yearlyReturn);
      
      // Monatliche Beiträge mit Rendite über das Jahr
      const yearlyContribution = monthlyContribution * 12;
      const contributionWithReturn = yearlyContribution * (1 + yearlyReturn / 2); // Vereinfachte Berechnung
      currentValue += contributionWithReturn;
      
      progression.push(Math.round(currentValue));
    }
    
    return progression;
  }

  private getMonthlyETFContribution(): number {
    // Berechne monatlichen ETF-Beitrag basierend auf gesparten Kosten der Immobilie
    const annualCalc = this.calc.calcAnnual();
    const cashflowRow = annualCalc.find(row => row.key === 'Cashflow nach Steuern (jährlich)');
    const monthlyCashflow = cashflowRow ? Math.abs(cashflowRow.value) / 12 : 0;
    
    return monthlyCashflow;
  }

  getAbsoluteAdvantage(): number {
    return this.finalComparison ? Math.abs(this.finalComparison.advantage_immo) : 0;
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