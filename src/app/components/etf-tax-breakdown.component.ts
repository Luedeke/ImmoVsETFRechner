import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorService } from '../services/calculator.service';
import { ETFTaxCalculatorService, ETFTaxCalculation } from '../services/etf-tax-calculator.service';
import { Subject, takeUntil } from 'rxjs';
import { Inputs } from '../models/inputs.model';

@Component({
  selector: 'app-etf-tax-breakdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" *ngIf="etfTaxDetails">
      <h3>📊 ETF Steuerberechnung (Deutschland)</h3>
      
      <div class="tax-overview">
        <div class="overview-grid">
          <div class="overview-item">
            <span class="label">Gesamtinvestition:</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.totalInvestment) }}</span>
          </div>
          <div class="overview-item">
            <span class="label">Bruttorendite:</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.totalGrossReturn) }}</span>
          </div>
          <div class="overview-item">
            <span class="label">Kapitalgewinn:</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.totalCapitalGains) }}</span>
          </div>
          <div class="overview-item highlight">
            <span class="label">Nettorendite (nach Steuern):</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.netReturn) }}</span>
          </div>
        </div>
      </div>

      <!-- Teilfreistellung -->
      <div class="tax-section">
        <h4>🛡️ Teilfreistellung</h4>
        <div class="tax-detail">
          <div class="detail-row">
            <span class="label">Teilfreistellungssatz:</span>
            <span class="value">{{ etfTaxDetails.partialExemptionRate }}%</span>
          </div>
          <div class="detail-row">
            <span class="label">Steuerfreier Betrag:</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.partialExemptionAmount) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Zu versteuernde Kapitalgewinne:</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.taxableCapitalGains) }}</span>
          </div>
        </div>
      </div>

      <!-- Vorabpauschale -->
      <div class="tax-section" *ngIf="etfTaxDetails.totalAdvanceLumpSum > 0">
        <h4>⏰ Vorabpauschale (Thesaurierende ETFs)</h4>
        <div class="tax-detail">
          <div class="detail-row">
            <span class="label">Gesamte Vorabpauschale:</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.totalAdvanceLumpSum) }}</span>
          </div>
          <div class="yearly-breakdown" *ngIf="etfTaxDetails.taxDetails?.yearlyAdvanceLumpSums?.length">
            <h5>Jährliche Aufschlüsselung:</h5>
            <div class="yearly-item" *ngFor="let year of etfTaxDetails.taxDetails.yearlyAdvanceLumpSums; trackBy: trackByYear">
              <span class="year">Jahr {{ year.year }}:</span>
              <span class="amount">{{ formatCurrency(year.lumpSum) }}</span>
              <span class="tax-amount">(Steuer: {{ formatCurrency(year.taxOnLumpSum) }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Steuerberechnung -->
      <div class="tax-section">
        <h4>🏛️ Steuerberechnung</h4>
        <div class="tax-calculation">
          <div class="calc-row">
            <span class="label">Kapitalertragsteuer (25%):</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.capitalGainsTax) }}</span>
          </div>
          <div class="calc-row" *ngIf="etfTaxDetails.solidarityTax > 0">
            <span class="label">Solidaritätszuschlag (5,5%):</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.solidarityTax) }}</span>
          </div>
          <div class="calc-row" *ngIf="etfTaxDetails.churchTax > 0">
            <span class="label">Kirchensteuer (8%):</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.churchTax) }}</span>
          </div>
          <div class="calc-row total">
            <span class="label">Gesamte Steuerlast:</span>
            <span class="value">{{ formatCurrency(etfTaxDetails.totalTaxes) }}</span>
          </div>
        </div>
      </div>

      <!-- Effektive Rendite -->
      <div class="tax-section performance">
        <h4>📈 Rendite-Analyse</h4>
        <div class="performance-grid">
          <div class="perf-item">
            <span class="label">Effektive Rendite p.a.:</span>
            <span class="value rate">{{ etfTaxDetails.effectiveReturnRate.toFixed(2) }}%</span>
          </div>
          <div class="perf-item">
            <span class="label">Steuerlast (% der Gewinne):</span>
            <span class="value rate">{{ getTaxRateOnGains().toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <!-- ETF-Typen Info -->
      <div class="info-section">
        <h4>💡 ETF-Steuer Informationen</h4>
        <div class="info-grid">
          <div class="info-item">
            <strong>Teilfreistellung nach ETF-Typ:</strong>
            <ul>
              <li *ngFor="let item of getPartialExemptionRates() | keyvalue; trackBy: trackByKey">
                {{ item.key }}: {{ item.value }}%
              </li>
            </ul>
          </div>
          <div class="info-item">
            <strong>Vorabpauschale:</strong>
            <p class="small">
              Bei thesaurierenden ETFs wird jährlich eine Vorabpauschale berechnet 
              (70% des Basiszinses auf den Fondsanteilswert). Diese wird bei Verkauf 
              mit der tatsächlichen Steuerschuld verrechnet.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tax-overview {
      margin-bottom: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border-radius: 12px;
      border: 2px solid #2196f3;
    }
    
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .overview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
    }
    
    .overview-item.highlight {
      background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
      border: 2px solid #4caf50;
      font-weight: 600;
    }
    
    .tax-section {
      margin-bottom: 24px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #1976d2;
    }
    
    .tax-section.performance {
      border-left-color: #4caf50;
      background: linear-gradient(135deg, #f1f8e9, #dcedc8);
    }
    
    .tax-section h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .tax-detail, .tax-calculation {
      background: rgba(255, 255, 255, 0.7);
      padding: 16px;
      border-radius: 8px;
    }
    
    .detail-row, .calc-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .calc-row.total {
      border-bottom: none;
      border-top: 2px solid #1976d2;
      margin-top: 12px;
      padding-top: 12px;
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .yearly-breakdown {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
    }
    
    .yearly-breakdown h5 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      color: #555;
    }
    
    .yearly-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 0.9rem;
    }
    
    .year {
      font-weight: 500;
      min-width: 80px;
    }
    
    .amount {
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
    
    .tax-amount {
      font-size: 0.8rem;
      color: #666;
      font-style: italic;
    }
    
    .performance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .perf-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      border: 1px solid #4caf50;
    }
    
    .info-section {
      margin-top: 24px;
      padding: 20px;
      background: var(--bg-quaternary);
      border-radius: 12px;
      border-left: 4px solid var(--warning-color);
    }
    
    .info-section h4 {
      margin: 0 0 16px 0;
      color: #e65100;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .info-item ul {
      margin: 8px 0;
      padding-left: 20px;
    }
    
    .info-item li {
      margin-bottom: 4px;
      font-size: 0.9rem;
    }
    
    .label {
      font-weight: 600;
      color: #555;
    }
    
    .value {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #333;
    }
    
    .value.rate {
      font-size: 1.1rem;
      color: #1976d2;
    }
    
    .small {
      font-size: 0.85rem;
      line-height: 1.4;
      color: #666;
      margin: 8px 0;
    }
    
    @media (max-width: 768px) {
      .overview-grid {
        grid-template-columns: 1fr;
      }
      
      .performance-grid {
        grid-template-columns: 1fr;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .detail-row, .calc-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .yearly-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }
    }
  `]
})
export class ETFTaxBreakdownComponent implements OnInit, OnDestroy {
  etfTaxDetails: ETFTaxCalculation | null = null;
  currentInputs: Inputs | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private calc: CalculatorService,
    private etfTaxCalc: ETFTaxCalculatorService
  ) {}

  ngOnInit(): void {
    this.calc.inputsObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(inputs => {
        this.currentInputs = inputs;
        this.updateETFTaxCalculation();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateETFTaxCalculation(): void {
    if (!this.currentInputs) return;
    
    const result = this.calc.immoVsEtf();
    this.etfTaxDetails = result.etf_tax_details || null;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getTaxRateOnGains(): number {
    if (!this.etfTaxDetails || this.etfTaxDetails.totalCapitalGains === 0) {
      return 0;
    }
    return (this.etfTaxDetails.totalTaxes / this.etfTaxDetails.totalCapitalGains) * 100;
  }

  getPartialExemptionRates(): { [key: string]: number } {
    return this.etfTaxCalc.getPartialExemptionRates();
  }

  trackByYear(index: number, item: any): number {
    return item.year;
  }

  trackByKey(index: number, item: any): string {
    return item.key;
  }
}