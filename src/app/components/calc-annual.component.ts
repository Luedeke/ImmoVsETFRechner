import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorService, AnnualCalcRow } from '../services/calculator.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-calc-annual',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>Jahresübersicht</h3>
      <div class="table-container">
        <table>
          <tbody>
            <tr *ngFor="let row of rows; trackBy: trackByKey" 
                [class.highlight-row]="isHighlightRow(row.key)">
              <td class="label-col">{{ row.key }}</td>
              <td class="value-col">{{ formatValue(row.value) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="summary" *ngIf="getCashflowRow()">
        <div class="highlight">
          <strong>{{ getCashflowRow()?.key }}: {{ formatValue(getCashflowRow()?.value || 0) }}</strong>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
      margin-top: 16px;
    }
    
    .label-col {
      width: 70%;
      font-weight: 500;
    }
    
    .value-col {
      width: 30%;
      text-align: right;
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
    
    .highlight-row {
      background: #e3f2fd !important;
      font-weight: 600;
    }
    
    .highlight-row:hover {
      background: #bbdefb !important;
    }
    
    .summary {
      margin-top: 20px;
    }
    
    .highlight strong {
      font-size: 1.1rem;
    }
    
    tr:has(.label-col:contains('Steuerersparnis durch Verlust')) {
      background: linear-gradient(135deg, #e8f5e8, #c8e6c9) !important;
      border-left: 4px solid #4caf50;
    }
    
    tr:has(.label-col:contains('Effektiver Cashflow')) {
      background: linear-gradient(135deg, #f3e5f5, #e1bee7) !important;
      border-left: 4px solid #9c27b0;
    }
  `]
})
export class CalcAnnualComponent implements OnInit, OnDestroy {
  rows: AnnualCalcRow[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly calc: CalculatorService,
    private readonly cdr: ChangeDetectorRef
  ) {}

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
    this.rows = this.calc.calcAnnual();
    this.cdr.markForCheck();
  }

  trackByKey(index: number, item: AnnualCalcRow): string {
    return item.key;
  }

  isHighlightRow(key: string): boolean {
    return key === 'Cashflow nach Steuern (jährlich)' || 
           key === 'Jährliche Mieteinnahmen (gesamt)' ||
           key === 'Darlehensbetrag' ||
           key === 'Steuerersparnis durch Verlust' ||
           key === 'Effektiver Cashflow (nach Steuerersparnis)';
  }

  getCashflowRow(): AnnualCalcRow | undefined {
    return this.rows.find(row => row.key === 'Cashflow nach Steuern (jährlich)');
  }

  formatValue(value: number): string {
    if (!value && value !== 0) return '0,00 €';
    
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}