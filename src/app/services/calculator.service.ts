import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Inputs, defaultInputs } from '../models/inputs.model';
import { TaxCalculatorService } from './tax-calculator.service';
import { ETFTaxCalculatorService, ETFParameters, ETFTaxCalculation } from './etf-tax-calculator.service';
import { AfACalculatorService } from './afa-calculator.service';

export interface AnnualCalcRow {
  key: string;
  value: number;
}

export interface ProjectionRow {
  year: number;
  mieteinnahmen: number;
  immobilienwert: number;
  restschuld: number;
  zinsaufwand: number;
  tilgung: number;
  cashflow_nach_steuern: number;
}

export interface ImmoVsEtfResult {
  net_sale_proceeds: number;
  fv_monthly_contrib: number;
  fv_eigenkapital: number;
  total_etf_value: number;
  total_etf_taxes: number;
  net_etf_value: number;
  advantage_immo: number;
  etf_tax_details?: ETFTaxCalculation;
}

@Injectable({ providedIn: 'root' })
export class CalculatorService {
  private inputs$ = new BehaviorSubject<Inputs>(defaultInputs);
  inputsObs = this.inputs$.asObservable();

  constructor(
    private taxCalc: TaxCalculatorService,
    private etfTaxCalc: ETFTaxCalculatorService,
    private afaCalc: AfACalculatorService
  ) {}

  setInputs(v: Inputs): void {
    this.inputs$.next(v);
  }

  getInputs(): Inputs {
    return this.inputs$.getValue();
  }

  /**
   * Gets the effective tax rate for calculations
   */
  private getEffectiveTaxRate(inputs: Inputs): number {
    if (inputs.use_dynamic_tax && inputs.jahreseinkommen_brutto > 0) {
      return this.taxCalc.getEffectiveTaxRateForRealEstate(
        inputs.jahreseinkommen_brutto, 
        inputs.kirchensteuer
      );
    }
    return inputs.steuersatz_pct;
  }

  /**
   * Gets the dynamic AfA rate based on construction year
   */
  private getDynamicAfARate(inputs: Inputs): number {
    const afaRule = this.afaCalc.calculateAfARate(inputs.baujahr);
    return afaRule.rate;
  }

  /**
   * Gets AfA information for display purposes
   */
  getAfAInfo(inputs?: Inputs) {
    const p = inputs ?? this.getInputs();
    return this.afaCalc.getAfAInfo(p.baujahr);
  }

