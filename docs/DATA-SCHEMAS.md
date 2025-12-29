# Data Schemas and Reference Data

This document defines all data structures, TypeScript interfaces, and reference constants used in the Scenario Dialogue Tool.

## Scenario Data Schema

### Full Scenario Input

```typescript
interface ScenarioInput {
  metadata: {
    country: string;           // Country or region name
    scenarioName: string;      // e.g., "High Renewable", "Business as Usual"
    modelVersion: string;      // e.g., "MESSAGE", "OSeMOSYS", "LEAP"
    dateCreated: string;       // ISO 8601 date
  };

  milestoneYears: number[];    // e.g., [2025, 2030, 2040, 2050]

  supply: {
    capacity: {                // MW by technology and year
      hydro: Record<number, number>;
      solarPV: Record<number, number>;
      wind: Record<number, number>;
      battery: Record<number, number>;
      geothermal: Record<number, number>;
      biomass: Record<number, number>;
      coal: Record<number, number>;
      diesel: Record<number, number>;
      hfo: Record<number, number>;
      naturalGas: Record<number, number>;
      nuclear: Record<number, number>;
      interconnector: Record<number, number>;
    };
    generation: Record<string, Record<number, number>>;  // GWh by technology and year
    emissions: Record<number, number>;                    // Mt CO2 by year
    investment: {
      annual: Record<number, number>;      // USD millions by year
      cumulative: Record<number, number>;  // USD millions by year
    };
  };

  demand: {
    total: Record<number, number>;      // GWh by year
    peak: Record<number, number>;       // MW by year
    bySector: {
      residential: Record<number, number>;
      commercial: Record<number, number>;
      industrial: Record<number, number>;
      transport: Record<number, number>;
    };
  };
}
```

### Quick Entry Schema (Simplified)

For workshops where full data entry is impractical:

```typescript
interface QuickScenarioInput {
  country: string;
  scenarioName: string;

  // Capacity 2030 (MW)
  renewableCapacity2030: number;
  fossilCapacity2030: number;
  batteryCapacity2030: number;

  // Capacity 2040 (MW)
  renewableCapacity2040: number;
  fossilCapacity2040: number;
  batteryCapacity2040: number;

  // Key metrics
  totalInvestment2030: number;      // USD millions cumulative
  totalInvestment2050: number;
  emissions2025: number;            // Mt CO2
  emissions2030: number;
  emissions2050: number;

  // Demand
  peakDemand2030: number;           // MW
  peakDemand2040: number;
}
```

---

## Derived Metrics Schema

Metrics calculated from scenario input:

```typescript
interface DerivedMetrics {
  renewableShare: Record<number, number>;      // % by year
  fossilShare: Record<number, number>;         // % by year

  jobs: {
    construction: Record<number, number>;      // Job-years by year
    operations: Record<number, number>;        // Permanent jobs by year
    total: Record<number, number>;             // Combined by year
  };

  landUse: {
    totalNewLand: Record<number, number>;      // Hectares by year
    byTechnology: {
      solarPV: Record<number, number>;
      wind: Record<number, number>;
      battery: Record<number, number>;
    };
  };

  emissions: {
    absolute: Record<number, number>;          // Mt CO2 by year
    reductionPercent: Record<number, number>;  // % reduction vs baseline
  };

  capacity: {
    totalInstalled: Record<number, number>;    // MW by year
    variableRenewableShare: Record<number, number>;  // % (solar + wind)
  };

  investment: {
    totalCumulative: Record<number, number>;   // USD millions by year
    annualPeak: number;                        // Highest annual investment
    averageAnnual: number;                     // Average across period
  };
}
```

---

## Reference Data: Technology Factors

### Job Factors

Based on IRENA renewable energy job factor studies:

```typescript
const JOB_FACTORS = {
  // Jobs per MW installed (construction phase, job-years)
  construction: {
    solarPV: 10,      // High labor intensity for installation
    wind: 8,          // Manufacturing + installation
    hydro: 12,        // Civil works intensive
    battery: 3,       // Lower labor intensity
    geothermal: 6,    // Drilling + installation
    biomass: 8,       // Plant construction
    coal: 4,          // Conventional plant
    naturalGas: 4,    // Conventional plant
    gas: 4,           // Alias for naturalGas
    diesel: 3,        // Simple cycle
    hfo: 3,           // Heavy fuel oil plants
  },

  // Permanent jobs per MW (operations and maintenance)
  operations: {
    solarPV: 0.3,     // Minimal O&M staff
    wind: 0.4,        // Regular maintenance
    hydro: 0.5,       // Dam operation + maintenance
    battery: 0.1,     // Limited O&M
    geothermal: 0.6,  // Continuous monitoring
    biomass: 1.0,     // Fuel handling + operation
    coal: 0.8,        // Plant operation
    naturalGas: 0.8,  // Plant operation
    gas: 0.8,         // Alias for naturalGas
    diesel: 0.5,      // Simple operation
    hfo: 0.5,         // Simple operation
  }
};
```

**Notes:**
- Construction jobs are temporary (job-years over project duration)
- Operations jobs are permanent positions
- Factors are approximations for planning discussion, not precise employment forecasts
- Local content and supply chain maturity significantly affect actual job creation

