import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CalculatorService } from '../services/calculator.service';
import { TaxCalculatorService } from '../services/tax-calculator.service';
import { defaultInputs, Inputs } from '../models/inputs.model';
import { TaxInfo } from '../models/interfaces';
import { TOOLTIP_TEXTS } from '../models/tooltip-texts';
import { TooltipComponent } from './tooltip.component';
import { Subject, takeUntil, combineLatest } from 'rxjs';

@Component({
  selector: 'app-inputs-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
  template: `
    <div class="card">
      <h3>Eingabe-Parameter</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        
        <!-- Grunddaten -->
        <div class="form-section">
          <h4>Grunddaten</h4>
          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Kaufpreis (€)<app-tooltip [text]="tooltips.kaufpreis"></app-tooltip></label>
                <input type="number" formControlName="kaufpreis" step="1000" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Wohnfläche (qm)<app-tooltip [text]="tooltips.wohnflaeche_qm"></app-tooltip></label>
                <input type="number" formControlName="wohnflaeche_qm" step="1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Miete / qm / Monat (€)<app-tooltip [text]="tooltips.miete_pro_qm_monat"></app-tooltip></label>
                <input type="number" formControlName="miete_pro_qm_monat" step="0.5" />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Gebäudeanteil (%)<app-tooltip [text]="tooltips.anteil_gebaeude_pct"></app-tooltip></label>
                <input type="number" formControlName="anteil_gebaeude_pct" step="1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>AfA-Rate (%)<app-tooltip [text]="tooltips.afa_rate_pct"></app-tooltip></label>
                <input type="number" formControlName="afa_rate_pct" step="0.1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Baujahr<app-tooltip [text]="tooltips.baujahr"></app-tooltip></label>
                <input type="number" formControlName="baujahr" step="1" />
              </div>
            </div>
          </div>
        </div>

        <!-- Kaufnebenkosten -->
        <div class="form-section">
          <h4>Kaufnebenkosten</h4>
          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Grunderwerbsteuer (%)<app-tooltip [text]="tooltips.grunderwerbsteuer_pct"></app-tooltip></label>
                <input type="number" formControlName="grunderwerbsteuer_pct" step="0.1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Notar & Grundbuch (%)<app-tooltip [text]="tooltips.notar_grundbuch_pct"></app-tooltip></label>
                <input type="number" formControlName="notar_grundbuch_pct" step="0.1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Makler (%)<app-tooltip [text]="tooltips.makler_pct"></app-tooltip></label>
                <input type="number" formControlName="makler_pct" step="0.1" />
              </div>
            </div>
          </div>
        </div>

        <!-- Finanzierung -->
        <div class="form-section">
          <h4>Finanzierung</h4>
          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Eigenkapital (€)<app-tooltip [text]="tooltips.eigenkapital"></app-tooltip></label>
                <input type="number" formControlName="eigenkapital" step="1000" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Zinssatz (%)<app-tooltip [text]="tooltips.zins_pct"></app-tooltip></label>
                <input type="number" formControlName="zins_pct" step="0.1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Tilgung (%)<app-tooltip [text]="tooltips.tilgung_pct"></app-tooltip></label>
                <input type="number" formControlName="tilgung_pct" step="0.1" />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Zinsbindung (Jahre)<app-tooltip [text]="tooltips.zinsbindung_jahre"></app-tooltip></label>
                <input type="number" formControlName="zinsbindung_jahre" step="1" />
              </div>
            </div>
            <div class="col"></div>
            <div class="col"></div>
          </div>
        </div>

        <!-- Betriebskosten -->
        <div class="form-section">
          <h4>Betriebskosten</h4>
          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Rücklagen (€/qm/Jahr)<app-tooltip [text]="tooltips.ruecklagen_eur_pro_qm_jahr"></app-tooltip></label>
                <input type="number" formControlName="ruecklagen_eur_pro_qm_jahr" step="1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Betriebskosten (% der Miete)<app-tooltip [text]="tooltips.betriebskosten_pct_von_miete"></app-tooltip></label>
                <input type="number" formControlName="betriebskosten_pct_von_miete" step="1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Leerstand (%)<app-tooltip [text]="tooltips.vacancy_pct"></app-tooltip></label>
                <input type="number" formControlName="vacancy_pct" step="0.5" />
              </div>
            </div>
          </div>
        </div>

        <!-- Steuern -->
        <div class="form-section">
          <h4>Steuerdaten</h4>
          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Jahresbruttoeinkommen (€)<app-tooltip [text]="tooltips.jahreseinkommen_brutto"></app-tooltip></label>
                <input type="number" formControlName="jahreseinkommen_brutto" step="1000" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Dynamische Steuerberechnung<app-tooltip [text]="tooltips.use_dynamic_tax"></app-tooltip></label>
                <div class="checkbox-group">
                  <input type="checkbox" id="use_dynamic_tax" formControlName="use_dynamic_tax" />
                  <label for="use_dynamic_tax">Automatisch berechnen</label>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Kirchensteuer<app-tooltip [text]="tooltips.kirchensteuer"></app-tooltip></label>
                <div class="checkbox-group">
                  <input type="checkbox" id="kirchensteuer" formControlName="kirchensteuer" />
                  <label for="kirchensteuer">Kirchensteuerpflichtig</label>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Steuersatz (%) {{ getTaxRateLabel() }}<app-tooltip [text]="tooltips.steuersatz_pct"></app-tooltip></label>
                <input type="number" 
                       formControlName="steuersatz_pct" 
                       step="0.1" 
                       [readonly]="form.get('use_dynamic_tax')?.value"
                       [class.readonly]="form.get('use_dynamic_tax')?.value" />
              </div>
            </div>
            <div class="col">
              <div class="tax-info" *ngIf="currentTaxInfo">
                <div class="small">
                  <strong>{{ currentTaxInfo.description }}</strong><br>
                  <span>Grenzsteuersatz: {{ currentTaxInfo.marginalRate }}%</span><br>
                  <span>Ø-Steuersatz: {{ currentTaxInfo.averageRate }}%</span>
                </div>
              </div>
            </div>
            <div class="col"></div>
          </div>
        </div>

        <!-- Wertentwicklung -->
        <div class="form-section">
          <h4>Wertentwicklung & Vergleich</h4>
          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Wertsteigerung (% p.a.)<app-tooltip [text]="tooltips.wertsteigerung_pct"></app-tooltip></label>
                <input type="number" formControlName="wertsteigerung_pct" step="0.1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Mietsteigerung (% p.a.)<app-tooltip [text]="tooltips.mietsteigerung_pct"></app-tooltip></label>
                <input type="number" formControlName="mietsteigerung_pct" step="0.1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>Haltedauer (Jahre)<app-tooltip [text]="tooltips.haltejahre"></app-tooltip></label>
                <input type="number" formControlName="haltejahre" step="1" />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <div class="input-group">
                <label>Verkaufskosten (%)<app-tooltip [text]="tooltips.verkaufskosten_pct"></app-tooltip></label>
                <input type="number" formControlName="verkaufskosten_pct" step="0.1" />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <label>ETF-Rendite (% p.a.)<app-tooltip [text]="tooltips.etf_rendite_pct"></app-tooltip></label>
                <input type="number" formControlName="etf_rendite_pct" step="0.1" />
              </div>
            </div>
            <div class="col"></div>
          </div>
        </div>

        <div class="button-group">
          <button type="submit" [disabled]="!form.valid">Berechnen</button>
          <button type="button" class="secondary" (click)="reset()">Zurücksetzen</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-section {
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .form-section h4 {
      margin: 0 0 16px 0;
      color: #495057;
      font-size: 1.1rem;
    }
    
    .input-group label {
      font-size: 0.9rem;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .checkbox-group input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
    
    .checkbox-group label {
      margin: 0;
      font-weight: normal;
    }
    
    .readonly {
      background-color: #f8f9fa;
      cursor: not-allowed;
    }
    
    .tax-info {
      padding: 12px;
      background: #e3f2fd;
      border-radius: 6px;
      border-left: 3px solid #1976d2;
    }
    
    /* Enhanced mobile form layout */
    @media (max-width: 480px) {
      .form-section {
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 6px;
      }
      
      .form-section h4 {
        font-size: 1rem;
        margin-bottom: 12px;
        text-align: center;
        padding: 8px;
        background: rgba(25, 118, 210, 0.1);
        border-radius: 4px;
        margin: -12px -12px 12px -12px;
      }
      
      .row {
        flex-direction: column;
        gap: 12px;
      }
      
      .col {
        min-width: auto;
      }
      
      .input-group {
        margin-bottom: 12px;
      }
      
      .input-group label {
        font-size: 0.85rem;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      input[type="number"], input[type="text"], select {
        padding: 12px;
        font-size: 16px; /* Prevents zoom on iOS */
        border-radius: 6px;
        border: 2px solid #ddd;
        transition: all 0.2s ease;
      }
      
      input:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        transform: scale(1.02);
      }
      
      .checkbox-group {
        background: #f8f9fa;
        padding: 8px 12px;
        border-radius: 6px;
        margin-top: 4px;
      }
      
      .checkbox-group input[type="checkbox"] {
        transform: scale(1.2);
      }
      
      .button-group {
        margin-top: 16px;
        gap: 8px;
      }
      
      button {
        padding: 14px 20px;
        font-size: 14px;
        border-radius: 8px;
        min-height: 48px; /* Touch-friendly */
      }
      
      .tax-info {
        margin-top: 12px;
        padding: 10px;
        font-size: 0.85rem;
      }
    }
    
    @media (max-width: 768px) and (min-width: 481px) {
      .form-section {
        padding: 16px;
      }
      
      .form-section h4 {
        font-size: 1.05rem;
        text-align: center;
        padding: 6px;
        background: rgba(25, 118, 210, 0.05);
        border-radius: 4px;
        margin: -16px -16px 16px -16px;
      }
      
      input[type="number"], input[type="text"], select {
        font-size: 15px;
        padding: 10px;
      }
      
      button {
        min-width: 120px;
        padding: 12px 18px;
      }
    }
    
    /* Touch-friendly improvements for all mobile sizes */
    @media (max-width: 768px) {
      /* Larger touch targets */
      input[type="checkbox"] {
        min-width: 20px;
        min-height: 20px;
      }
      
      label {
        cursor: pointer;
        padding: 4px 0;
      }
      
      /* Better visual feedback */
      button:active {
        transform: translateY(1px) !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
      }
      
      input:invalid {
        border-color: #f44336;
        background-color: #ffebee;
      }
      
      input:valid {
        border-color: #4caf50;
      }
    }
  `]
})
export class InputsFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentTaxInfo: TaxInfo | null = null;
  readonly tooltips = TOOLTIP_TEXTS;
  
  form = new FormGroup({
    kaufpreis: new FormControl<number>(defaultInputs.kaufpreis, [Validators.required, Validators.min(1000)]),
    wohnflaeche_qm: new FormControl<number>(defaultInputs.wohnflaeche_qm, [Validators.required, Validators.min(1)]),
    miete_pro_qm_monat: new FormControl<number>(defaultInputs.miete_pro_qm_monat, [Validators.required, Validators.min(0.1)]),
    anteil_gebaeude_pct: new FormControl<number>(defaultInputs.anteil_gebaeude_pct, [Validators.required, Validators.min(0), Validators.max(100)]),
    afa_rate_pct: new FormControl<number>(defaultInputs.afa_rate_pct, [Validators.required, Validators.min(0), Validators.max(10)]),
    baujahr: new FormControl<number>(defaultInputs.baujahr, [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]),
    grunderwerbsteuer_pct: new FormControl<number>(defaultInputs.grunderwerbsteuer_pct, [Validators.required, Validators.min(0), Validators.max(20)]),
    notar_grundbuch_pct: new FormControl<number>(defaultInputs.notar_grundbuch_pct, [Validators.required, Validators.min(0), Validators.max(10)]),
    makler_pct: new FormControl<number>(defaultInputs.makler_pct, [Validators.required, Validators.min(0), Validators.max(10)]),
    eigenkapital: new FormControl<number>(defaultInputs.eigenkapital, [Validators.required, Validators.min(0)]),
    zins_pct: new FormControl<number>(defaultInputs.zins_pct, [Validators.required, Validators.min(0), Validators.max(20)]),
    tilgung_pct: new FormControl<number>(defaultInputs.tilgung_pct, [Validators.required, Validators.min(0), Validators.max(20)]),
    zinsbindung_jahre: new FormControl<number>(defaultInputs.zinsbindung_jahre, [Validators.required, Validators.min(1), Validators.max(30)]),
    ruecklagen_eur_pro_qm_jahr: new FormControl<number>(defaultInputs.ruecklagen_eur_pro_qm_jahr, [Validators.required, Validators.min(0)]),
    betriebskosten_pct_von_miete: new FormControl<number>(defaultInputs.betriebskosten_pct_von_miete, [Validators.required, Validators.min(0), Validators.max(100)]),
    vacancy_pct: new FormControl<number>(defaultInputs.vacancy_pct, [Validators.required, Validators.min(0), Validators.max(100)]),
    
    // Steuerdaten
    jahreseinkommen_brutto: new FormControl<number>(defaultInputs.jahreseinkommen_brutto, [Validators.required, Validators.min(0)]),
    kirchensteuer: new FormControl<boolean>(defaultInputs.kirchensteuer),
    steuersatz_pct: new FormControl<number>(defaultInputs.steuersatz_pct, [Validators.required, Validators.min(0), Validators.max(100)]),
    use_dynamic_tax: new FormControl<boolean>(defaultInputs.use_dynamic_tax),
    
    wertsteigerung_pct: new FormControl<number>(defaultInputs.wertsteigerung_pct, [Validators.required, Validators.min(-10), Validators.max(20)]),
    mietsteigerung_pct: new FormControl<number>(defaultInputs.mietsteigerung_pct, [Validators.required, Validators.min(-10), Validators.max(20)]),
    haltejahre: new FormControl<number>(defaultInputs.haltejahre, [Validators.required, Validators.min(1), Validators.max(50)]),
    verkaufskosten_pct: new FormControl<number>(defaultInputs.verkaufskosten_pct, [Validators.required, Validators.min(0), Validators.max(20)]),
    etf_rendite_pct: new FormControl<number>(defaultInputs.etf_rendite_pct, [Validators.required, Validators.min(-10), Validators.max(30)])
  });

  constructor(private calc: CalculatorService, private taxCalc: TaxCalculatorService) {}

  ngOnInit(): void {
    this.calc.inputsObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(inputs => {
        this.form.patchValue(inputs, { emitEvent: false });
      });

    // Watch for changes in income or tax settings
    combineLatest([
      this.form.get('jahreseinkommen_brutto')!.valueChanges,
      this.form.get('kirchensteuer')!.valueChanges,
      this.form.get('use_dynamic_tax')!.valueChanges
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.updateTaxRate();
    });

    // Initial tax rate calculation
    this.updateTaxRate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value as Inputs;
      this.calc.setInputs(formValue);
    }
  }

  reset(): void {
    this.form.reset(defaultInputs);
    this.calc.setInputs(defaultInputs);
    this.updateTaxRate();
  }

  private updateTaxRate(): void {
    const income = this.form.get('jahreseinkommen_brutto')?.value || 0;
    const churchTax = this.form.get('kirchensteuer')?.value || false;
    const useDynamicTax = this.form.get('use_dynamic_tax')?.value || false;

    if (useDynamicTax && income > 0) {
      const taxResult = this.taxCalc.calculateIncomeTax(income, churchTax);
      const effectiveRate = this.taxCalc.getEffectiveTaxRateForRealEstate(income, churchTax);
      
      // Update the form control without triggering validation
      this.form.get('steuersatz_pct')?.setValue(effectiveRate, { emitEvent: false });
      
      // Update tax info display
      this.currentTaxInfo = {
        description: this.getTaxBracketDescription(income),
        marginalRate: taxResult.marginalTaxRate.toFixed(1),
        averageRate: taxResult.averageTaxRate.toFixed(1)
      };
    } else {
      this.currentTaxInfo = null;
    }
  }

  private getTaxBracketDescription(income: number): string {
    const bracket = this.taxCalc.getTaxBracketInfo(income);
    return bracket ? bracket.description : 'Unbekannte Steuerstufe';
  }

  getTaxRateLabel(): string {
    const useDynamicTax = this.form.get('use_dynamic_tax')?.value;
    return useDynamicTax ? '(automatisch berechnet)' : '(manuell)';
  }
}