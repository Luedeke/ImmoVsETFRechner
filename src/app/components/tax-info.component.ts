import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorService } from '../services/calculator.service';
import { TaxCalculatorService, TaxCalculationResult, RealEstateTaxBenefit } from '../services/tax-calculator.service';
import { Subject, takeUntil } from 'rxjs';
import { Inputs } from '../models/inputs.model';

@Component({
  selector: 'app-tax-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" *ngIf="showTaxInfo">
      <h3>💰 Steuerberechnung</h3>
      
      <div class="tax-overview" *ngIf="taxResult">
        <div class="row">
          <div class="col">
            <div class="tax-item">
              <span class="label">Brutto-Jahreseinkommen:</span>
              <span class="value">{{ formatCurrency(taxResult.grossIncome) }}</span>
            </div>
          </div>
          <div class="col">
            <div class="tax-item">
              <span class="label">Zu versteuerndes Einkommen:</span>
              <span class="value">{{ formatCurrency(taxResult.taxableIncome) }}</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div class="tax-item highlight">
              <span class="label">Grenzsteuersatz:</span>
              <span class="value rate">{{ taxResult.marginalTaxRate.toFixed(1) }}%</span>
            </div>
          </div>
          <div class="col">
            <div class="tax-item">
              <span class="label">Durchschnittssteuersatz:</span>
              <span class="value rate">{{ taxResult.averageTaxRate.toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div class="tax-item">
              <span class="label">Einkommensteuer:</span>
              <span class="value">{{ formatCurrency(taxResult.totalTax - taxResult.solidarityTax - taxResult.churchTax) }}</span>
            </div>
          </div>
          <div class="col">
            <div class="tax-item" *ngIf="taxResult.solidarityTax > 0">
              <span class="label">Solidaritätszuschlag:</span>
              <span class="value">{{ formatCurrency(taxResult.solidarityTax) }}</span>
            </div>
            <div class="tax-item" *ngIf="taxResult.churchTax > 0">
              <span class="label">Kirchensteuer:</span>
              <span class="value">{{ formatCurrency(taxResult.churchTax) }}</span>
            </div>
          </div>
        </div>

        <div class="tax-summary">
          <div class="summary-item total">
            <span class="label">Gesamte Steuerlast:</span>
            <span class="value">{{ formatCurrency(taxResult.totalTax) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Netto-Jahreseinkommen:</span>
            <span class="value">{{ formatCurrency(taxResult.netIncome) }}</span>
          </div>
        </div>

        <div class="tax-bracket-info">
          <div class="bracket-badge" [class]="getBracketClass()">
            <strong>{{ getBracketDescription() }}</strong>
          </div>
          <div class="small">
            Für Immobilienberechnung wird der <strong>Grenzsteuersatz</strong> 
            {{ currentInputs?.kirchensteuer ? 'inklusive Kirchensteuer' : '' }}
            {{ currentInputs?.kirchensteuer && hasNonZeroSolidarity() ? ' und' : '' }}
            {{ hasNonZeroSolidarity() ? ' inklusive Solidaritätszuschlag' : '' }} verwendet.
          </div>
        </div>

        <!-- Steuervorteile bei Immobilienverlusten -->
        <div class="tax-loss-benefits" *ngIf="realEstateTaxBenefit">
          <h4>💰 Steuervorteile bei Immobilienverlusten</h4>
          
          <div class="benefit-comparison">
            <div class="comparison-row">
              <div class="comparison-item without-loss">
                <span class="label">Normale Steuerlast (nur Gehalt):</span>
                <span class="value">{{ formatCurrency(realEstateTaxBenefit.comparisonWithoutRealEstate.normalTax) }}</span>
              </div>
              <div class="comparison-item with-loss">
                <span class="label">Steuerlast mit Immobilienverlust:</span>
                <span class="value">{{ formatCurrency(realEstateTaxBenefit.comparisonWithoutRealEstate.taxWithRealEstateLoss) }}</span>
              </div>
            </div>
            
            <div class="tax-savings highlight">
              <span class="label">💡 Steuerersparnis durch Verlust:</span>
              <span class="value savings">{{ formatCurrency(realEstateTaxBenefit.taxSavingsFromLoss) }}</span>
            </div>
          </div>

          <div class="effective-loss-info">
            <div class="loss-breakdown">
              <div class="loss-item">
                <span class="label">Immobilienverlust (vor Steuern):</span>
                <span class="value negative">-{{ formatCurrency(realEstateTaxBenefit.annualRealEstateLoss) }}</span>
              </div>
              <div class="loss-item">
                <span class="label">Steuerersparnis:</span>
                <span class="value positive">+{{ formatCurrency(realEstateTaxBenefit.taxSavingsFromLoss) }}</span>
              </div>
              <div class="loss-item total">
                <span class="label">Effektiver Verlust (nach Steuern):</span>
                <span class="value">{{ formatCurrency(realEstateTaxBenefit.effectiveAfterTaxLoss) }}</span>
              </div>
            </div>
            
            <div class="monthly-benefit">
              <span class="small">
                Monatliche Steuerersparnis: <strong>{{ formatCurrency(realEstateTaxBenefit.monthlyTaxBenefit) }}</strong>
              </span>
            </div>
          </div>

          <div class="benefit-explanation">
            <div class="info-box">
              <strong>💡 Wie funktioniert das?</strong><br>
              <span class="small">
                Verluste aus Vermietung und Verpachtung können mit anderen Einkünften (z.B. Gehalt) 
                verrechnet werden. Dadurch reduziert sich Ihr zu versteuerndes Einkommen und Sie sparen 
                Steuern in Höhe Ihres Grenzsteuersatzes ({{ getTaxRate() }}%).
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="manual-tax-info" *ngIf="!showTaxInfo && currentInputs && !currentInputs.use_dynamic_tax">
        <div class="info-message">
          <span>📋 Manueller Steuersatz: <strong>{{ currentInputs.steuersatz_pct }}%</strong></span>
          <div class="small">Aktivieren Sie die "Dynamische Steuerberechnung" für eine detaillierte Analyse.</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tax-overview {
      margin-top: 16px;
    }
    
    .tax-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .tax-item.highlight {
      background: linear-gradient(135deg, #fff3e0, #ffe0b2);
      padding: 12px;
      border-radius: 8px;
      border: 2px solid #ff9800;
      border-bottom: 2px solid #ff9800;
      margin: 8px 0;
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
    
    .tax-summary {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 2px solid #e0e0e0;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    
    .summary-item.total {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 1.1rem;
    }
    
    .summary-item.total .value {
      color: #dc3545;
      font-size: 1.2rem;
    }
    
    .tax-bracket-info {
      margin-top: 20px;
      text-align: center;
    }
    
    .bracket-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      margin-bottom: 12px;
      font-size: 0.9rem;
    }
    
    .bracket-badge.low {
      background: #e8f5e8;
      color: #2e7d32;
      border: 2px solid #4caf50;
    }
    
    .bracket-badge.medium {
      background: #fff3e0;
      color: #ef6c00;
      border: 2px solid #ff9800;
    }
    
    .bracket-badge.high {
      background: #ffebee;
      color: #c62828;
      border: 2px solid #f44336;
    }
    
    .manual-tax-info {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 16px;
    }
    
    .info-message {
      font-size: 1.1rem;
    }
    
    .small {
      font-size: 0.85rem;
      color: #666;
      line-height: 1.4;
    }
    
    /* Tax Loss Benefits Styles */
    .tax-loss-benefits {
      margin-top: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #f3e5f5, #e1bee7);
      border-radius: 12px;
      border: 2px solid #9c27b0;
    }
    
    .tax-loss-benefits h4 {
      margin: 0 0 16px 0;
      color: #7b1fa2;
      font-size: 1.2rem;
    }
    
    .benefit-comparison {
      margin-bottom: 20px;
    }
    
    .comparison-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .comparison-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
      border: 1px solid #d1c4e9;
    }
    
    .tax-savings {
      padding: 16px;
      background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
      border-radius: 10px;
      border: 2px solid #4caf50;
      text-align: center;
    }
    
    .tax-savings .value.savings {
      font-size: 1.3rem;
      color: #2e7d32;
      font-weight: 700;
    }
    
    .effective-loss-info {
      margin-bottom: 16px;
    }
    
    .loss-breakdown {
      background: rgba(255, 255, 255, 0.8);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    
    .loss-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .loss-item.total {
      border-bottom: none;
      border-top: 2px solid #9c27b0;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: 600;
    }
    
    .value.negative {
      color: #d32f2f;
      font-weight: 600;
    }
    
    .value.positive {
      color: #388e3c;
      font-weight: 600;
    }
    
    .monthly-benefit {
      text-align: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
    }
    
    .benefit-explanation {
      margin-top: 16px;
    }
    
    .info-box {
      padding: 16px;
      background: #fff3e0;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }
    
    @media (max-width: 768px) {
      .tax-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .summary-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class TaxInfoComponent implements OnInit, OnDestroy {
  taxResult: TaxCalculationResult | null = null;
  currentInputs: Inputs | null = null;
  realEstateTaxBenefit: RealEstateTaxBenefit | null = null;
  showTaxInfo = false;
  private destroy$ = new Subject<void>();

  constructor(
    private calc: CalculatorService,
    private taxCalc: TaxCalculatorService
  ) {}

  ngOnInit(): void {
    this.calc.inputsObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(inputs => {
        this.currentInputs = inputs;
        this.updateTaxCalculation(inputs);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTaxCalculation(inputs: Inputs): void {
    this.showTaxInfo = inputs.use_dynamic_tax && inputs.jahreseinkommen_brutto > 0;
    
    if (this.showTaxInfo) {
      this.taxResult = this.taxCalc.calculateIncomeTax(
        inputs.jahreseinkommen_brutto, 
        inputs.kirchensteuer
      );
      
      // Calculate real estate tax benefits if there's a loss
      const annualCalculation = this.calc.calcAnnual(inputs);
      const cashflowRow = annualCalculation.find(row => row.key === 'Cashflow nach Steuern (jährlich)');
      
      if (cashflowRow && cashflowRow.value < 0) {
        const realEstateLoss = Math.abs(cashflowRow.value);
        this.realEstateTaxBenefit = this.taxCalc.calculateRealEstateTaxBenefit(
          inputs.jahreseinkommen_brutto,
          realEstateLoss,
          inputs.kirchensteuer
        );
      } else {
        this.realEstateTaxBenefit = null;
      }
    } else {
      this.taxResult = null;
      this.realEstateTaxBenefit = null;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getBracketDescription(): string {
    if (!this.currentInputs) return '';
    const bracket = this.taxCalc.getTaxBracketInfo(this.currentInputs.jahreseinkommen_brutto);
    return bracket ? bracket.description : 'Unbekannte Steuerstufe';
  }

  getBracketClass(): string {
    if (!this.taxResult) return 'low';
    
    const marginalRate = this.taxResult.marginalTaxRate;
    if (marginalRate <= 24) return 'low';
    if (marginalRate <= 42) return 'medium';
    return 'high';
  }

  hasNonZeroSolidarity(): boolean {
    return this.taxResult ? this.taxResult.solidarityTax > 0 : false;
  }

  getTaxRate(): string {
    if (!this.currentInputs) return '0';
    return this.taxCalc.getEffectiveTaxRateForRealEstate(
      this.currentInputs.jahreseinkommen_brutto,
      this.currentInputs.kirchensteuer
    ).toFixed(1);
  }
}