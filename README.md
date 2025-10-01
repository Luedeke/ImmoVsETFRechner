# 🏠 Angular ImmoRechner

Ein moderner Immobilieninvestment-Rechner, der Immobilieninvestments mit ETF-Investments vergleicht. Dieses Projekt ist eine vollständige Angular-Anwendung mit modernen Best Practices.

## ✨ Features

- **Umfassende Eingabeparameter**: Kaufpreis, Finanzierung, Betriebskosten, Steuern und mehr
- **Jahresübersicht**: Detaillierte Aufschlüsselung aller jährlichen Kosten und Erträge
- **20-Jahres-Projektion**: Vollständige Entwicklung von Mieterträgen, Immobilienwert und Cashflow
- **Immo vs. ETF Vergleich**: Direkter Vergleich zwischen Immobilieninvestment und ETF-Anlage
- **Interaktive Charts**: Visualisierung der Cashflow-Entwicklung und Vergleichsdaten mit Chart.js
- **Erweiterte Steuerberechnung**: Detaillierte AfA-Berechnung und ETF-Steueroptimierung
- **Mobile Optimiert**: Touch-Gesten und responsive Charts für mobile Geräte
- **Tooltip-Hilfen**: Umfassende Erklärungen zu allen Berechnungsparametern
- **Performance Optimiert**: Skeleton Loading und effiziente Datenverarbeitung
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Reaktive Berechnung**: Alle Werte werden automatisch bei Änderungen aktualisiert

## 🚀 Schnellstart

### Voraussetzungen

- Node.js (≥18)
- npm oder yarn
- Angular CLI (optional, aber empfohlen)

### Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd ImmoVsETFRechner
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Entwicklungsserver starten:
```bash
npm start
# oder
ng serve
```

4. Anwendung öffnen:
```
http://localhost:4200
```

## 🏗️ Projektstruktur

```
src/
├── app/
│   ├── components/                    # UI-Komponenten
│   │   ├── inputs-form.component.ts           # Eingabeformular
│   │   ├── calc-annual.component.ts           # Jahresübersicht
│   │   ├── projection.component.ts            # 20-Jahres-Projektion
│   │   ├── immo-vs-etf.component.ts          # Vergleichsansicht
│   │   ├── cashflow-chart.component.ts       # Cashflow-Diagramm
│   │   ├── comparison-chart.component.ts     # Vergleichsdiagramm
│   │   ├── mobile-enhanced-chart.component.ts # Mobile Chart-Optimierung
│   │   ├── afa-info.component.ts             # AfA-Informationen
│   │   ├── tax-info.component.ts             # Steuer-Informationen
│   │   ├── etf-tax-breakdown.component.ts    # ETF-Steueraufschlüsselung
│   │   ├── tooltip.component.ts              # Tooltip-System
│   │   └── skeleton-loader.component.ts      # Loading-Animation
│   ├── models/                        # TypeScript-Interfaces
│   │   ├── inputs.model.ts                   # Eingabe-Datenmodell
│   │   ├── interfaces.ts                     # Weitere Interfaces
│   │   └── tooltip-texts.ts                  # Tooltip-Texte
│   ├── services/                      # Business-Logik
│   │   ├── calculator.service.ts             # Hauptberechnungen
│   │   ├── afa-calculator.service.ts         # AfA-Berechnungen
│   │   ├── tax-calculator.service.ts         # Steuerberechnungen
│   │   ├── etf-tax-calculator.service.ts     # ETF-Steuerberechnungen
│   │   ├── mobile-gestures.service.ts        # Mobile Touch-Gesten
│   │   └── performance.service.ts            # Performance-Optimierung
│   ├── app.config.ts                  # App-Konfiguration
│   ├── app.routes.ts                  # Routing-Konfiguration
│   └── app.ts                         # Haupt-App-Komponente
├── styles.css                         # Globale Styles
├── manifest.json                      # PWA-Manifest
└── index.html
```

## 🧮 Berechnungslogik

### Jahresübersicht
- Mieteinnahmen (brutto)
- Betriebskosten und Leerstand
- Zins- und Tilgungsaufwand
- Steuerliche Abschreibung (AfA)
- Cashflow nach Steuern

### Projektion
- Jährliche Entwicklung über die Haltedauer
- Berücksichtigung von Miet- und Wertsteigerung
- Tilgungsverlauf des Darlehens
- Entwicklung des Immobilienwerts

### ETF-Vergleich
- Berechnung der alternativen ETF-Anlage
- Monatliche Sparrate entspricht den Immobilienkosten
- Berücksichtigung der ETF-Rendite und Steuern
- Direkter Vergleich der Endwerte
- Interaktive Visualisierung der Entwicklung

