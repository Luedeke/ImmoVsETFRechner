import { Injectable } from '@angular/core';

export interface ETFTaxCalculation {
  totalInvestment: number;
  totalGrossReturn: number;
  totalCapitalGains: number;
  
  // Jährliche Vorabpauschale
  annualAdvanceLumpSums: number[];
  totalAdvanceLumpSum: number;
  
  // Steuerberechnung
  taxableCapitalGains: number; // Nach Teilfreistellung
  capitalGainsTax: number;
  solidarityTax: number;
  churchTax: number;
  totalTaxes: number;
  
  // Netto-Ergebnis
  netReturn: number;
  effectiveReturnRate: number;
  
  // Details
  partialExemptionRate: number;
  partialExemptionAmount: number;
  taxDetails: {
    yearlyAdvanceLumpSums: Array<{
      year: number;
      lumpSum: number;
      taxOnLumpSum: number;
      remainingTaxCredit: number;
    }>;
    finalTaxCalculation: {
      totalGains: number;
      exemptAmount: number;
      taxableAmount: number;
      grossTax: number;
      advanceTaxCredit: number;
      finalTaxDue: number;
    };
  };
}

export interface ETFParameters {
  monthlyInvestment: number;
  investmentPeriodYears: number;
  expectedAnnualReturn: number; // Prozent
  etfType: 'accumulating' | 'distributing'; // Thesaurierend oder Ausschüttend
  partialExemptionRate: number; // Teilfreistellung in Prozent
  hasChurchTax: boolean;
}

@Injectable({ providedIn: 'root' })
export class ETFTaxCalculatorService {
  
  // Deutsche Steuersätze 2024
  private readonly capitalGainsTaxRate = 25; // Abgeltungsteuer
  private readonly solidarityTaxRate = 5.5; // Prozent der Kapitalertragsteuer
  private readonly churchTaxRate = 8; // Bayern/BW, andere Länder 9%
  private readonly basicAllowance = 1000; // Sparer-Freibetrag pro Person
  
  // Basiszins für Vorabpauschale (wird jährlich angepasst)
  private readonly baseInterestRate = 2.6; // 2024: 2,6%

  constructor() {}

  /**
   * Berechnet die Steuerlast für ETF-Investments nach deutschem Recht
   */
  calculateETFTaxes(params: ETFParameters): ETFTaxCalculation {
    const monthlyAmount = params.monthlyInvestment;
    const years = params.investmentPeriodYears;
    const annualReturn = params.expectedAnnualReturn / 100;
    const months = years * 12;
    
    // Gesamtinvestition
    const totalInvestment = monthlyAmount * months;
    
    // Bruttorendite berechnen (Zinseszinseffekt)
    const monthlyReturnRate = Math.pow(1 + annualReturn, 1/12) - 1;
    const totalGrossReturn = monthlyAmount * ((Math.pow(1 + monthlyReturnRate, months) - 1) / monthlyReturnRate);
    const totalCapitalGains = totalGrossReturn - totalInvestment;
    
    // Vorabpauschalen berechnen (nur für thesaurierende ETFs)
    const advanceLumpSumCalculation = this.calculateAdvanceLumpSums(
      params, totalInvestment, totalGrossReturn
    );
    
    // Teilfreistellung anwenden
    const partialExemptionAmount = totalCapitalGains * (params.partialExemptionRate / 100);
    const taxableCapitalGains = Math.max(0, totalCapitalGains - partialExemptionAmount - this.basicAllowance);
    
    // Steuern berechnen
    const capitalGainsTax = taxableCapitalGains * (this.capitalGainsTaxRate / 100);
    const solidarityTax = capitalGainsTax * (this.solidarityTaxRate / 100);
    const churchTax = params.hasChurchTax ? capitalGainsTax * (this.churchTaxRate / 100) : 0;
    
    // Vorabpauschale-Steuern
    const advanceTaxCredit = advanceLumpSumCalculation.totalTaxPaid;
    
    // Endgültige Steuerberechnung
    const grossFinalTax = capitalGainsTax + solidarityTax + churchTax;
    const finalTaxDue = Math.max(0, grossFinalTax - advanceTaxCredit);
    const totalTaxes = advanceTaxCredit + finalTaxDue;
    
    // Netto-Rendite
    const netReturn = totalGrossReturn - totalTaxes;
    const effectiveReturnRate = this.calculateEffectiveReturnRate(totalInvestment, netReturn, years);
    
    return {
      totalInvestment,
      totalGrossReturn,
      totalCapitalGains,
      annualAdvanceLumpSums: advanceLumpSumCalculation.yearlyLumpSums,
      totalAdvanceLumpSum: advanceLumpSumCalculation.totalLumpSum,
      taxableCapitalGains,
      capitalGainsTax,
      solidarityTax,
      churchTax,
      totalTaxes,
      netReturn,
      effectiveReturnRate,
      partialExemptionRate: params.partialExemptionRate,
      partialExemptionAmount,
      taxDetails: {
        yearlyAdvanceLumpSums: advanceLumpSumCalculation.yearlyDetails,
        finalTaxCalculation: {
          totalGains: totalCapitalGains,
          exemptAmount: partialExemptionAmount + this.basicAllowance,
          taxableAmount: taxableCapitalGains,
          grossTax: grossFinalTax,
          advanceTaxCredit,
          finalTaxDue
        }
      }
    };
  }

