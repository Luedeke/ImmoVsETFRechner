import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorService, ProjectionRow } from '../services/calculator.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-projection',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>{{ rows.length }}-Jahres-Projektion</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Jahr</th>
              <th>Mieteinnahmen</th>
              <th>Immobilienwert</th>
              <th>Restschuld</th>
              <th>Zinsaufwand</th>
              <th>Tilgung</th>
              <th>Cashflow</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows; trackBy: trackByYear"
                [class.final-year]="row.year === rows.length">
              <td class="year-col">{{ row.year }}</td>
              <td class="currency-col">{{ formatCurrency(row.mieteinnahmen) }}</td>
              <td class="currency-col">{{ formatCurrency(row.immobilienwert) }}</td>
              <td class="currency-col">{{ formatCurrency(row.restschuld) }}</td>
              <td class="currency-col">{{ formatCurrency(row.zinsaufwand) }}</td>
              <td class="currency-col">{{ formatCurrency(row.tilgung) }}</td>
              <td class="currency-col" [class.negative]="row.cashflow_nach_steuern < 0">
                {{ formatCurrency(row.cashflow_nach_steuern) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="summary-stats" *ngIf="rows.length > 0">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">Gesamter Cashflow:</span>
            <span class="stat-value" [class.negative]="getTotalCashflow() < 0">
              {{ formatCurrency(getTotalCashflow()) }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Ø Cashflow/Jahr:</span>
            <span class="stat-value" [class.negative]="getAverageCashflow() < 0">
              {{ formatCurrency(getAverageCashflow()) }}
            </span>
          </div>
        </div>
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">Finale Restschuld:</span>
            <span class="stat-value">{{ formatCurrency(getFinalDebt()) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Finaler Immobilienwert:</span>
            <span class="stat-value">{{ formatCurrency(getFinalValue()) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
      margin-top: 16px;
    }
    
    table {
      font-size: 0.85rem;
    }
    
    .year-col {
      width: 60px;
      text-align: center;
      font-weight: 600;
    }
    
    .currency-col {
      text-align: right;
      font-family: 'Courier New', monospace;
      white-space: nowrap;
      min-width: 90px;
    }
    
    .final-year {
      background: #e8f5e8 !important;
      font-weight: 600;
    }
    
    .final-year:hover {
      background: #d4edda !important;
    }
    
    .negative {
      color: #dc3545;
    }
    
    .summary-stats {
      margin-top: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .stat-row {
      display: flex;
      gap: 32px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      min-width: 250px;
      padding: 8px 0;
    }
    
    .stat-label {
      font-weight: 600;
      color: #495057;
    }
    
    .stat-value {
      font-family: 'Courier New', monospace;
      font-weight: 700;
    }
    
    @media (max-width: 768px) {
      table {
        font-size: 0.75rem;
      }
      
      .currency-col {
        min-width: 70px;
      }
      
      .stat-row {
        flex-direction: column;
        gap: 0;
      }
      
      .stat-item {
        min-width: auto;
      }
    }
  `]
})
export class ProjectionComponent implements OnInit, OnDestroy {
  rows: ProjectionRow[] = [];
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
    this.rows = this.calc.projection();
    this.cdr.markForCheck();
  }

  trackByYear(index: number, item: ProjectionRow): number {
    return item.year;
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

  getTotalCashflow(): number {
    return this.rows.reduce((sum, row) => sum + row.cashflow_nach_steuern, 0);
  }

  getAverageCashflow(): number {
    if (this.rows.length === 0) return 0;
    return this.getTotalCashflow() / this.rows.length;
  }

  getFinalDebt(): number {
    if (this.rows.length === 0) return 0;
    return this.rows[this.rows.length - 1].restschuld;
  }

  getFinalValue(): number {
    if (this.rows.length === 0) return 0;
    return this.rows[this.rows.length - 1].immobilienwert;
  }
}