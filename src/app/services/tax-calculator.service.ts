import { Injectable } from '@angular/core';

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  description: string;
}

export interface TaxCalculationResult {
  grossIncome: number;
  taxableIncome: number;
  totalTax: number;
  marginalTaxRate: number;
  averageTaxRate: number;
  netIncome: number;
  solidarityTax: number;
  churchTax: number;
  totalDeductions: number;
}

export interface RealEstateTaxBenefit {
  annualRealEstateLoss: number;
  taxSavingsFromLoss: number;
  effectiveAfterTaxLoss: number;
  monthlyTaxBenefit: number;
  annualTaxBenefit: number;
  netCashflowAfterTaxBenefit: number;
  comparisonWithoutRealEstate: {
    normalTax: number;
    taxWithRealEstateLoss: number;
    totalSavings: number;
  };
}

@Injectable({ providedIn: 'root' })
export class TaxCalculatorService {
  
  // Deutsche Steuersätze 2024 (vereinfacht)
  private readonly taxBrackets2024: TaxBracket[] = [
    { min: 0, max: 11604, rate: 0, description: 'Grundfreibetrag' },
    { min: 11605, max: 17005, rate: 14, description: 'Eingangssteuersatz (progressiv 14-24%)' },
    { min: 17006, max: 66760, rate: 24, description: 'Erste Progressionszone (progressiv 24-42%)' },
    { min: 66761, max: 277825, rate: 42, description: 'Proportionalzone' },
    { min: 277826, max: Infinity, rate: 45, description: 'Spitzensteuersatz' }
  ];

  private readonly standardDeduction = 1000; // Werbungskostenpauschale
  private readonly solidarityRate = 0.055; // 5,5% Solidaritätszuschlag
  private readonly churchTaxRate = 0.08; // 8% Kirchensteuer (Bayern/BW: 8%, andere: 9%)

  constructor() {}

  /**
   * Berechnet die Einkommensteuer nach deutschem Recht
   */
  calculateIncomeTax(grossAnnualIncome: number, hasChurchTax: boolean = false): TaxCalculationResult {
    // Zu versteuerndes Einkommen
    const taxableIncome = Math.max(0, grossAnnualIncome - this.standardDeduction);
    
    // Einkommensteuer berechnen
    const incomeTax = this.calculateProgressiveTax(taxableIncome);
    
    // Solidaritätszuschlag (nur wenn Einkommensteuer > 972€/Jahr)
    const solidarityTax = incomeTax > 972 ? incomeTax * this.solidarityRate : 0;
    
    // Kirchensteuer (falls gewünscht)
    const churchTax = hasChurchTax ? incomeTax * this.churchTaxRate : 0;
    
    // Gesamte Steuerlast
    const totalTax = incomeTax + solidarityTax + churchTax;
    const totalDeductions = this.standardDeduction;
    
    // Grenzsteuersatz ermitteln
    const marginalTaxRate = this.getMarginalTaxRate(taxableIncome);
    
    // Durchschnittssteuersatz
    const averageTaxRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;
    
    // Nettoeinkommen
    const netIncome = grossAnnualIncome - totalTax;

    return {
      grossIncome: grossAnnualIncome,
      taxableIncome,
      totalTax,
      marginalTaxRate,
      averageTaxRate,
      netIncome,
      solidarityTax,
      churchTax,
      totalDeductions
    };
  }

