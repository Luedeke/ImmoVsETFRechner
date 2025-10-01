export interface Inputs {
  kaufpreis: number;
  wohnflaeche_qm: number;
  miete_pro_qm_monat: number;
  anteil_gebaeude_pct: number;
  afa_rate_pct: number;
  baujahr: number;
  grunderwerbsteuer_pct: number;
  notar_grundbuch_pct: number;
  makler_pct: number;
  eigenkapital: number;
  zins_pct: number;
  tilgung_pct: number;
  zinsbindung_jahre: number;
  ruecklagen_eur_pro_qm_jahr: number;
  betriebskosten_pct_von_miete: number;
  vacancy_pct: number;
  
  // Steuerdaten
  jahreseinkommen_brutto: number;
  kirchensteuer: boolean;
  steuersatz_pct: number; // Wird automatisch berechnet, aber kann manuell überschrieben werden
  use_dynamic_tax: boolean; // Schalter für dynamische vs. manuelle Steuerberechnung
  
  wertsteigerung_pct: number;
  mietsteigerung_pct: number;
  haltejahre: number;
  verkaufskosten_pct: number;
  etf_rendite_pct: number;
}

export const defaultInputs: Inputs = {
  kaufpreis: 360000,
  wohnflaeche_qm: 80,
  miete_pro_qm_monat: 10,
  anteil_gebaeude_pct: 78,
  afa_rate_pct: 2,
  baujahr: 1990,
  grunderwerbsteuer_pct: 5,
  notar_grundbuch_pct: 1.45,
  makler_pct: 3.57,
  eigenkapital: 72000,
  zins_pct: 3.5,
  tilgung_pct: 2,
  zinsbindung_jahre: 10,
  ruecklagen_eur_pro_qm_jahr: 14,
  betriebskosten_pct_von_miete: 20,
  vacancy_pct: 5,
  
  // Steuerdaten
  jahreseinkommen_brutto: 80000,
  kirchensteuer: false,
  steuersatz_pct: 42, // Wird bei use_dynamic_tax=true automatisch berechnet
  use_dynamic_tax: true,
  
  wertsteigerung_pct: 2,
  mietsteigerung_pct: 1.5,
  haltejahre: 20,
  verkaufskosten_pct: 5,
  etf_rendite_pct: 6
};