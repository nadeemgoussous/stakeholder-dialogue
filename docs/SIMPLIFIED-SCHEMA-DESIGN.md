# Simplified Flexible Schema Design

## Overview

This document defines a simplified, flexible data schema for the Scenario Dialogue Tool that:
- ✅ Is easy to fill manually (7-10 core indicators)
- ✅ Supports unit conversions (MW↔GW, GWh↔TWh, m$↔B$)
- ✅ Works with any model output (SPLAT, MESSAGE, OSeMOSYS, etc.)
- ✅ Handles CSV uploads with auto-aggregation
- ✅ Won't break if SPLAT format changes

## Design Principles

1. **Simplicity Over Completeness**: Capture what matters for stakeholder dialogue, not every technical detail
2. **Flexible Units**: Accept data in whatever units users have
3. **Smart Defaults**: Derive missing fields when possible
4. **Adaptability**: Schema can evolve without breaking existing data

## Core Indicators (7-10 fields per milestone year)

### 1. Installed Capacity
**What**: Total generation capacity by technology category
**Units**: MW (megawatts) or GW (gigawatts)
**Breakdown**:
- Renewables (hydro, solar, wind, geothermal, biomass combined)
- Fossil (coal, gas, diesel/HFO combined)
- Storage (batteries, pump storage combined)
- Other (nuclear, interconnectors)

**Why These**: Stakeholders care about the RE vs fossil balance, not individual technologies

### 2. Annual Generation
**What**: Electricity generation per year
**Units**: GWh (gigawatt-hours) or TWh (terawatt-hours)
**Breakdown**: Same categories as capacity

**Why**: Shows actual energy mix vs. installed capacity

### 3. RE Share
**What**: Renewable energy as % of total generation
**Units**: Percentage (0-100)
**Calculated**: (RE generation / total generation) × 100

**Why**: Single most important metric for climate goals

### 4. Total Investment
**What**: Cumulative capital investment in energy infrastructure
**Units**: millions USD (m$) or billions USD (B$)

**Why**: Financial institutions and policy makers care about total cost

### 5. Annual O&M Costs (Optional)
**What**: Operational and maintenance costs per year
**Units**: millions USD (m$) per year

**Why**: Shows ongoing financial burden

### 6. Emissions
**What**: Total CO2 emissions from electricity sector
**Units**: Mt CO2 (million tonnes)

**Why**: Climate commitments, NDCs, public health

### 7. Peak Demand
**What**: Maximum electricity demand
**Units**: MW or GW

**Why**: Grid adequacy, reliability concerns

### 8. Capacity Additions (Optional - Advanced)
**What**: New capacity installed each period
**Units**: MW or GW per period

**Why**: Deployment pace, supply chain feasibility, construction jobs

### 9. RE Curtailment (Optional - Advanced)
**What**: Renewable energy wasted due to oversupply
**Units**: GWh or TWh

**Why**: Investment efficiency, need for storage

### 10. Interconnector Imports (Optional - Advanced)
**What**: Electricity imported from neighbors
**Units**: GWh or TWh

**Why**: Energy security, regional cooperation

## Simplified TypeScript Schema

```typescript
// Core unit types
export type PowerUnit = 'MW' | 'GW';
export type EnergyUnit = 'GWh' | 'TWh';
export type MoneyUnit = 'm$' | 'B$';
export type EmissionsUnit = 'Mt CO2' | 'kt CO2';

// Flexible value with unit
export interface FlexibleValue {
  value: number;
  unit: PowerUnit | EnergyUnit | MoneyUnit | EmissionsUnit;
}

// Technology aggregations (simplified)
export interface TechnologyMix {
  renewables: number;    // All RE combined
  fossil: number;        // All fossil combined
  storage?: number;      // Batteries + pump storage
  other?: number;        // Nuclear + interconnectors
}

// Core scenario data by milestone year
export interface MilestoneData {
  year: number;

  // REQUIRED FIELDS
  capacity: {
    total: TechnologyMix;
    unit: PowerUnit;
  };

  generation: {
    output: TechnologyMix;
    unit: EnergyUnit;
  };

  reShare: number;  // Percentage (0-100)

  investment: {
    cumulative: number;  // Total investment to date
    unit: MoneyUnit;
  };

  emissions: {
    total: number;
    unit: EmissionsUnit;
  };

  peakDemand: {
    value: number;
    unit: PowerUnit;
  };

  // OPTIONAL ADVANCED FIELDS
  capacityAdditions?: {
    additions: TechnologyMix;
    unit: PowerUnit;
  };

  annualOMCosts?: {
    value: number;
    unit: MoneyUnit;
  };

  curtailment?: {
    value: number;
    unit: EnergyUnit;
  };

  imports?: {
    value: number;
    unit: EnergyUnit;
  };
}

// Complete scenario structure
export interface ScenarioInput {
  metadata: {
    country: string;
    scenarioName: string;
    modelVersion: string;  // "SPLAT", "MESSAGE", etc.
    dateCreated: string;
    sourceFile?: string;
  };

  milestones: MilestoneData[];  // Array of milestone years

  // Optional detailed breakdown (for advanced users)
  detailedTech?: {
    [year: number]: {
      hydro?: number;
      solarPV?: number;
      solarCSP?: number;
      wind?: number;
      geothermal?: number;
      biomass?: number;
      coal?: number;
      gas?: number;
      diesel?: number;
      nuclear?: number;
    };
  };
}
```