### Land Use Factors

Approximate land requirements:

```typescript
const LAND_FACTORS = {
  solarPV: 2.0,       // Hectares per MW (utility-scale ground mount)
  wind: 0.3,          // Hectares per MW (direct footprint only, not total area)
  battery: 0.1,       // Hectares per MW (containerized systems)
  // Other technologies: site-specific, not generalized
};
```

**Notes:**
- Solar: Assumes typical utility-scale fixed-tilt installations
- Wind: Direct turbine footprint only (total project area 10-100x larger)
- Battery: Assumes containerized/modular systems
- Hydro, geothermal, thermal plants: too site-specific to generalize

### Emission Factors

For fossil fuel combustion only:

```typescript
const EMISSION_FACTORS = {  // tCO2 per GWh generated
  coal: 900,          // High carbon intensity
  naturalGas: 400,    // Lower than coal
  gas: 400,           // Alias for naturalGas
  diesel: 700,        // Medium-high intensity
  hfo: 650,           // Heavy fuel oil
  // Renewables: 0 (lifecycle emissions not included in this tool)
};
```

**Notes:**
- Factors represent **combustion emissions only**
- Does not include lifecycle/embodied emissions
- For illustrative scenario comparison, not carbon accounting
- Actual emissions should come from the optimization model

---

## Stakeholder Response Schema

### Response Structure

```typescript
interface StakeholderResponse {
  stakeholderId: string;
  stakeholderName: string;

  initialReaction: string;              // 2-3 sentence overview

  appreciation: string[];               // Positive aspects (2-4 points)

  concerns: Concern[];                  // Concerns raised (2-4 points)

  questions: string[];                  // Questions they would ask (3-5)

  engagementAdvice: string[];           // Tips for engaging this stakeholder (2-3)

  generatedAt: string;                  // ISO 8601 timestamp
  generationType: 'rule-based' | 'ai-enhanced';
}

interface Concern {
  text: string;                         // The concern statement
  explanation: string;                  // Why this matters to them
  metric: string;                       // Which metric triggered it
  severity: 'low' | 'medium' | 'high';  // How significant
}
```

---

## Adjustment Calculator Schema

### Adjustable Parameters

```typescript
interface AdjustableParameters {
  // Only high-level, non-technical adjustments
  renewableShareTarget2030: number;    // % (slider 0-100)
  renewableShareTarget2040: number;    // % (slider 0-100)

  // Approximate investment level (qualitative only)
  investmentLevel: 'low' | 'base' | 'high';

  // Timeline adjustments
  coalPhaseoutYear: number | null;     // Year or null for no phase-out
}
```

### Directional Impacts

```typescript
interface DirectionalImpacts {
  jobs: DirectionalChange;
  landUse: DirectionalChange;
  emissions: DirectionalChange;
  stakeholderSentiment: Record<string, SentimentChange>;
}

interface DirectionalChange {
  direction: 'increase' | 'decrease' | 'unchanged';
  magnitude: 'negligible' | 'moderate' | 'significant';
  explanation: string;
}

interface SentimentChange {
  direction: 'more_positive' | 'more_negative' | 'unchanged';
  positiveFactors: string[];
  negativeFactors: string[];
}
```

---

## Validation Rules

### Scenario Data Validation

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

// Example validation rules
const VALIDATION_RULES = {
  // Required fields
  requiredMetadata: ['country', 'scenarioName'],
  requiredYears: [2025, 2030, 2040, 2050],  // Can be customized

  // Range checks
  capacityRange: { min: 0, max: 100000 },   // MW
  emissionsRange: { min: 0, max: 10000 },   // Mt CO2
  investmentRange: { min: 0, max: 1000000 }, // USD millions

  // Consistency checks
  ensureGenerationLessOrEqualCapacity: true,
  ensureDemandGrowthReasonable: true,
};
```

---

## File Import/Export Formats

### JSON Export Format

```typescript
interface ExportedScenario {
  version: '1.0',                  // Schema version
  exportedAt: string,              // ISO 8601 timestamp
  exportedBy: string,              // Tool identifier
  scenario: ScenarioInput,
  derivedMetrics?: DerivedMetrics, // Optional pre-calculated metrics
}
```

### CSV Import Format

For users importing from Excel/spreadsheet tools:

```csv
# Metadata
country,ScenarioLand
scenarioName,High Renewable Ambition
modelVersion,MESSAGE
dateCreated,2024-01-15

# Capacity (MW)
technology,2025,2030,2040,2050
hydro,150,220,400,600
solarPV,50,500,2000,5000
wind,0,100,800,1500
battery,10,200,500,1000
...

# Generation (GWh)
technology,2025,2030,2040,2050
hydro,800,1200,2100,3200
solarPV,100,1000,4000,10000
...

# Investment (USD millions)
year,annual,cumulative
2025,50,50
2030,200,1000
2040,300,5000
2050,100,10000