  calcAnnual(inputs?: Inputs): AnnualCalcRow[] {
    const p = inputs ?? this.getInputs();
    
    const annual_rent = p.miete_pro_qm_monat * p.wohnflaeche_qm * 12;
    const operating_costs = annual_rent * (p.betriebskosten_pct_von_miete / 100);
    const vacancy_loss = annual_rent * (p.vacancy_pct / 100);
    const reserves = p.wohnflaeche_qm * p.ruecklagen_eur_pro_qm_jahr;
    const building_share = p.kaufpreis * (p.anteil_gebaeude_pct / 100);
    const dynamic_afa_rate = this.getDynamicAfARate(p);
    const annual_AfA = building_share * (dynamic_afa_rate / 100);
    const loan_amount = Math.max(0, p.kaufpreis - p.eigenkapital);
    const annual_interest = loan_amount * (p.zins_pct / 100);
    const annual_principal = loan_amount * (p.tilgung_pct / 100);
    const annual_loan_payment = annual_interest + annual_principal;
    const taxable_income = annual_rent - operating_costs - vacancy_loss - annual_interest - annual_AfA;
    const effective_tax_rate = this.getEffectiveTaxRate(p);
    const tax = Math.max(0, taxable_income) * (effective_tax_rate / 100);
    const cashflow_after_tax = annual_rent - operating_costs - vacancy_loss - annual_loan_payment - tax - reserves;
    
    // Steuervorteile bei negativem Cashflow berechnen
    let tax_loss_benefit = 0;
    let effective_cashflow_after_tax_benefit = cashflow_after_tax;
    
    if (cashflow_after_tax < 0 && p.use_dynamic_tax && p.jahreseinkommen_brutto > 0) {
      const realEstateLoss = Math.abs(cashflow_after_tax);
      const taxBenefit = this.taxCalc.calculateRealEstateTaxBenefit(
        p.jahreseinkommen_brutto,
        realEstateLoss,
        p.kirchensteuer
      );
      tax_loss_benefit = taxBenefit.taxSavingsFromLoss;
      effective_cashflow_after_tax_benefit = cashflow_after_tax + tax_loss_benefit;
    }
    
    const purchase_costs = p.kaufpreis * (p.grunderwerbsteuer_pct/100 + p.notar_grundbuch_pct/100 + p.makler_pct/100);

    return [
      { key: 'Jährliche Mieteinnahmen (gesamt)', value: this.roundToTwo(annual_rent) },
      { key: 'Betriebskosten (jährlich)', value: this.roundToTwo(operating_costs) },
      { key: 'Leerstand (jährlich)', value: this.roundToTwo(vacancy_loss) },
      { key: 'Rücklagen (jährlich)', value: this.roundToTwo(reserves) },
      { key: `Jährliche AfA (${dynamic_afa_rate}%, Baujahr ${p.baujahr})`, value: this.roundToTwo(annual_AfA) },
      { key: 'Zinsaufwand (jährlich)', value: this.roundToTwo(annual_interest) },
      { key: 'Tilgung (jährlich)', value: this.roundToTwo(annual_principal) },
      { key: 'Jährliche Kreditrate (Zins+Tilgung)', value: this.roundToTwo(annual_loan_payment) },
      { key: 'Steuerbarer Gewinn (vor Steuern)', value: this.roundToTwo(taxable_income) },
      { key: 'Effektiver Steuersatz (%)', value: this.roundToTwo(effective_tax_rate) },
      { key: 'Einkommensteuer (jährlich)', value: this.roundToTwo(tax) },
      { key: 'Cashflow nach Steuern (jährlich)', value: this.roundToTwo(cashflow_after_tax) },
      ...(tax_loss_benefit > 0 ? [
        { key: 'Steuerersparnis durch Verlust', value: this.roundToTwo(tax_loss_benefit) },
        { key: 'Effektiver Cashflow (nach Steuerersparnis)', value: this.roundToTwo(effective_cashflow_after_tax_benefit) }
      ] : []),
      { key: 'Darlehensbetrag', value: this.roundToTwo(loan_amount) },
      { key: 'Kaufnebenkosten (gesamt)', value: this.roundToTwo(purchase_costs) }
    ];
  }

  projection(inputs?: Inputs): ProjectionRow[] {
    const p = inputs ?? this.getInputs();
    const rows: ProjectionRow[] = [];
    let remaining_loan = Math.max(0, p.kaufpreis - p.eigenkapital);
    let property_value = p.kaufpreis;
    let rent = p.miete_pro_qm_monat * p.wohnflaeche_qm * 12;
    const annual_principal = Math.max(0, (p.kaufpreis - p.eigenkapital) * (p.tilgung_pct / 100));

    for (let year = 1; year <= p.haltejahre; year++) {
      const interest = remaining_loan * (p.zins_pct / 100);
      let principal = annual_principal;
      if (principal > remaining_loan) principal = remaining_loan;
      remaining_loan = Math.max(0, remaining_loan - principal);

      if (year > 1) {
        rent = rent * (1 + p.mietsteigerung_pct / 100);
        property_value = property_value * (1 + p.wertsteigerung_pct / 100);
      }

      const operating_costs = rent * (p.betriebskosten_pct_von_miete / 100);
      const vacancy_loss = rent * (p.vacancy_pct / 100);
      const reserves = p.wohnflaeche_qm * p.ruecklagen_eur_pro_qm_jahr;
      const building_value = property_value * (p.anteil_gebaeude_pct / 100);
      const dynamic_afa_rate = this.getDynamicAfARate(p);
      const annual_AfA = building_value * (dynamic_afa_rate / 100);
      const taxable_income = rent - operating_costs - vacancy_loss - interest - annual_AfA;
      const effective_tax_rate = this.getEffectiveTaxRate(p);
      const tax = Math.max(0, taxable_income) * (effective_tax_rate / 100);
      const cashflow_after_tax = rent - operating_costs - vacancy_loss - (interest + principal) - tax - reserves;

      rows.push({
        year,
        mieteinnahmen: this.roundToTwo(rent),
        immobilienwert: this.roundToTwo(property_value),
        restschuld: this.roundToTwo(remaining_loan),
        zinsaufwand: this.roundToTwo(interest),
        tilgung: this.roundToTwo(principal),
        cashflow_nach_steuern: this.roundToTwo(cashflow_after_tax)
      });
    }

    return rows;
  }

