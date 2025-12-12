# SPLAT CSV Analysis & Schema Comparison

## Overview

This document analyzes the actual SPLAT output CSV structure (Lesotho TES example) and compares it with our current data schema to identify necessary updates.

## SPLAT CSV Structure

### Format
- **Format**: Long-format CSV (one row per technology-parameter-year combination)
- **Columns**: 21 columns including:
  - Scenario, PowerPool identifiers
  - Country (Exporting, Importing, Gx)
  - Technology (code + description)
  - Technology groupings (TechSetL0, L1, L2)
  - Parameter/Variable type
  - OutputCom (commodity/sector)
  - Year, Activity, Value, Unit
  - Source metadata

### Available Parameters/Variables

From the CSV, SPLAT outputs include:

1. **Capacity Metrics**:
   - `Total Capacity` (MW)
   - `New Capacity` (MW) - capacity additions
   - `Capacity Factor` (dimensionless, 0-1)
   - `Utilization Factor` (dimensionless, 0-1)

2. **Generation/Activity**:
   - `Output` (GWh for electricity, TJ for fuels)

3. **Emissions**:
   - `CO2 Emissions` (likely Mt CO2)
   - `RE Curtailment` (GWh of renewable energy curtailed)

4. **Costs** (all in m$ = millions USD):
   - `Annualized Investment Costs`
   - `Lumpsum Investment Costs` (upfront capex)
   - `Fixed O&M Costs`
   - `Variable Costs`
   - `Fuel Costs`

### Technologies in Example

**Renewable Energy**:
- Large Hydro (existing Muela I, candidate Muela II)
- Solar PV (utility scale, zonal)
- Solar CSP with 6hr storage
- Wind (zonal - multiple zones)
- Pump Storage (Kobong)

**Fossil**:
- Diesel generation (centralized)
- Diesel fuel imports

**Infrastructure**:
- Transmission
- Distribution (urban, rural, commerce, industry)
- Electricity imports/exports

**Demand**:
- SentOut Demand (total system demand)

### OutputCom (Sectors/Commodities)

- `Electricity/Secondary` - electricity generation
- `Oil/Primary` - diesel fuel
- `Hydro/Primary` - hydro resource
- `Solar/Primary` - solar resource
- `Wind/Primary` - wind resource
- `Industry/Tertiary` - industrial demand
- Various other demand sectors

## Current Schema vs SPLAT Reality

### ✅ What We Have Correctly

1. **Milestone Years Approach** - Good! SPLAT outputs annual data but we can filter to milestone years
2. **Technology Categories** - Match well (hydro, solar, wind, fossil, storage)
3. **Emissions Tracking** - Available in SPLAT
4. **Investment Data** - Available (need to aggregate annualized + lumpsum)
5. **Demand Data** - Available by sector

### ⚠️ What Needs Updating

#### 1. **Investment Data Structure**

**Current Schema**:
```typescript
investment: {
  annual: Record<number, number>;      // USD millions by year
  cumulative: Record<number, number>;  // USD millions by year
}
```

**SPLAT Reality**:
- Provides `Annualized Investment Costs` (annual O&M equivalent of capex)
- Provides `Lumpsum Investment Costs` (actual upfront capex)
- Provides `Fixed O&M Costs` and `Variable Costs` separately
- Does NOT provide pre-calculated cumulative totals

**Recommended Change**:
```typescript
costs: {
  investmentAnnualized: Record<number, number>;  // m$ by year (from SPLAT)
  investmentLumpsum: Record<number, number>;     // m$ by year (actual capex)
  fixedOM: Record<number, number>;               // m$ by year
  variableOM: Record<number, number>;            // m$ by year
  fuel: Record<number, number>;                  // m$ by year
  // Derived (calculated by us for display):
  totalAnnualCost: Record<number, number>;
  cumulativeInvestment: Record<number, number>;
}
```

#### 2. **Capacity Structure - Missing New Capacity**

**Current Schema**:
```typescript
capacity: {
  hydro: Record<number, number>;  // Total capacity only
  solarPV: Record<number, number>;
  // etc.
}
```

**SPLAT Reality**:
- Provides both `Total Capacity` AND `New Capacity` (additions)
- New capacity is CRUCIAL for stakeholder analysis:
  - Construction jobs depend on NEW capacity
  - Deployment pace concerns (too fast = supply chain issues)
  - Investment timing

**Recommended Change**:
```typescript
capacity: {
  total: {
    hydro: Record<number, number>;
    solarPV: Record<number, number>;
    wind: Record<number, number>;
    // etc.
  };
  additions: {  // NEW - capacity added each year
    hydro: Record<number, number>;
    solarPV: Record<number, number>;
    wind: Record<number, number>;
    // etc.
  };
}
```

#### 3. **Generation Detail - Capacity Factors**

**Current Schema**:
```typescript
generation: Record<string, Record<number, number>>;  // GWh by technology and year
```