## Unit Conversion Utilities

```typescript
// Auto-convert to standard internal units (MW, GWh, m$, Mt CO2)
export function normalizeCapacity(value: number, unit: PowerUnit): number {
  return unit === 'GW' ? value * 1000 : value;
}

export function normalizeGeneration(value: number, unit: EnergyUnit): number {
  return unit === 'TWh' ? value * 1000 : value;
}

export function normalizeMoney(value: number, unit: MoneyUnit): number {
  return unit === 'B$' ? value * 1000 : value;
}

export function normalizeEmissions(value: number, unit: EmissionsUnit): number {
  return unit === 'kt CO2' ? value / 1000 : value;
}

// Reverse: display in user's preferred units
export function displayCapacity(mw: number, unit: PowerUnit): number {
  return unit === 'GW' ? mw / 1000 : mw;
}

export function displayGeneration(gwh: number, unit: EnergyUnit): number {
  return unit === 'TWh' ? gwh / 1000 : gwh;
}

// ... etc.
```

## Quick Entry Form (Simplified)

User fills out ONE form per milestone year:

```
╔══════════════════════════════════════════════════════╗
║  Milestone Year: [2030 ▼]                            ║
╠══════════════════════════════════════════════════════╣
║  Installed Capacity                                  ║
║  • Renewables: [500] [MW ▼]                          ║
║  • Fossil: [300] [MW ▼]                              ║
║  • Storage: [50] [MW ▼] (optional)                   ║
╠══════════════════════════════════════════════════════╣
║  Annual Generation                                   ║
║  • Renewables: [2500] [GWh ▼]                        ║
║  • Fossil: [1200] [GWh ▼]                            ║
║                                                      ║
║  ➜ RE Share: 67.6% (auto-calculated)                ║
╠══════════════════════════════════════════════════════╣
║  Investment & Costs                                  ║
║  • Cumulative Investment: [1200] [m$ ▼]              ║
║  • Annual O&M: [80] [m$ ▼] (optional)                ║
╠══════════════════════════════════════════════════════╣
║  Emissions & Demand                                  ║
║  • CO2 Emissions: [1.8] [Mt CO2 ▼]                   ║
║  • Peak Demand: [650] [MW ▼]                         ║
╠══════════════════════════════════════════════════════╣
║  Advanced (Optional - expand to show)                ║
║  • Capacity Additions: [100] [MW ▼]                  ║
║  • RE Curtailment: [50] [GWh ▼]                      ║
║  • Imports: [200] [GWh ▼]                            ║
╚══════════════════════════════════════════════════════╝

[+ Add Another Milestone]  [Load from CSV]
```

**Key Features**:
- Unit dropdowns for each field
- Auto-calculate RE share
- Collapsible "Advanced" section
- Can add any number of milestone years
- CSV upload button

## CSV Import Strategy

### SPLAT CSV Format
- **Structure**: Long format (one row per tech-parameter-year)
- **Challenge**: 400KB+ file, annual data, complex tech codes
- **Solution**: Auto-aggregate to milestone years and tech categories

### Import Process

1. **Auto-detect CSV structure**:
   - Check for SPLAT columns: `Technology`, `Par/Var`, `Year`, `Value`
   - Or generic columns: `Year`, `Technology`, `Capacity`, `Generation`, etc.

2. **Aggregate to milestone years**:
   - User selects: [2025] [2030] [2040] [2050]
   - Tool sums data for these years only