# Emissions (Mt CO2)
year,emissions
2025,2.5
2030,2.0
2040,1.0
2050,0.5
```

---

## Example Data: Sample Scenario

### Minimal Working Example

For testing and demonstration:

```typescript
const SAMPLE_SCENARIO: ScenarioInput = {
  metadata: {
    country: 'Example Country',
    scenarioName: 'High Renewable Transition',
    modelVersion: 'MESSAGE',
    dateCreated: '2024-01-15'
  },

  milestoneYears: [2025, 2030, 2040, 2050],

  supply: {
    capacity: {
      hydro: { 2025: 150, 2030: 220, 2040: 400, 2050: 600 },
      solarPV: { 2025: 50, 2030: 500, 2040: 2000, 2050: 5000 },
      wind: { 2025: 0, 2030: 100, 2040: 800, 2050: 1500 },
      battery: { 2025: 10, 2030: 200, 2040: 500, 2050: 1000 },
      geothermal: { 2025: 0, 2030: 0, 2040: 100, 2050: 200 },
      biomass: { 2025: 20, 2030: 50, 2040: 100, 2050: 150 },
      coal: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
      diesel: { 2025: 100, 2030: 50, 2040: 20, 2050: 0 },
      hfo: { 2025: 50, 2030: 20, 2040: 0, 2050: 0 },
      naturalGas: { 2025: 0, 2030: 100, 2040: 200, 2050: 100 },
      nuclear: { 2025: 0, 2030: 0, 2040: 0, 2050: 0 },
      interconnector: { 2025: 50, 2030: 200, 2040: 500, 2050: 800 }
    },

    generation: {
      hydro: { 2025: 800, 2030: 1200, 2040: 2100, 2050: 3200 },
      solarPV: { 2025: 100, 2030: 1000, 2040: 4000, 2050: 10000 },
      wind: { 2025: 0, 2030: 250, 2040: 2000, 2050: 3500 },
      // ... other technologies
    },

    emissions: {
      2025: 2.5,
      2030: 2.0,
      2040: 1.0,
      2050: 0.5
    },

    investment: {
      annual: { 2025: 50, 2030: 200, 2040: 300, 2050: 100 },
      cumulative: { 2025: 50, 2030: 1000, 2040: 5000, 2050: 10000 }
    }
  },

  demand: {
    total: { 2025: 1500, 2030: 2500, 2040: 5000, 2050: 8000 },
    peak: { 2025: 300, 2030: 500, 2040: 1000, 2050: 1600 },
    bySector: {
      residential: { 2025: 600, 2030: 1000, 2040: 1800, 2050: 2500 },
      commercial: { 2025: 400, 2030: 700, 2040: 1400, 2050: 2000 },
      industrial: { 2025: 400, 2030: 600, 2040: 1400, 2050: 2800 },
      transport: { 2025: 100, 2030: 200, 2040: 400, 2050: 700 }
    }
  }
};
```

---

## Constants and Configuration

### Disclaimer Text

```typescript
const DISCLAIMERS = {
  calculations: `⚠️ ILLUSTRATIVE ESTIMATES ONLY
These figures show directional impacts for discussion purposes.
They do NOT replace optimization model technical analysis.
Always verify feasibility in the full model.`,

  calculator: `⚠️ DIRECTIONAL INDICATORS ONLY
This calculator shows how changes might affect stakeholder sentiment.
It does NOT calculate technical feasibility, replace optimization outputs, or provide cost estimates.
ALWAYS verify scenario changes in the full model before presenting to stakeholders.`,

  aiEnhanced: `This response was enhanced by AI to make it more natural.
All underlying analysis is based on your scenario data.`
};
```

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  // Prediction requirement
  minPredictionLength: 20,          // Minimum characters for user prediction

  // AI settings
  aiTimeout: 3000,                  // Milliseconds before failover
  enableAI: false,                  // Disabled by default (requires API key)

  // Calculation settings
  baselineYear: 2025,               // For emissions reduction calculations
  milestoneYears: [2025, 2030, 2040, 2050],

  // UI settings
  maxStakeholdersToCompare: 3,      // Max simultaneous stakeholder views
  enableExport: true,               // Allow PDF/JSON export
  enableSharing: false,             // Disable in offline mode
};
```

---

## Type Utilities

Helpful TypeScript utilities:

```typescript
// Extract year values from scenario
type YearValue = number;
type YearRecord = Record<YearValue, number>;

// Technology types
type RenewableTech = 'hydro' | 'solarPV' | 'wind' | 'geothermal' | 'biomass';
type FossilTech = 'coal' | 'naturalGas' | 'diesel' | 'hfo';
type StorageTech = 'battery';
type AllTech = RenewableTech | FossilTech | StorageTech | 'nuclear' | 'interconnector';

// Stakeholder IDs
type StakeholderId =
  | 'policy-makers'
  | 'grid-operators'
  | 'industry'
  | 'public'
  | 'csos-ngos'
  | 'scientific'
  | 'finance'
  | 'regional-bodies'
  | 'development-partners';

// Metric paths (for concern triggers)
type MetricPath =
  | `investment.cumulative.${number}`
  | `jobs.total.${number}`
  | `emissions.reductionPercent${number}`
  | `renewableShare.${number}`
  | `supply.capacity.${AllTech}.${number}`;
```