**SPLAT Provides**:
- `Output` (generation in GWh)
- `Capacity Factor` (actual utilization)
- `Utilization Factor` (technical availability)

**Why This Matters**:
- Low capacity factors for base-load fossil = inefficient operation
- High capacity factors for renewables = good resource quality
- Grid operators care about this!

**Recommended Addition**:
```typescript
generation: {
  output: Record<string, Record<number, number>>;      // GWh by tech and year
  capacityFactor: Record<string, Record<number, number>>; // 0-1 by tech and year (optional)
}
```

#### 4. **RE Curtailment**

**Current Schema**: Not included

**SPLAT Provides**: `RE Curtailment` (GWh of renewable energy wasted)

**Why This Matters**:
- High curtailment = oversupply, wasted investment
- Grid operators and financial institutions care deeply
- Indicates need for storage or transmission

**Recommended Addition**:
```typescript
supply: {
  // ... existing fields
  curtailment: Record<number, number>;  // GWh of RE curtailed by year
}
```

#### 5. **Technology Mapping Challenges**

**SPLAT Uses**:
- Zone-specific technologies (Wind Zone 001, Wind Zone 002)
- Technology variants (Diesel centralized, Solar CSP with storage)
- Infrastructure technologies (T&D, imports)

**Our Schema**:
- Simple aggregated categories (hydro, solarPV, wind, etc.)

**Recommendation**:
- Keep simple aggregated categories for user input
- Add `technologyDetails` optional field for advanced users:

```typescript
technologyDetails?: {
  [techKey: string]: {
    zones?: string[];              // Geographic zones
    storageHours?: number;         // For CSP or batteries
    powerPoolImports?: number;     // MW of interconnector capacity
  };
}
```

### 📊 Emission Data

**Current**: Simple emissions by year
**SPLAT**: Provides CO2 emissions by technology and fuel type

**Recommendation**: Keep current simplified approach (total emissions by year) but optionally allow:

```typescript
emissions: {
  total: Record<number, number>;  // Mt CO2 by year (main field)
  byTechnology?: Record<string, Record<number, number>>;  // Optional detail
}
```

## Recommended Updated Schema

### Complete Updated ScenarioInput Interface

```typescript
export interface ScenarioInput {
  metadata: {
    country: string;
    scenarioName: string;
    modelVersion: string;       // "SPLAT", "MESSAGE", "OSeMOSYS", etc.
    dateCreated: string;
    sourceFile?: string;        // Original CSV filename
  };

  milestoneYears: number[];     // e.g., [2025, 2030, 2040, 2050]

  supply: {
    capacity: {
      // Total installed capacity by year (MW)
      total: {
        hydro: Record<number, number>;
        solarPV: Record<number, number>;
        solarCSP: Record<number, number>;      // NEW - separate from PV
        wind: Record<number, number>;
        battery: Record<number, number>;
        pumpStorage: Record<number, number>;   // NEW - separate from battery
        geothermal: Record<number, number>;
        biomass: Record<number, number>;
        coal: Record<number, number>;
        diesel: Record<number, number>;
        hfo: Record<number, number>;
        naturalGas: Record<number, number>;
        nuclear: Record<number, number>;
        interconnector: Record<number, number>;
        totalInstalled?: number;               // Convenience field
      };

      // NEW - Capacity additions each year (MW)
      additions: {
        hydro: Record<number, number>;
        solarPV: Record<number, number>;
        solarCSP: Record<number, number>;
        wind: Record<number, number>;
        battery: Record<number, number>;
        pumpStorage: Record<number, number>;
        geothermal: Record<number, number>;
        biomass: Record<number, number>;
        coal: Record<number, number>;
        diesel: Record<number, number>;
        hfo: Record<number, number>;
        naturalGas: Record<number, number>;
        nuclear: Record<number, number>;
        interconnector: Record<number, number>;
      };
    };

    generation: {
      // Generation output (GWh)
      output: {
        hydro: Record<number, number>;
        solarPV: Record<number, number>;
        solarCSP: Record<number, number>;
        wind: Record<number, number>;
        battery: Record<number, number>;  // Discharge
        pumpStorage: Record<number, number>;
        geothermal: Record<number, number>;
        biomass: Record<number, number>;
        coal: Record<number, number>;
        diesel: Record<number, number>;
        hfo: Record<number, number>;
        naturalGas: Record<number, number>;
        nuclear: Record<number, number>;
        imports: Record<number, number>;
        totalGeneration?: number;  // Convenience
      };

      // Optional - capacity factors (0-1)
      capacityFactor?: Record<string, Record<number, number>>;
    };

    emissions: {
      total: Record<number, number>;  // Mt CO2 by year
      byTechnology?: Record<string, Record<number, number>>;  // Optional detail
    };

    curtailment?: Record<number, number>;  // GWh of RE curtailed by year

    costs: {
      // From SPLAT columns
      investmentAnnualized: Record<number, number>;  // m$ (annualized capex)
      investmentLumpsum: Record<number, number>;     // m$ (actual capex)
      fixedOM: Record<number, number>;               // m$
      variableOM: Record<number, number>;            // m$
      fuel: Record<number, number>;                  // m$

      // Derived (calculated for convenience)
      totalAnnualCost?: Record<number, number>;
      cumulativeInvestment?: Record<number, number>;
    };

    // Optional advanced detail
    technologyDetails?: {
      [techKey: string]: {
        zones?: string[];
        storageHours?: number;
        capacityFactorTarget?: number;
      };
    };
  };

  demand: {
    total: Record<number, number>;   // GWh by year
    peak: Record<number, number>;    // MW by year
    bySector?: {                     // Optional
      residential: Record<number, number>;
      commercial: Record<number, number>;
      industrial: Record<number, number>;
      transport: Record<number, number>;
      agriculture?: Record<number, number>;
    };
  };
}
```