### Erweiterte Funktionen
- **Interaktive Charts**: Cashflow-Entwicklung und Vergleichsdiagramme
- **Steueroptimierung**: Detaillierte AfA-Berechnung und ETF-Freibeträge
- **Mobile Touch-Gesten**: Optimierte Bedienung auf Smartphones
- **Performance-Optimierung**: Skeleton Loading und effiziente Updates
- **Tooltip-System**: Erklärungen zu allen Berechnungsparametern

## 🎨 Technische Details

### Verwendete Technologien
- **Angular 20.3** mit Standalone Components
- **Chart.js 4.5** mit ng2-charts für interaktive Diagramme
- **Reactive Forms** für Benutzereingaben
- **RxJS** für State Management
- **TypeScript 5.9** für Type Safety
- **CSS Grid & Flexbox** für responsives Layout
- **Progressive Web App** Funktionalitäten

### Architektur-Prinzipien
- **Clean Code**: Saubere Trennung von UI und Business-Logik
- **Reactive Programming**: Automatische Updates bei Datenänderungen
- **Type Safety**: Vollständige TypeScript-Typisierung
- **Component-Based**: Modulare, wiederverwendbare Komponenten

## 📱 Responsive Design

Die Anwendung ist vollständig responsiv und optimiert für:
- **Desktop**: Vollständige Ansicht mit allen Features und Charts
- **Tablet**: Angepasstes Layout für mittlere Bildschirme
- **Mobile**: Stapelbare Karten mit Touch-optimierten Charts
  - Touch-Gesten für Chart-Navigation  
  - Optimierte Chart-Größen für kleine Bildschirme
  - Progressive Web App (PWA) Funktionalität

## 🔧 Verfügbare Scripts

```bash
# Entwicklungsserver starten
npm start

# Projekt für Produktion bauen
npm run build

# Tests ausführen
npm test

# Code-Qualität prüfen (falls ESLint konfiguriert)
npm run lint
```

## 🧪 Testing

Für Unit-Tests der Service-Methoden:

```bash
ng test
# oder mit Headless Chrome
npm test -- --watch=false --browsers=ChromeHeadless
```

Die Business-Logik in den Services (`CalculatorService`, `TaxCalculatorService`, `AfaCalculatorService`, etc.) ist besonders gut testbar, da sie reine Funktionen ohne Seiteneffekte verwendet.

### Testbare Komponenten
- **CalculatorService**: Alle Immobilien- und ETF-Berechnungen  
- **TaxCalculatorService**: Steuerliche Berechnungen und Optimierungen
- **AfaCalculatorService**: AfA-Berechnungen nach aktuellen Steuergesetzen
- **EtfTaxCalculatorService**: ETF-spezifische Steuerberechnungen

## 📊 Beispiel-Szenario

**Standard-Konfiguration:**
- Kaufpreis: 360.000 €
- Eigenkapital: 72.000 € (20%)
- Miete: 10 €/qm/Monat (80 qm = 800 €/Monat)
- Zinssatz: 4,0% (aktuelles Niveau)
- Haltedauer: 20 Jahre
- ETF-Rendite: 6% p.a.
- Mietsteigerung: 2% p.a.
- Wertsteigerung: 2,5% p.a.

Die interaktiven Charts zeigen die Entwicklung beider Szenarien über die gesamte Laufzeit.

## 🚀 Deployment

Für Production-Build:

```bash
ng build --configuration production
```

Die Dateien im `dist/`-Ordner können auf jeden Webserver deployed werden.

## 🔮 Erweiterungsmöglichkeiten

- **Historische Daten**: Integration von Marktdaten-APIs
- **Mehrere Szenarien**: Vergleich verschiedener Investmentoptionen
- **Export-Funktionen**: PDF-Generierung der Berechnungen und Charts
- **Erweiterte Charts**: Weitere Visualisierungsoptionen (Heatmaps, Sankey-Diagramme)
- **Sensitivitätsanalyse**: What-If-Szenarien mit interaktiven Slidern
- **Offline-Modus**: Vollständige PWA-Funktionalität für Offline-Nutzung
- **Dark Mode**: Theme-Switching für bessere Benutzererfahrung
- **Cloud-Sync**: Speichern und Teilen von Berechnungen

## 🤝 Beitrag leisten

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/neue-funktion`)
3. Änderungen committen (`git commit -am 'Neue Funktion hinzugefügt'`)
4. Branch pushen (`git push origin feature/neue-funktion`)
5. Pull Request erstellen

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

## 🏗️ Erstellt mit

- [Angular CLI](https://github.com/angular/angular-cli) version 20.3.3
- [Chart.js](https://www.chartjs.org/) für interaktive Datenvisualisierung
- [ng2-charts](https://valor-software.com/ng2-charts/) für Angular Chart.js Integration
- Moderne Web-Standards und Best Practices
- Liebe zum Detail ❤️