3. **Map technologies to categories**:
   ```typescript
   const techMapping = {
     renewables: ['hydro', 'solar', 'wind', 'geothermal', 'biomass', 'LSHY', 'LSSO', 'LSWD'],
     fossil: ['coal', 'gas', 'diesel', 'hfo', 'LSDS', 'LSNG', 'LSCL'],
     storage: ['battery', 'pump', 'LSEL.*TPS.*'],
     // Regex support for flexible matching
   };
   ```

4. **Extract parameters**:
   - `Total Capacity` → capacity.total
   - `New Capacity` → capacityAdditions (optional)
   - `Output` → generation.output
   - `CO2 Emissions` → emissions
   - `Lumpsum Investment Costs` → investment

5. **Handle missing data**:
   - If capacity additions not in CSV, derive from total capacity changes
   - If O&M not in CSV, estimate as 3% of investment
   - If curtailment not in CSV, estimate based on RE share

6. **Validate and preview**:
   - Show user: "Found 28 years, aggregating to 4 milestones"
   - Preview table of extracted data
   - Allow corrections before loading

### Example CSV Parser (Pseudocode)

```typescript
async function parseSPLATCSV(file: File, milestoneYears: number[]): Promise<ScenarioInput> {
  const rows = await parseCSV(file);

  // Detect format
  const isSPLAT = rows[0].includes('Par/Var') && rows[0].includes('Technology');

  if (isSPLAT) {
    return parseSPLATFormat(rows, milestoneYears);
  } else {
    return parseGenericFormat(rows, milestoneYears);
  }
}

function parseSPLATFormat(rows, milestoneYears) {
  const data = {};

  // Filter to milestone years only
  const filteredRows = rows.filter(r => milestoneYears.includes(parseInt(r.Year)));

  // Group by year and parameter
  for (const row of filteredRows) {
    const year = parseInt(row.Year);
    const tech = categorizeTechnology(row.Technology);
    const param = row['Par/Var'];
    const value = parseFloat(row.Value);

    if (!data[year]) data[year] = {};
    if (!data[year][tech]) data[year][tech] = {};

    if (param === 'Total Capacity') {
      data[year][tech].capacity = (data[year][tech].capacity || 0) + value;
    } else if (param === 'Output') {
      data[year][tech].generation = (data[year][tech].generation || 0) + value;
    }
    // ... etc.
  }

  // Convert to ScenarioInput format
  return buildScenario(data);
}
```

## Backward Compatibility

### Migration from Old Schema

If existing data uses the old detailed schema:

```typescript
function migrateOldSchema(old: OldScenarioInput): ScenarioInput {
  return {
    metadata: old.metadata,
    milestones: old.milestoneYears.map(year => ({
      year,
      capacity: {
        total: {
          renewables: sumRE(old.supply.capacity.total, year),
          fossil: sumFossil(old.supply.capacity.total, year),
          storage: old.supply.capacity.total.battery[year] + old.supply.capacity.total.pumpStorage[year],
        },
        unit: 'MW',
      },
      // ... map other fields
    })),
  };
}
```

## Validation Rules

1. **Required fields per milestone**:
   - capacity.total.renewables
   - capacity.total.fossil
   - generation.output.renewables
   - generation.output.fossil
   - investment.cumulative
   - emissions.total
   - peakDemand.value

2. **Consistency checks**:
   - RE share should match calculated value from generation
   - Peak demand < sum of capacity (with reasonable margin)
   - Emissions declining if RE share increasing
   - Investment cumulative (not decreasing over time)

3. **Warning thresholds**:
   - RE share > 80% without storage → warn about curtailment
   - Capacity additions > 500 MW/year → warn about deployment pace
   - Imports > 30% of demand → warn about energy security

## Benefits Summary

✅ **Easy to fill**: 7-10 fields instead of 50+ fields
✅ **Flexible units**: Users pick their preferred units
✅ **CSV compatible**: Handles SPLAT and generic formats
✅ **Adaptable**: Won't break if model format changes
✅ **Smart derivation**: Missing fields calculated when possible
✅ **Maintains core functionality**: All stakeholder responses still work
✅ **Optional depth**: Advanced users can add detailed tech breakdowns

## Next Steps

1. Implement `FlexibleScenarioInput` TypeScript interface
2. Create unit conversion utilities
3. Build simplified QuickEntryForm (7-10 fields)
4. Create CSV parser with auto-aggregation
5. Update scenarioland-baseline.json to simplified format
6. Update calculations and stakeholder logic
7. Test with actual SPLAT CSV file
