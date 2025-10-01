# ImmoVsETFRechner - Dokumentation

## Übersicht

Der ImmoVsETFRechner ist eine Angular-Anwendung, die einen detaillierten Vergleich zwischen Immobilieninvestments und ETF-Anlagen ermöglicht. Die Anwendung berücksichtigt alle relevanten Faktoren wie Steuern, Finanzierung, Nebenkosten und Wertsteigerungen.

## Funktionsumfang

### Aktuell implementierte Features

#### 1. Eingabe-Parameter
- **Grunddaten**: Kaufpreis, Wohnfläche, Miete pro qm
- **Finanzierung**: Eigenkapital, Zinssatz, Tilgung, Zinsbindung
- **Nebenkosten**: Grunderwerbsteuer, Notar/Grundbuch, Makler
- **Betriebskosten**: Rücklagen, Betriebskosten, Leerstand
- **Steuerdaten**: Jahreseinkommen, Kirchensteuer, Steuersatz
- **Projektionen**: Wertsteigerung, Mietsteigerung, Haltedauer, ETF-Rendite

#### 2. Steuerberechnung
- Dynamische Steuerberechnung basierend auf Jahreseinkommen
- Manuelle Steuerrate-Eingabe möglich
- Kirchensteuer-Berücksichtigung
- Progressionsvorbehalt

#### 3. AfA-Berechnung (Abschreibung für Abnutzung)
- Automatische Berechnung basierend auf Baujahr und Gebäudeanteil
- Berücksichtigung verschiedener AfA-Sätze
- Detaillierte Aufschlüsselung der Steuerersparnis

#### 4. ETF-Steuerbetrachtung
- Berechnung der Kapitalertragsteuer auf ETF-Gewinne
- Freibetrag-Berücksichtigung
- Teilfreistellung für Aktienfonds

#### 5. Projektionsrechnung
- Jahr-für-Jahr Projektion über die gesamte Haltedauer
- Cashflow-Berechnung nach Steuern
- Entwicklung von Immobilienwert und Restschuld
- Mieteinnahmen mit Steigerungsraten

#### 6. Vergleichsrechnung
- direkter Vergleich Immobilie vs. ETF
- Berücksichtigung des Eigenkapitals und monatlicher Beiträge
- Nettobetrachtung nach allen Steuern und Kosten

## Technische Architektur

### Frontend (Angular 20)
```
src/
├── app/
│   ├── components/           # UI-Komponenten
│   │   ├── inputs-form.component.ts
│   │   ├── calc-annual.component.ts
│   │   ├── projection.component.ts
│   │   ├── immo-vs-etf.component.ts
│   │   ├── tax-info.component.ts
│   │   ├── etf-tax-breakdown.component.ts
│   │   └── afa-info.component.ts
│   ├── services/             # Business Logic
│   │   ├── calculator.service.ts
│   │   ├── tax-calculator.service.ts
│   │   ├── etf-tax-calculator.service.ts
│   │   └── afa-calculator.service.ts
│   ├── models/               # Datenmodelle
│   │   └── inputs.model.ts
│   └── app.ts               # Haupt-Komponente
```

### Services (Geschäftslogik)

#### CalculatorService
- Zentrale Koordination aller Berechnungen
- Verwaltung der Eingabeparameter
- Projektion über die Haltedauer

#### TaxCalculatorService
- Einkommensteuer-Berechnung
- Progressionsvorbehalt
- Kirchensteuer

#### ETFTaxCalculatorService
- Kapitalertragsteuer auf ETF-Gewinne
- Freibetrag-Verwaltung
- Teilfreistellung

#### AfACalculatorService
- Abschreibungsberechnung
- Baujahr-basierte AfA-Sätze
- Steuerersparnis-Kalkulation

## Berechnungslogik

### Immobilien-Cashflow
```
Monatlicher Cashflow = 
  (Mieteinnahmen - Betriebskosten - Leerstand) 
  - (Zins + Tilgung) 
  - Steuerbelastung 
  + AfA-Steuerersparnis
```

### ETF-Vergleichsrechnung
```
ETF-Endwert = 
  (Eigenkapital × (1 + Rendite)^Jahre) 
  + (monatliche Beiträge × Rentenendwertfaktor)
  - Kapitalertragsteuer
```

### Steuerberechnung
- Einkommensteuer nach deutschem Progressionstarif
- Solidaritätszuschlag (falls anwendbar)
- Kirchensteuer (optional)
- Berücksichtigung von Werbungskosten und AfA

## Standardwerte

Die Anwendung startet mit realistischen Standardwerten:
- Kaufpreis: 360.000 €
- Wohnfläche: 80 qm
- Miete: 10 €/qm/Monat
- Eigenkapital: 72.000 € (20%)
- Zinssatz: 3,5%
- ETF-Rendite: 6%
- Haltedauer: 20 Jahre

## Installation und Start

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm start

# Build für Produktion
npm run build

# Tests ausführen
npm test
```

## Geplante Erweiterungen

### Priorität 1 - Visualisierung
- Charts für Vermögensentwicklung (Chart.js oder ng2-charts)
- Vergleichsgrafiken Immobilie vs. ETF
- Cashflow-Diagramme über Zeit

### Priorität 2 - Erweiterte Szenarien
- Sondertilgungen berücksichtigen
- Anschlussfinanzierung nach Zinsbindung
- Variable Verkaufszeitpunkte

### Priorität 3 - Export/Import
- PDF-Report-Generator
- Berechnungen speichern/laden (LocalStorage)
- Excel-Export der Projektionsdaten

### Priorität 4 - Sensitivitätsanalyse
- "Was-wäre-wenn" Szenarien
- Optimistische/pessimistische Varianten
- Monte-Carlo-Simulationen

### Priorität 5 - UX-Verbesserungen
- Tooltips für Parameter-Erklärungen
- Preset-Profile (konservativ/aggressiv)
- Erweiterte Eingabevalidierung
- Responsive Design-Optimierungen

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

## Changelog

### Version 0.0.1 (Initial Release)
- Grundlegende Berechnungsfunktionen
- Alle Core-Komponenten implementiert
- Responsive Web-Design
- Steuer- und AfA-Berechnung
- ETF-Vergleichsrechnung

---

*Letzte Aktualisierung: Oktober 2025*