import { Component } from '@angular/core';
import { InputsFormComponent } from './components/inputs-form.component';
import { CalcAnnualComponent } from './components/calc-annual.component';
import { ProjectionComponent } from './components/projection.component';
import { ImmoVsEtfComponent } from './components/immo-vs-etf.component';
import { TaxInfoComponent } from './components/tax-info.component';
import { ETFTaxBreakdownComponent } from './components/etf-tax-breakdown.component';
import { AfAInfoComponent } from './components/afa-info.component';
import { ComparisonChartComponent } from './components/comparison-chart.component';
import { CashflowChartComponent } from './components/cashflow-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [InputsFormComponent, CalcAnnualComponent, ProjectionComponent, ImmoVsEtfComponent, TaxInfoComponent, ETFTaxBreakdownComponent, AfAInfoComponent, ComparisonChartComponent, CashflowChartComponent],
  template: `
    <div class="container">
      <header class="header">
        <h1>🏠 ImmoRechner</h1>
        <p class="subtitle">Immobilieninvestment vs. ETF Vergleichsrechner</p>
      </header>
      
      <app-inputs-form></app-inputs-form>
      
      <div class="results-section">
        <app-tax-info></app-tax-info>
        
        <app-afa-info></app-afa-info>
        
        <div class="row">
          <div class="col">
            <app-calc-annual></app-calc-annual>
          </div>
          <div class="col">
            <app-immo-vs-etf></app-immo-vs-etf>
          </div>
        </div>
        
        <app-etf-tax-breakdown></app-etf-tax-breakdown>
        
        <app-comparison-chart></app-comparison-chart>
        
        <app-cashflow-chart></app-cashflow-chart>
        
        <app-projection></app-projection>
      </div>
    </div>
  `,
  styles: [`
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding: 24px 0;
      background: linear-gradient(135deg, #1976d2, #1565c0);
      border-radius: 12px;
      color: white;
      margin-top: 16px;
    }
    
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 300;
    }
    
    .subtitle {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }
    
    .results-section {
      margin-top: 24px;
    }
    
    /* Enhanced responsive header and layout */
    @media (max-width: 480px) {
      .header {
        margin-bottom: 20px;
        margin-top: 8px;
        padding: 16px 12px;
        border-radius: 8px;
      }
      
      .header h1 {
        font-size: 1.8rem;
        margin-bottom: 4px;
        font-weight: 400;
      }
      
      .subtitle {
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .results-section {
        margin-top: 16px;
      }
      
      /* Improved row layout for mobile */
      .row {
        flex-direction: column;
        gap: 12px;
      }
      
      .col {
        min-width: auto;
      }
    }
    
    @media (max-width: 768px) and (min-width: 481px) {
      .header {
        margin-bottom: 24px;
        padding: 20px 16px;
        border-radius: 10px;
      }
      
      .header h1 {
        font-size: 2.1rem;
        font-weight: 350;
      }
      
      .subtitle {
        font-size: 1rem;
      }
      
      .results-section {
        margin-top: 20px;
      }
    }
    
    @media (max-width: 1024px) and (min-width: 769px) {
      .header h1 {
        font-size: 2.3rem;
      }
      
      .subtitle {
        font-size: 1.05rem;
      }
    }
    
    /* Large screen optimizations */
    @media (min-width: 1400px) {
      .header {
        padding: 32px 0;
        margin-bottom: 40px;
      }
      
      .header h1 {
        font-size: 3rem;
      }
      
      .subtitle {
        font-size: 1.2rem;
      }
      
      .results-section {
        margin-top: 32px;
      }
    }
  `]
})
export class AppComponent {}
