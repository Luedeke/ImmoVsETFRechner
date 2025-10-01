# 🏠 Angular ImmoRechner

Ein moderner Immobilieninvestment-Rechner, der Immobilieninvestments mit ETF-Investments vergleicht. Dieses Projekt ist eine vollständige Angular-Anwendung mit modernen Best Practices.

## ✨ Features

- **Umfassende Eingabeparameter**: Kaufpreis, Finanzierung, Betriebskosten, Steuern und mehr
- **Jahresübersicht**: Detaillierte Aufschlüsselung aller jährlichen Kosten und Erträge
- **20-Jahres-Projektion**: Vollständige Entwicklung von Mieterträgen, Immobilienwert und Cashflow
- **Immo vs. ETF Vergleich**: Direkter Vergleich zwischen Immobilieninvestment und ETF-Anlage
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
│   ├── components/           # UI-Komponenten
│   │   ├── inputs-form.component.ts
│   │   ├── calc-annual.component.ts
│   │   ├── projection.component.ts
│   │   └── immo-vs-etf.component.ts
│   ├── models/              # TypeScript-Interfaces
│   │   └── inputs.model.ts
│   ├── services/            # Business-Logik
│   │   └── calculator.service.ts
│   └── app.component.ts     # Haupt-App-Komponente
├── styles.css               # Globale Styles
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
- Berücksichtigung der ETF-Rendite
- Direkter Vergleich der Endwerte

## 🎨 Technische Details

### Verwendete Technologien
- **Angular 20+** mit Standalone Components
- **Reactive Forms** für Benutzereingaben
- **RxJS** für State Management
- **TypeScript** für Type Safety
- **CSS Grid & Flexbox** für responsives Layout

### Architektur-Prinzipien
- **Clean Code**: Saubere Trennung von UI und Business-Logik
- **Reactive Programming**: Automatische Updates bei Datenänderungen
- **Type Safety**: Vollständige TypeScript-Typisierung
- **Component-Based**: Modulare, wiederverwendbare Komponenten

## 📱 Responsive Design

Die Anwendung ist vollständig responsiv und optimiert für:
- **Desktop**: Vollständige Ansicht mit allen Features
- **Tablet**: Angepasstes Layout für mittlere Bildschirme
- **Mobile**: Stapelbare Karten für kleine Bildschirme

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

Für Unit-Tests der Calculator-Service-Methoden:

```bash
ng test
```

Die Business-Logik im `CalculatorService` ist besonders gut testbar, da sie reine Funktionen ohne Seiteneffekte verwendet.

## 📊 Beispiel-Szenario

**Standard-Konfiguration:**
- Kaufpreis: 360.000 €
- Eigenkapital: 72.000 €
- Miete: 10 €/qm/Monat (80 qm)
- Zinssatz: 3,5%
- Haltedauer: 20 Jahre
- ETF-Rendite: 6% p.a.

## 🚀 Deployment

Für Production-Build:

```bash
ng build --configuration production
```

Die Dateien im `dist/`-Ordner können auf jeden Webserver deployed werden.

## 🔮 Erweiterungsmöglichkeiten

- **Historische Daten**: Integration von Marktdaten-APIs
- **Mehrere Szenarien**: Vergleich verschiedener Investmentoptionen
- **Export-Funktionen**: PDF-Generierung der Berechnungen
- **Chartings**: Grafische Darstellung der Projektionen
- **Sensitivitätsanalyse**: What-If-Szenarien
- **Steueroptimierung**: Erweiterte Steuerberechnung

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
- Moderne Web-Standards und Best Practices
- Liebe zum Detail ❤️
