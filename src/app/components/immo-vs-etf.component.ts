import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorService, ImmoVsEtfResult } from '../services/calculator.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-immo-vs-etf',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>Immobilie vs. ETF Vergleich</h3>
      
      <div class="comparison-container" *ngIf="result">
        
        <!-- Immobilie -->
        <div class="investment-block immo-block">
          <h4>📍 Immobilien-Investment</h4>
          <div class="value-item">
            <span class="label">Netto-Verkaufserlös nach {{ getHaltejahre() }} Jahren:</span>
            <span class="value main-value">{{ formatCurrency(result.net_sale_proceeds) }}</span>
          </div>
        </div>

        <!-- ETF -->
        <div class="investment-block etf-block">
          <h4>📈 ETF-Investment</h4>
          <div class="value-item">
            <span class="label">Eigenkapital angelegt ({{ getHaltejahre() }} Jahre):</span>
            <span class="value">{{ formatCurrency(result.fv_eigenkapital) }}</span>
          </div>
          <div class="value-item">
            <span class="label">Monatliche Sparrate ({{ getHaltejahre() }} Jahre):</span>
            <span class="value">{{ formatCurrency(result.fv_monthly_contrib) }}</span>
          </div>
          <div class="separator"></div>
          <div class="value-item">
            <span class="label">Gesamt-ETF-Wert (brutto):</span>
            <span class="value">{{ formatCurrency(result.total_etf_value) }}</span>
          </div>
          <div class="value-item tax-item">
            <span class="label">🏛️ ETF-Steuern (Kapitalertragsteuer):</span>
            <span class="value tax-value">-{{ formatCurrency(result.total_etf_taxes) }}</span>
          </div>
          <div class="separator"></div>
          <div class="value-item">
            <span class="label">ETF-Wert nach Steuern:</span>
            <span class="value main-value">{{ formatCurrency(result.net_etf_value) }}</span>
          </div>
        </div>

        <!-- Vergleich -->
        <div class="comparison-result" [class.immo-wins]="result.advantage_immo > 0" [class.etf-wins]="result.advantage_immo < 0">
          <div class="result-header">
            <h4>🏆 Ergebnis</h4>
          </div>
          
          <div class="advantage-display">
            <div class="advantage-label">
              <span *ngIf="result.advantage_immo > 0">Immobilie ist besser um:</span>
              <span *ngIf="result.advantage_immo < 0">ETF ist besser um:</span>
              <span *ngIf="result.advantage_immo === 0">Beide Investments sind gleich</span>
            </div>
            <div class="advantage-value" *ngIf="result.advantage_immo !== 0">
              {{ formatCurrency(getAbsoluteAdvantage()) }}
            </div>
          </div>

          <div class="percentage-display" *ngIf="result.advantage_immo !== 0">
            <span class="percentage">
              {{ formatPercentage() }}
            </span>
          </div>
        </div>

        <!-- Zusätzliche Informationen -->
        <div class="info-block">
          <h4>ℹ️ Berechnungsgrundlage</h4>
          <div class="info-item">
            <span>Monatliche ETF-Sparrate:</span>
            <span>{{ formatCurrency(getMonthlySavings()) }}</span>
          </div>
          <div class="info-item">
            <span>ETF-Rendite p.a.:</span>
            <span>{{ getEtfRate() }}%</span>
          </div>
          <div class="info-item small">
            Die monatliche ETF-Sparrate entspricht den Kosten für Kreditrate, Betriebskosten und Rücklagen der Immobilie.
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .comparison-container {
      display: grid;
      gap: 20px;
      margin-top: 16px;
    }
    
    .investment-block {
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #e0e0e0;
    }
    
    .immo-block {
      background: linear-gradient(135deg, #fff3e0, #ffe0b2);
      border-color: #ff9800;
    }
    
    .etf-block {
      background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
      border-color: #4caf50;
    }
    
    .investment-block h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .value-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px 0;
    }
    
    .label {
      font-weight: 500;
      color: #555;
      flex: 1;
    }
    
    .value {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      font-size: 1.1rem;
      color: #333;
      text-align: right;
      margin-left: 16px;
    }
    
    .main-value {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1976d2;
    }
    
    .separator {
      height: 1px;
      background: #ddd;
      margin: 12px 0;
    }
    
    .comparison-result {
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      border: 3px solid #ddd;
    }
    
    .immo-wins {
      background: linear-gradient(135deg, #fff3e0, #ffe0b2);
      border-color: #ff9800;
    }
    
    .etf-wins {
      background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
      border-color: #4caf50;
    }
    
    .result-header h4 {
      margin: 0 0 20px 0;
      font-size: 1.3rem;
    }
    
    .advantage-display {
      margin-bottom: 16px;
    }
    
    .advantage-label {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }
    
    .advantage-value {
      font-family: 'Courier New', monospace;
      font-size: 2rem;
      font-weight: 700;
      color: #1976d2;
    }
    
    .percentage-display {
      padding-top: 16px;
      border-top: 1px solid #ddd;
    }
    
    .percentage {
      font-size: 1.2rem;
      font-weight: 600;
      color: #666;
    }
    
    .info-block {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }
    
    .info-block h4 {
      margin: 0 0 12px 0;
      font-size: 1.1rem;
      color: #495057;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }
    
    .info-item.small {
      font-style: italic;
      color: #666;
      margin-top: 12px;
      display: block;
    }
    
    .tax-item {
      background: rgba(244, 67, 54, 0.1);
      border-radius: 6px;
      padding: 8px 12px;
      margin: 8px 0;
    }
    
    .tax-value {
      color: #d32f2f !important;
      font-weight: 700;
    }
    
    @media (max-width: 768px) {
      .value-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .value {
        margin-left: 0;
        text-align: left;
      }
      
      .advantage-value {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ImmoVsEtfComponent implements OnInit, OnDestroy {
  result: ImmoVsEtfResult | null = null;
  private destroy$ = new Subject<void>();

  constructor(private calc: CalculatorService) {}

  ngOnInit(): void {
    this.updateCalculations();
    
    this.calc.inputsObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateCalculations();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCalculations(): void {
    this.result = this.calc.immoVsEtf();
  }

  formatCurrency(value: number): string {
    if (!value && value !== 0) return '0 €';
    
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(): string {
    if (!this.result || this.result.net_etf_value === 0) return '0%';
    
    const percentage = Math.abs(this.result.advantage_immo / this.result.net_etf_value * 100);
    return `(${percentage.toFixed(1)}% ${this.result.advantage_immo > 0 ? 'mehr' : 'weniger'})`;
  }

  getHaltejahre(): number {
    return this.calc.getInputs().haltejahre;
  }

  getEtfRate(): number {
    return this.calc.getInputs().etf_rendite_pct;
  }

  getMonthlySavings(): number {
    const annualCalc = this.calc.calcAnnual();
    const loanPayment = annualCalc.find(r => r.key === 'Jährliche Kreditrate (Zins+Tilgung)')?.value || 0;
    const operatingCosts = annualCalc.find(r => r.key === 'Betriebskosten (jährlich)')?.value || 0;
    const reserves = annualCalc.find(r => r.key === 'Rücklagen (jährlich)')?.value || 0;
    
    return (loanPayment + operatingCosts + reserves) / 12;
  }

  getAbsoluteAdvantage(): number {
    return this.result ? Math.abs(this.result.advantage_immo) : 0;
  }
}