  /**
   * Berechnet die jährlichen Vorabpauschalen für thesaurierende ETFs
   */
  private calculateAdvanceLumpSums(
    params: ETFParameters, 
    totalInvestment: number, 
    totalGrossReturn: number
  ): {
    yearlyLumpSums: number[];
    totalLumpSum: number;
    totalTaxPaid: number;
    yearlyDetails: Array<{
      year: number;
      lumpSum: number;
      taxOnLumpSum: number;
      remainingTaxCredit: number;
    }>;
  } {
    const yearlyDetails: Array<{
      year: number;
      lumpSum: number;
      taxOnLumpSum: number;
      remainingTaxCredit: number;
    }> = [];
    
    let totalLumpSum = 0;
    let totalTaxPaid = 0;
    let remainingTaxCredit = 0;
    const yearlyLumpSums: number[] = [];
    
    // Nur für thesaurierende ETFs
    if (params.etfType === 'accumulating') {
      let currentValue = 0;
      const monthlyAmount = params.monthlyInvestment;
      const annualReturn = params.expectedAnnualReturn / 100;
      
      for (let year = 1; year <= params.investmentPeriodYears; year++) {
        // Vereinfachte Berechnung des ETF-Werts zum Jahresende
        const monthsInvested = year * 12;
        const monthlyReturnRate = Math.pow(1 + annualReturn, 1/12) - 1;
        currentValue = monthlyAmount * ((Math.pow(1 + monthlyReturnRate, monthsInvested) - 1) / monthlyReturnRate);
        
        // Vorabpauschale = 70% des Basiszinses auf den Wert zum Jahresbeginn
        const beginningValue = year === 1 ? 0 : 
          monthlyAmount * ((Math.pow(1 + monthlyReturnRate, (year-1) * 12) - 1) / monthlyReturnRate);
        
        const lumpSum = Math.max(0, beginningValue * (this.baseInterestRate / 100) * 0.7);
        
        // Teilfreistellung auch auf Vorabpauschale anwenden
        const taxableLumpSum = lumpSum * (1 - params.partialExemptionRate / 100);
        const taxOnLumpSum = Math.max(0, taxableLumpSum - this.basicAllowance / params.investmentPeriodYears) * 
          (this.capitalGainsTaxRate / 100) * (1 + this.solidarityTaxRate / 100) * 
          (1 + (params.hasChurchTax ? this.churchTaxRate / 100 : 0));
        
        totalLumpSum += lumpSum;
        totalTaxPaid += taxOnLumpSum;
        remainingTaxCredit += taxOnLumpSum;
        yearlyLumpSums.push(lumpSum);
        
        yearlyDetails.push({
          year,
          lumpSum,
          taxOnLumpSum,
          remainingTaxCredit
        });
      }
    }
    
    return {
      yearlyLumpSums,
      totalLumpSum,
      totalTaxPaid,
      yearlyDetails
    };
  }

  /**
   * Berechnet die effektive Rendite nach Steuern
   */
  private calculateEffectiveReturnRate(investment: number, netReturn: number, years: number): number {
    if (investment <= 0 || years <= 0) return 0;
    return (Math.pow(netReturn / investment, 1/years) - 1) * 100;
  }

  /**
   * Gibt die typischen Teilfreistellungssätze zurück
   */
  getPartialExemptionRates(): { [key: string]: number } {
    return {
      'Aktienfonds (≥51% Aktien)': 30,
      'Mischfonds (≥25% Aktien)': 15,
      'Immobilienfonds': 60,
      'Andere Fonds': 0
    };
  }

  /**
   * Schätzt den ETF-Typ basierend auf typischen Eigenschaften
   */
  getRecommendedETFType(): 'accumulating' | 'distributing' {
    // Für Langzeitanlage sind thesaurierende ETFs meist steuerlich günstiger
    return 'accumulating';
  }

  /**
   * Berechnet vereinfachte ETF-Steuern für Vergleichszwecke
   */
  calculateSimplifiedETFTax(
    totalInvestment: number,
    totalReturn: number,
    partialExemptionRate: number = 30,
    hasChurchTax: boolean = false
  ): number {
    const capitalGains = totalReturn - totalInvestment;
    const exemptAmount = capitalGains * (partialExemptionRate / 100) + this.basicAllowance;
    const taxableAmount = Math.max(0, capitalGains - exemptAmount);
    
    const capitalGainsTax = taxableAmount * (this.capitalGainsTaxRate / 100);
    const solidarityTax = capitalGainsTax * (this.solidarityTaxRate / 100);
    const churchTax = hasChurchTax ? capitalGainsTax * (this.churchTaxRate / 100) : 0;
    
    return capitalGainsTax + solidarityTax + churchTax;
  }
}