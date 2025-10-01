import { Injectable } from '@angular/core';

export interface AfARule {
  yearFrom: number;
  yearTo: number;
  rate: number;
  description: string;
  details: string;
}

export interface AfACalculationResult {
  rate: number;
  annualAmount: number;
  description: string;
  remainingYears: number;
  totalDepreciation: number;
  rule: AfARule;
}

@Injectable({ providedIn: 'root' })
export class AfACalculatorService {
  
  // Deutsche AfA-Regelungen für Gebäude nach Baujahr
  private readonly afaRules: AfARule[] = [
    {
      yearFrom: 1925,
      yearTo: 1924, // Vor 1925
      rate: 2.5,
      description: 'Altbauten vor 1925',
      details: 'Gebäude vor 1925: 2,5% über 40 Jahre'
    },
    {
      yearFrom: 1925,
      yearTo: 2022,
      rate: 2.0,
      description: 'Standardsatz',
      details: 'Gebäude 1925-2022: 2% über 50 Jahre'
    },
    {
      yearFrom: 2023,
      yearTo: 2029,
      rate: 3.0,
      description: 'Erhöhte AfA (2023-2029)',
      details: 'Gebäude ab 2023: 3% über 33,33 Jahre (befristet bis 2029)'
    },
    {
      yearFrom: 2030,
      yearTo: 9999,
      rate: 2.0,
      description: 'Standardsatz (ab 2030)',
      details: 'Gebäude ab 2030: voraussichtlich wieder 2% über 50 Jahre'
    }
  ];

  // Sonderregelungen für bestimmte Gebäudetypen
  private readonly specialRules = {
    // Denkmalschutz: 10% über 10 Jahre, dann 2% über weitere Jahre
    monument: {
      rate: 10,
      years: 10,
      followUpRate: 2
    },
    // Neubau in fördergebieten (bis 2022): 4% über 10 Jahre, dann 2,5%
    supportedArea: {
      rate: 4,
      years: 10,
      followUpRate: 2.5
    }
  };

  constructor() {}

  /**
   * Berechnet die AfA-Rate basierend auf dem Baujahr
   */
  calculateAfARate(constructionYear: number): AfARule {
    // Spezialfall: Gebäude vor 1925
    if (constructionYear < 1925) {
      return {
        yearFrom: 0,
        yearTo: 1924,
        rate: 2.5,
        description: 'Altbauten vor 1925',
        details: 'Gebäude vor 1925: 2,5% über 40 Jahre'
      };
    }

    // Normale Regelungen
    for (const rule of this.afaRules) {
      if (constructionYear >= rule.yearFrom && constructionYear <= rule.yearTo) {
        return rule;
      }
    }

    // Fallback: Standardsatz
    return {
      yearFrom: 1925,
      yearTo: 2022,
      rate: 2.0,
      description: 'Standardsatz',
      details: 'Gebäude 1925-2022: 2% über 50 Jahre'
    };
  }

  /**
   * Berechnet die vollständige AfA-Kalkulation
   */
  calculateAfA(
    constructionYear: number,
    buildingValue: number,
    currentYear: number = new Date().getFullYear()
  ): AfACalculationResult {
    const rule = this.calculateAfARate(constructionYear);
    const annualAmount = buildingValue * (rule.rate / 100);
    
    // Berechne verbleibende Abschreibungsjahre
    const ageOfBuilding = currentYear - constructionYear;
    const maxDepreciationYears = this.getMaxDepreciationYears(rule.rate);
    const remainingYears = Math.max(0, maxDepreciationYears - ageOfBuilding);
    
    // Gesamtabschreibung berechnen
    const yearsToDepreciate = Math.min(ageOfBuilding, maxDepreciationYears);
    const totalDepreciation = buildingValue * (rule.rate / 100) * yearsToDepreciate;

    return {
      rate: rule.rate,
      annualAmount,
      description: rule.description,
      remainingYears,
      totalDepreciation,
      rule
    };
  }

