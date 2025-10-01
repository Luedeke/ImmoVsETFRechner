export const TOOLTIP_TEXTS = {
  // Grunddaten
  kaufpreis: 'Der Gesamtkaufpreis der Immobilie inklusive aller Nebenkosten. Basis für die Finanzierungsberechnung.',
  
  wohnflaeche_qm: 'Die vermietbare Wohnfläche in Quadratmetern. Grundlage für die Berechnung der Gesamtmiete.',
  
  miete_pro_qm_monat: 'Die monatliche Nettokaltmiete pro Quadratmeter. Wird mit der Wohnfläche multipliziert für die Gesamtmiete.',
  
  anteil_gebaeude_pct: 'Prozentualer Anteil des Gebäudes am Gesamtkaufpreis (Rest ist Grundstücksanteil). Nur der Gebäudeanteil kann steuerlich abgeschrieben werden (AfA).',
  
  afa_rate_pct: 'Abschreibung für Abnutzung in Prozent pro Jahr. Standard: 2% für Gebäude ab 1925, 2,5% für ältere Gebäude.',
  
  baujahr: 'Das Baujahr der Immobilie bestimmt den AfA-Satz. Gebäude vor 1925: 2,5% p.a., ab 1925: 2% p.a.',

  // Finanzierung
  eigenkapital: 'Das eingesetzte Eigenkapital für den Immobilienkauf. Wird beim ETF-Vergleich als Startkapital verwendet.',
  
  zins_pct: 'Der jährliche Nominalzinssatz für das Immobiliendarlehen während der Zinsbindung.',
  
  tilgung_pct: 'Die anfängliche jährliche Tilgungsrate in Prozent der Darlehenssumme. Standard: 2-3%.',
  
  zinsbindung_jahre: 'Zeitraum in Jahren, für den der Zinssatz festgeschrieben ist. Danach erfolgt eine Anschlussfinanzierung.',

  // Nebenkosten beim Kauf
  grunderwerbsteuer_pct: 'Steuer beim Immobilienerwerb, variiert je Bundesland zwischen 3,5% und 6,5% des Kaufpreises.',
  
  notar_grundbuch_pct: 'Kosten für Notar und Grundbucheintrag, typischerweise 1,5-2% des Kaufpreises.',
  
  makler_pct: 'Maklerprovision beim Kauf, regional unterschiedlich, oft 3-7% des Kaufpreises.',

  // Laufende Kosten
  ruecklagen_eur_pro_qm_jahr: 'Jährliche Rücklagen für Instandhaltung und Reparaturen pro qm Wohnfläche. Richtwert: 10-20€/qm.',
  
  betriebskosten_pct_von_miete: 'Nicht umlegbare Nebenkosten als Prozentsatz der Mieteinnahmen (Hausverwaltung, Reparaturen etc.).',
  
  vacancy_pct: 'Leerstandsrisiko in Prozent der Jahresmieteinnahmen. Berücksichtigt Mieterwechsel und Leerstände.',

  // Steuerdaten
  jahreseinkommen_brutto: 'Ihr zu versteuerndes Jahreseinkommen. Bestimmt den Grenzsteuersatz für die Berechnung der Steuerersparnis durch AfA und Werbungskosten.',
  
  kirchensteuer: 'Kirchensteuerpflicht (8-9% der Einkommensteuer je nach Bundesland). Beeinflusst den Gesamtsteuersatz.',
  
  steuersatz_pct: 'Ihr persönlicher Grenzsteuersatz inkl. Solidaritätszuschlag und ggf. Kirchensteuer. Wird automatisch berechnet oder kann manuell gesetzt werden.',
  
  use_dynamic_tax: 'Automatische Berechnung des Steuersatzes basierend auf Ihrem Einkommen oder manuelle Eingabe eines festen Steuersatzes.',

  // Wertsteigerungen
  wertsteigerung_pct: 'Jährliche Wertsteigerung der Immobilie in Prozent. Historischer Durchschnitt in Deutschland: 1-3% p.a.',
  
  mietsteigerung_pct: 'Jährliche Mietsteigerung in Prozent. Sollte realistisch gewählt werden, da durch Mietpreisbremse begrenzt.',
  
  haltejahre: 'Geplante Haltedauer der Immobilie in Jahren. Nach 10 Jahren ist der Verkauf privater Immobilien steuerfrei.',
  
  verkaufskosten_pct: 'Kosten beim Verkauf der Immobilie (Makler, Notar etc.) als Prozentsatz des Verkaufspreises. Typisch: 5-8%.',
  
  etf_rendite_pct: 'Erwartete jährliche Rendite des ETF-Investments vor Steuern. Historischer MSCI World: ca. 7-8% p.a.'
} as const;