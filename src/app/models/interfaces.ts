export interface TaxInfo {
  description: string;
  marginalRate: string;
  averageRate: string;
}

export interface AfADisplayInfo {
  currentRule: AfARule;
  buildingAge: number;
  specialOptions: string[];
  isNewBuilding: boolean;
  isOldBuilding: boolean;
}

export interface AfARule {
  rate: number;
  description: string;
  years: number;
}

export interface ETFDisplayInfo {
  totalInvestment: number;
  totalGrossReturn: number;
  totalTaxes: number;
  netReturn: number;
  taxDetails: ETFTaxCalculation;
}

export interface ProjectionDisplayRow {
  year: number;
  mieteinnahmen: number;
  immobilienwert: number;
  restschuld: number;
  zinsaufwand: number;
  tilgung: number;
  cashflow_nach_steuern: number;
}

export interface ComparisonResult {
  net_sale_proceeds: number;
  fv_monthly_contrib: number;
  fv_eigenkapital: number;
  total_etf_value: number;
  total_etf_taxes: number;
  net_etf_value: number;
  advantage_immo: number;
  etf_tax_details?: ETFTaxCalculation;
}

interface ETFTaxCalculation {
  totalTaxes: number;
  capitalGainsTax: number;
  advanceLumpSum: number;
  exemptionUsed: number;
  taxDetails: {
    yearlyAdvanceLumpSums: Array<{
      year: number;
      amount: number;
      taxable: number;
      tax: number;
    }>;
  };
}