  /**
   * Ermittelt die maximale Abschreibungsdauer basierend auf der AfA-Rate
   */
  private getMaxDepreciationYears(rate: number): number {
    switch (rate) {
      case 2.5: return 40; // Altbauten vor 1925
      case 2.0: return 50; // Standardsatz
      case 3.0: return 33; // Erhöhte AfA 2023-2029 (33,33 Jahre = 100/3)
      default: return 50;  // Fallback
    }
  }

  /**
   * Prüft, ob für ein Gebäude Sonderabschreibungen möglich sind
   */
  getPossibleSpecialDepreciations(constructionYear: number): string[] {
    const possibilities: string[] = [];
    
    // Denkmalschutz (immer möglich, wenn entsprechend eingestuft)
    possibilities.push('Denkmalschutz: 10% über 10 Jahre, dann 2% über weitere Jahre');
    
    // Neubau in Fördergebieten (bis 2022)
    if (constructionYear <= 2022) {
      possibilities.push('Fördergebiet: 4% über 10 Jahre, dann 2,5% über weitere Jahre');
    }
    
    // Erhöhte Abschreibung für Mietwohnungsneubau (§7b EStG)
    if (constructionYear >= 2019) {
      possibilities.push('Mietwohnungsneubau (§7b): 5% über 4 Jahre zusätzlich zur normalen AfA');
    }

    return possibilities;
  }

  /**
   * Gibt alle verfügbaren AfA-Regeln zurück
   */
  getAllAfARules(): AfARule[] {
    return [...this.afaRules];
  }

  /**
   * Berechnet die AfA für verschiedene Szenarien
   */
  calculateScenarios(
    constructionYear: number,
    buildingValue: number
  ): {
    standard: AfACalculationResult;
    monument?: AfACalculationResult;
    supportedArea?: AfACalculationResult;
  } {
    const standard = this.calculateAfA(constructionYear, buildingValue);
    
    const scenarios: any = { standard };
    
    // Denkmalschutz-Szenario
    scenarios.monument = {
      rate: 10,
      annualAmount: buildingValue * 0.1,
      description: 'Denkmalschutz (10 Jahre)',
      remainingYears: 10,
      totalDepreciation: buildingValue, // Kann theoretisch komplett abgeschrieben werden
      rule: {
        yearFrom: constructionYear,
        yearTo: constructionYear + 10,
        rate: 10,
        description: 'Denkmalschutz',
        details: '10% über 10 Jahre, danach 2% über weitere Jahre'
      }
    };

    // Fördergebiet-Szenario (nur bis 2022)
    if (constructionYear <= 2022) {
      scenarios.supportedArea = {
        rate: 4,
        annualAmount: buildingValue * 0.04,
        description: 'Fördergebiet (10 Jahre)',
        remainingYears: 10,
        totalDepreciation: buildingValue * 0.4, // 40% über 10 Jahre
        rule: {
          yearFrom: constructionYear,
          yearTo: constructionYear + 10,
          rate: 4,
          description: 'Fördergebiet',
          details: '4% über 10 Jahre, danach 2,5% über weitere Jahre'
        }
      };
    }

    return scenarios;
  }

  /**
   * Hilfsmethode für die Anzeige der AfA-Informationen
   */
  getAfAInfo(constructionYear: number): {
    currentRule: AfARule;
    buildingAge: number;
    specialOptions: string[];
    isNewBuilding: boolean;
    isOldBuilding: boolean;
  } {
    const currentYear = new Date().getFullYear();
    const buildingAge = currentYear - constructionYear;
    const currentRule = this.calculateAfARate(constructionYear);
    const specialOptions = this.getPossibleSpecialDepreciations(constructionYear);
    
    return {
      currentRule,
      buildingAge,
      specialOptions,
      isNewBuilding: constructionYear >= 2020,
      isOldBuilding: constructionYear < 1950
    };
  }
}