### Updated QuickScenarioInput

For the quick entry form, keep it simple but update to match:

```typescript
export interface QuickScenarioInput {
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

  // NEW - Deployment pace (MW/year average)
  annualRenewableAdditions?: number;  // Helps assess feasibility

  // Costs (millions USD)
  totalInvestment2030: number;
  totalInvestment2050: number;
  annualOperatingCost2030?: number;   // NEW - from SPLAT Fixed + Variable O&M

  // Emissions
  emissions2025: number;  // Mt CO2
  emissions2030: number;
  emissions2050: number;

  // Demand
  peakDemand2030: number;
  peakDemand2040: number;

  // NEW - Optional curtailment
  reCurtailment2030?: number;  // GWh
  reCurtailment2040?: number;
}
```

## CSV Import Strategy

### Option 1: Simplified Aggregation (Recommended for MVP)

1. User uploads SPLAT CSV
2. Tool aggregates by milestone years (2025, 2030, 2040, 2050)
3. Sums technologies into our categories:
   - All solar → `solarPV` + `solarCSP`
   - All wind zones → `wind`
   - All hydro → `hydro` (or split large/small)
4. Extracts key parameters only:
   - Total Capacity
   - New Capacity (for jobs calculation)
   - Output (generation)
   - CO2 Emissions
   - Investment costs (lumpsum for capex)

### Option 2: Full Detail (Future Enhancement)

1. Import all SPLAT parameters
2. Preserve zone-level detail
3. Allow users to explore capacity factors, costs by technology
4. Advanced stakeholder responses based on utilization rates

## Impact on Stakeholder Responses

### Key Updates Needed

1. **Construction Jobs** → Now use `additions` instead of total capacity
2. **Deployment Pace Concerns** → Check annual additions vs. supply chain capacity
3. **Cost Analysis** → Use lumpsum investment for financial concerns
4. **Curtailment Triggers** → New concern for high RE + low storage scenarios
5. **Capacity Factor Concerns** → Grid operators check if fossil plants underutilized

### New Concern Triggers

```typescript
// Grid Operators - RE Curtailment
{
  metric: 'supply.curtailment',
  threshold: { value: 100, operator: '>' },  // > 100 GWh curtailed
  concernText: 'Significant renewable energy curtailment indicates oversupply...'
}

// Financial Institutions - Rapid Deployment
{
  metric: 'supply.capacity.additions.solarPV',
  threshold: { value: 500, operator: '>' },  // > 500 MW/year additions
  concernText: 'Very rapid deployment may strain supply chains and financing...'
}

// Grid Operators - Low Capacity Factor Base-load
{
  metric: 'supply.generation.capacityFactor.coal',
  threshold: { value: 0.3, operator: '<' },  // < 30% capacity factor
  concernText: 'Base-load plants running at low capacity factors are inefficient...'
}
```

## Implementation Priority

### Phase 1: Critical Updates (Do Now)
1. ✅ Add `capacity.additions` structure
2. ✅ Update `costs` structure to match SPLAT reality
3. ✅ Add `curtailment` field
4. ✅ Separate `solarCSP` from `solarPV`
5. ✅ Separate `pumpStorage` from `battery`

### Phase 2: Enhanced Analysis (Soon)
1. Add capacity factor tracking
2. Implement curtailment-based concerns
3. Update jobs calculation to use `additions` not total capacity
4. Add deployment pace concern triggers

### Phase 3: Full Integration (Later)
1. Build CSV import tool
2. Technology aggregation logic
3. Zone-level detail preservation
4. Advanced cost breakdowns

## Conclusion

The SPLAT CSV provides MUCH more detail than our current schema captures. Key takeaways:

1. **We need `capacity.additions`** - crucial for jobs and deployment pace analysis
2. **Cost structure is complex** - separate lumpsum vs. annualized vs. O&M
3. **Curtailment data available** - important indicator we're missing
4. **Capacity factors matter** - for financial and operational analysis
5. **Annual data is fine** - but milestone year filtering is reasonable simplification

**Recommendation**: Implement Phase 1 updates immediately, as they affect core stakeholder response accuracy.
