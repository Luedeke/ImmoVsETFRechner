import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorService } from '../services/calculator.service';
import { AfACalculatorService, AfARule } from '../services/afa-calculator.service';
import { Subject, takeUntil } from 'rxjs';
import { Inputs } from '../models/inputs.model';

@Component({
  selector: 'app-afa-info',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" *ngIf="afaInfo">
      <h3>📋 AfA-Berechnung (Abschreibung für Abnutzung)</h3>
      
      <div class="afa-overview">
        <div class="main-info">
          <div class="afa-rate-display">
            <span class="rate-value">{{ afaInfo.currentRule.rate }}%</span>
            <span class="rate-description">{{ afaInfo.currentRule.description }}</span>
          </div>
          <div class="building-details">
            <div class="detail-item">
              <span class="label">Baujahr:</span>
              <span class="value">{{ currentInputs?.baujahr }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Gebäudealter:</span>
              <span class="value">{{ afaInfo.buildingAge }} Jahre</span>
            </div>
            <div class="detail-item">
              <span class="label">Abschreibungsdauer:</span>
              <span class="value">{{ getDepreciationYears() }} Jahre</span>
            </div>
          </div>
        </div>
        
        <div class="calculation-preview" *ngIf="currentInputs">
          <h4>💰 Jährliche Abschreibung</h4>
          <div class="calc-details">
            <div class="calc-row">
              <span class="label">Gebäudewert ({{ currentInputs.anteil_gebaeude_pct }}% von {{ formatCurrency(currentInputs.kaufpreis) }}):</span>
              <span class="value">{{ formatCurrency(getBuildingValue()) }}</span>
            </div>
            <div class="calc-row">
              <span class="label">AfA-Rate:</span>
              <span class="value">{{ afaInfo.currentRule.rate }}%</span>
            </div>
            <div class="calc-row total">
              <span class="label">Jährliche AfA:</span>
              <span class="value">{{ formatCurrency(getAnnualAfA()) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rule-explanation">
        <div class="rule-details">
          <h4>📚 Gesetzliche Grundlage</h4>
          <p class="rule-text">{{ afaInfo.currentRule.details }}</p>
          
          <div class="rule-history" *ngIf="isSpecialRate()">
            <div class="highlight-box">
              <strong>ℹ️ Besonderheit:</strong>
              <span *ngIf="afaInfo.currentRule.rate === 2.5">
                Für Altbauten vor 1925 gilt ein erhöhter AfA-Satz von 2,5% über 40 Jahre.
              </span>
              <span *ngIf="afaInfo.currentRule.rate === 3.0">
                Erhöhte AfA für Neubauten: Befristet bis 2029 gilt für neue Gebäude ein Satz von 3%.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="special-options" *ngIf="afaInfo.specialOptions.length > 0">
        <h4>⭐ Mögliche Sonderabschreibungen</h4>
        <div class="options-grid">
          <div class="option-card" *ngFor="let option of afaInfo.specialOptions">
            <div class="option-content">
              <span class="option-text">{{ option }}</span>
            </div>
          </div>
        </div>
        <div class="disclaimer">
          <small>
            <strong>Hinweis:</strong> Sonderabschreibungen sind nur unter bestimmten Voraussetzungen möglich 
            und erfordern entsprechende Nachweise. Bitte konsultieren Sie einen Steuerberater.
          </small>
        </div>
      </div>

      <div class="comparison-info" *ngIf="showComparison()">
        <h4>📊 AfA-Vergleich nach Baujahr</h4>
        <div class="comparison-table">
          <div class="comparison-row header">
            <span>Zeitraum</span>
            <span>AfA-Satz</span>
            <span>Dauer</span>
            <span>Beschreibung</span>
          </div>
          <div class="comparison-row" *ngFor="let rule of getAllRules()" 
               [class.current]="rule.rate === afaInfo.currentRule.rate">
            <span>{{ getYearRange(rule) }}</span>
            <span>{{ rule.rate }}%</span>
            <span>{{ getDepreciationYearsForRate(rule.rate) }} Jahre</span>
            <span>{{ rule.description }}</span>
          </div>
        </div>
      </div>

      <div class="tax-benefit-info">
        <h4>💡 Steuerlicher Nutzen</h4>
        <div class="benefit-explanation">
          <p>
            Die AfA reduziert Ihr zu versteuerndes Einkommen aus Vermietung und Verpachtung. 
            Bei einem Grenzsteuersatz von <strong>{{ getEffectiveTaxRate() }}%</strong> entspricht 
            dies einer jährlichen Steuerersparnis von ca. 
            <strong>{{ formatCurrency(getTaxBenefit()) }}</strong>.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .afa-overview {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .main-info {
      padding: 20px;
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border-radius: 12px;
      border: 2px solid #2196f3;
    }
    
    .afa-rate-display {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .rate-value {
      display: block;
      font-size: 3rem;
      font-weight: 700;
      color: #1565c0;
      line-height: 1;
    }
    
    .rate-description {
      display: block;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1976d2;
      margin-top: 8px;
    }
    
    .building-details {
      border-top: 1px solid rgba(25, 118, 210, 0.3);
      padding-top: 16px;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding: 4px 0;
    }
    
    .calculation-preview {
      padding: 20px;
      background: linear-gradient(135deg, #f3e5f5, #e1bee7);
      border-radius: 12px;
      border: 2px solid #9c27b0;
    }
    
    .calculation-preview h4 {
      margin: 0 0 16px 0;
      color: #7b1fa2;
    }
    
    .calc-details {
      background: rgba(255, 255, 255, 0.8);
      padding: 16px;
      border-radius: 8px;
    }
    
    .calc-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .calc-row.total {
      border-bottom: none;
      border-top: 2px solid #9c27b0;
      margin-top: 12px;
      padding-top: 12px;
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .rule-explanation {
      margin-bottom: 24px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #1976d2;
    }
    
    .rule-explanation h4 {
      margin: 0 0 16px 0;
      color: #1565c0;
    }
    
    .rule-text {
      margin: 0 0 16px 0;
      line-height: 1.6;
      color: #555;
    }
    
    .highlight-box {
      padding: 16px;
      background: linear-gradient(135deg, #fff3e0, #ffe0b2);
      border-radius: 8px;
      border: 2px solid #ff9800;
    }
    
    .special-options {
      margin-bottom: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
      border-radius: 12px;
      border: 2px solid #4caf50;
    }
    
    .special-options h4 {
      margin: 0 0 16px 0;
      color: #2e7d32;
    }
    
    .options-grid {
      display: grid;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .option-card {
      padding: 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      border: 1px solid #4caf50;
    }
    
    .option-text {
      font-size: 0.9rem;
      line-height: 1.4;
      color: #333;
    }
    
    .disclaimer {
      padding: 12px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 6px;
      border-left: 3px solid #ff9800;
    }
    
    .comparison-info {
      margin-bottom: 24px;
    }
    
    .comparison-info h4 {
      margin-bottom: 16px;
      color: #333;
    }
    
    .comparison-table {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #ddd;
    }
    
    .comparison-row {
      display: grid;
      grid-template-columns: 1fr 80px 80px 2fr;
      gap: 16px;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }
    
    .comparison-row.header {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }
    
    .comparison-row.current {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      font-weight: 600;
      border-left: 4px solid #2196f3;
    }
    
    .tax-benefit-info {
      padding: 20px;
      background: #fff3e0;
      border-radius: 12px;
      border-left: 4px solid #ff9800;
    }
    
    .tax-benefit-info h4 {
      margin: 0 0 12px 0;
      color: #e65100;
    }
    
    .benefit-explanation p {
      margin: 0;
      line-height: 1.6;
      color: #555;
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
    
    @media (max-width: 768px) {
      .afa-overview {
        grid-template-columns: 1fr;
      }
      
      .comparison-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      .comparison-row span {
        padding: 4px 0;
      }
      
      .calc-row, .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class AfAInfoComponent implements OnInit, OnDestroy {
  afaInfo: any = null;
  currentInputs: Inputs | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private calc: CalculatorService,
    private afaCalc: AfACalculatorService
  ) {}

  ngOnInit(): void {
    this.calc.inputsObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(inputs => {
        this.currentInputs = inputs;
        this.updateAfAInfo();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateAfAInfo(): void {
    if (!this.currentInputs) return;
    this.afaInfo = this.calc.getAfAInfo();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getBuildingValue(): number {
    if (!this.currentInputs) return 0;
    return this.currentInputs.kaufpreis * (this.currentInputs.anteil_gebaeude_pct / 100);
  }

  getAnnualAfA(): number {
    if (!this.currentInputs || !this.afaInfo) return 0;
    return this.getBuildingValue() * (this.afaInfo.currentRule.rate / 100);
  }

  getDepreciationYears(): number {
    if (!this.afaInfo) return 50;
    return this.getDepreciationYearsForRate(this.afaInfo.currentRule.rate);
  }

  getDepreciationYearsForRate(rate: number): number {
    switch (rate) {
      case 2.5: return 40;
      case 2.0: return 50;
      case 3.0: return 33;
      default: return 50;
    }
  }

  isSpecialRate(): boolean {
    return this.afaInfo && (this.afaInfo.currentRule.rate === 2.5 || this.afaInfo.currentRule.rate === 3.0);
  }

  showComparison(): boolean {
    return true; // Always show comparison for educational purposes
  }

  getAllRules(): AfARule[] {
    return this.afaCalc.getAllAfARules();
  }

  getYearRange(rule: AfARule): string {
    if (rule.yearFrom === 0) return 'vor 1925';
    if (rule.yearTo === 9999) return `ab ${rule.yearFrom}`;
    return `${rule.yearFrom}-${rule.yearTo}`;
  }

  getEffectiveTaxRate(): string {
    if (!this.currentInputs) return '0';
    const annualCalc = this.calc.calcAnnual();
    const taxRateRow = annualCalc.find(row => row.key === 'Effektiver Steuersatz (%)');
    return taxRateRow ? taxRateRow.value.toFixed(1) : '0';
  }

  getTaxBenefit(): number {
    if (!this.currentInputs) return 0;
    const annualAfA = this.getAnnualAfA();
    const taxRate = parseFloat(this.getEffectiveTaxRate()) / 100;
    return annualAfA * taxRate;
  }
}