  immoVsEtf(inputs?: Inputs): ImmoVsEtfResult {
    const p = inputs ?? this.getInputs();
    const projection = this.projection(p);
    const last = projection[projection.length - 1];
    const gross_sale = last.immobilienwert;
    const selling_costs = gross_sale * (p.verkaufskosten_pct / 100);
    const net_sale_proceeds = gross_sale - selling_costs - last.restschuld;

    const annual_costs = this.calcAnnual(p);
    const loan_payment = annual_costs.find(r => r.key === 'Jährliche Kreditrate (Zins+Tilgung)')!.value;
    const operating_costs = annual_costs.find(r => r.key === 'Betriebskosten (jährlich)')!.value;
    const reserves = annual_costs.find(r => r.key === 'Rücklagen (jährlich)')!.value;
    const annual_total = loan_payment + operating_costs + reserves;
    const monthly = annual_total / 12;

    // ETF calculation with German tax regulations
    const etfParams: ETFParameters = {
      monthlyInvestment: monthly,
      investmentPeriodYears: p.haltejahre,
      expectedAnnualReturn: p.etf_rendite_pct,
      etfType: 'accumulating',
      partialExemptionRate: 30, // Standard for stock ETFs
      hasChurchTax: p.kirchensteuer
    };

    const etfTaxCalculation = this.etfTaxCalc.calculateETFTaxes(etfParams);
    
    // Eigenkapital investment in ETF with taxes
    const eigenkapitalInvestment = p.eigenkapital;
    const eigenkapitalReturn = eigenkapitalInvestment * Math.pow(1 + (p.etf_rendite_pct / 100), p.haltejahre);
    const eigenkapitalGains = eigenkapitalReturn - eigenkapitalInvestment;
    
    // Calculate taxes on Eigenkapital investment separately
    const eigenkapitalTax = this.etfTaxCalc.calculateSimplifiedETFTax(
      eigenkapitalInvestment,
      eigenkapitalReturn,
      30, // 30% partial exemption for stock ETFs
      p.kirchensteuer
    );
    
    const fv_eigenkapital = eigenkapitalReturn - eigenkapitalTax;
    const total_etf_value = etfTaxCalculation.totalGrossReturn + eigenkapitalReturn;
    const total_etf_taxes = etfTaxCalculation.totalTaxes + eigenkapitalTax;
    const net_etf_value = etfTaxCalculation.netReturn + fv_eigenkapital;
    const advantage_immo = net_sale_proceeds - net_etf_value;

    return {
      net_sale_proceeds: this.roundToTwo(net_sale_proceeds),
      fv_monthly_contrib: this.roundToTwo(etfTaxCalculation.netReturn),
      fv_eigenkapital: this.roundToTwo(fv_eigenkapital),
      total_etf_value: this.roundToTwo(total_etf_value),
      total_etf_taxes: this.roundToTwo(total_etf_taxes),
      net_etf_value: this.roundToTwo(net_etf_value),
      advantage_immo: this.roundToTwo(advantage_immo),
      etf_tax_details: etfTaxCalculation
    };
  }

  private roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}