  /**
   * Berechnet den Grenzsteuersatz für ein gegebenes Einkommen
   */
  getMarginalTaxRate(taxableIncome: number): number {
    for (const bracket of this.taxBrackets2024) {
      if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
        // Für die progressiven Zonen eine genauere Berechnung
        if (bracket.min === 11605) {
          // Erste Progressionszone: 14% bis 24%
          const progressionFactor = (taxableIncome - bracket.min) / (bracket.max - bracket.min);
          return 14 + (progressionFactor * 10); // 14% + bis zu 10% Aufschlag
        } else if (bracket.min === 17006) {
          // Zweite Progressionszone: 24% bis 42%
          const progressionFactor = (taxableIncome - bracket.min) / (bracket.max - bracket.min);
          return 24 + (progressionFactor * 18); // 24% + bis zu 18% Aufschlag
        }
        return bracket.rate;
      }
    }
    return 45; // Spitzensteuersatz als Fallback
  }

  /**
   * Berechnet die progressive Einkommensteuer
   */
  private calculateProgressiveTax(taxableIncome: number): number {
    if (taxableIncome <= 11604) {
      return 0; // Grundfreibetrag
    }

    // Vereinfachte Berechnung mit durchschnittlichen Sätzen pro Stufe
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of this.taxBrackets2024) {
      if (remainingIncome <= 0) break;
      if (bracket.rate === 0) continue; // Grundfreibetrag überspringen

      const bracketSize = bracket.max - bracket.min + 1;
      const taxableInThisBracket = Math.min(remainingIncome, bracketSize);
      
      // Für progressive Zonen einen Mittelwert verwenden
      let effectiveRate = bracket.rate;
      if (bracket.min === 11605) {
        effectiveRate = 19; // Mittelwert zwischen 14% und 24%
      } else if (bracket.min === 17006) {
        effectiveRate = 33; // Mittelwert zwischen 24% und 42%
      }

      tax += (taxableInThisBracket * effectiveRate) / 100;
      remainingIncome -= taxableInThisBracket;
    }

    return Math.round(tax);
  }

  /**
   * Gibt die aktuellen Steuerstufen zurück
   */
  getTaxBrackets(): TaxBracket[] {
    return [...this.taxBrackets2024];
  }

  /**
   * Ermittelt die Steuerstufe für ein gegebenes Einkommen
   */
  getTaxBracketInfo(taxableIncome: number): TaxBracket | null {
    for (const bracket of this.taxBrackets2024) {
      if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
        return bracket;
      }
    }
    return null;
  }

  /**
   * Berechnet den optimalen Steuersatz für die Immobilienberechnung
   * Berücksichtigt sowohl den Grenzsteuersatz als auch mögliche Solidaritätszuschläge
   */
  getEffectiveTaxRateForRealEstate(grossAnnualIncome: number, hasChurchTax: boolean = false): number {
    const taxResult = this.calculateIncomeTax(grossAnnualIncome, hasChurchTax);
    
    // Für Immobilienberechnung: Grenzsteuersatz + anteilige Nebenabgaben
    let effectiveRate = taxResult.marginalTaxRate;
    
    // Solidaritätszuschlag hinzufügen (falls anwendbar)
    if (taxResult.solidarityTax > 0) {
      effectiveRate += taxResult.marginalTaxRate * this.solidarityRate;
    }
    
    // Kirchensteuer hinzufügen (falls anwendbar)
    if (hasChurchTax) {
      effectiveRate += taxResult.marginalTaxRate * this.churchTaxRate;
    }
    
    return Math.round(effectiveRate * 100) / 100; // Auf 2 Dezimalstellen runden
  }

  /**
   * Berechnet den Steuervorteil durch Immobilienverluste
   * Zeigt wie sich Verluste aus Vermietung und Verpachtung steuermindernd auswirken
   */
  calculateRealEstateTaxBenefit(
    grossAnnualIncome: number,
    annualRealEstateLoss: number,
    hasChurchTax: boolean = false
  ): RealEstateTaxBenefit {
    // Steuerberechnung ohne Immobilie (nur Gehalt)
    const normalTaxResult = this.calculateIncomeTax(grossAnnualIncome, hasChurchTax);
    
    // Steuerberechnung mit Immobilienverlust (Gehalt - Verlust)
    const adjustedIncome = Math.max(0, grossAnnualIncome - Math.abs(annualRealEstateLoss));
    const taxWithRealEstateLoss = this.calculateIncomeTax(adjustedIncome, hasChurchTax);
    
    // Steuerersparnis durch den Verlust
    const taxSavingsFromLoss = normalTaxResult.totalTax - taxWithRealEstateLoss.totalTax;
    
    // Effektiver Verlust nach Steuerersparnis
    const effectiveAfterTaxLoss = Math.abs(annualRealEstateLoss) - taxSavingsFromLoss;
    
    // Monatliche und jährliche Steuervorteile
    const monthlyTaxBenefit = taxSavingsFromLoss / 12;
    const annualTaxBenefit = taxSavingsFromLoss;
    
    // Netto-Cashflow nach Berücksichtigung der Steuervorteile
    const netCashflowAfterTaxBenefit = -effectiveAfterTaxLoss; // Negative, da es immer noch ein Verlust ist, aber reduziert
    
    return {
      annualRealEstateLoss: Math.abs(annualRealEstateLoss),
      taxSavingsFromLoss,
      effectiveAfterTaxLoss,
      monthlyTaxBenefit,
      annualTaxBenefit,
      netCashflowAfterTaxBenefit,
      comparisonWithoutRealEstate: {
        normalTax: normalTaxResult.totalTax,
        taxWithRealEstateLoss: taxWithRealEstateLoss.totalTax,
        totalSavings: taxSavingsFromLoss
      }
    };
  }

  /**
   * Berechnet den marginalen Steuervorteil pro Euro Immobilienverlust
   */
  getMarginalTaxBenefitRate(grossAnnualIncome: number, hasChurchTax: boolean = false): number {
    return this.getEffectiveTaxRateForRealEstate(grossAnnualIncome, hasChurchTax);
  }
}