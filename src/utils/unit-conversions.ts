// Unit Conversion Utilities
// Handles flexible input units and normalizes to standard internal units

export type PowerUnit = 'MW' | 'GW' | 'kW';
export type EnergyUnit = 'GWh' | 'TWh' | 'MWh';
export type MoneyUnit = 'm$' | 'B$' | 'k$' | 'USD';
export type EmissionsUnit = 'Mt CO2' | 'kt CO2' | 't CO2';

// Standard internal units used throughout the app
export const STANDARD_UNITS = {
  power: 'MW' as PowerUnit,
  energy: 'GWh' as EnergyUnit,
  money: 'm$' as MoneyUnit,
  emissions: 'Mt CO2' as EmissionsUnit,
};

/**
 * Normalize capacity to MW (megawatts)
 */
export function normalizeCapacity(value: number, unit: PowerUnit): number {
  switch (unit) {
    case 'GW':
      return value * 1000;
    case 'kW':
      return value / 1000;
    case 'MW':
    default:
      return value;
  }
}

/**
 * Normalize generation to GWh (gigawatt-hours)
 */
export function normalizeGeneration(value: number, unit: EnergyUnit): number {
  switch (unit) {
    case 'TWh':
      return value * 1000;
    case 'MWh':
      return value / 1000;
    case 'GWh':
    default:
      return value;
  }
}

/**
 * Normalize money to millions USD (m$)
 */
export function normalizeMoney(value: number, unit: MoneyUnit): number {
  switch (unit) {
    case 'B$':
      return value * 1000;
    case 'k$':
      return value / 1000;
    case 'USD':
      return value / 1_000_000;
    case 'm$':
    default:
      return value;
  }
}

/**
 * Normalize emissions to Mt CO2 (million tonnes)
 */
export function normalizeEmissions(value: number, unit: EmissionsUnit): number {
  switch (unit) {
    case 'kt CO2':
      return value / 1000;
    case 't CO2':
      return value / 1_000_000;
    case 'Mt CO2':
    default:
      return value;
  }
}

/**
 * Display capacity in user's preferred unit
 */
export function displayCapacity(mw: number, unit: PowerUnit): number {
  switch (unit) {
    case 'GW':
      return mw / 1000;
    case 'kW':
      return mw * 1000;
    case 'MW':
    default:
      return mw;
  }
}

/**
 * Display generation in user's preferred unit
 */
export function displayGeneration(gwh: number, unit: EnergyUnit): number {
  switch (unit) {
    case 'TWh':
      return gwh / 1000;
    case 'MWh':
      return gwh * 1000;
    case 'GWh':
    default:
      return gwh;
  }
}

/**
 * Display money in user's preferred unit
 */
export function displayMoney(millions: number, unit: MoneyUnit): number {
  switch (unit) {
    case 'B$':
      return millions / 1000;
    case 'k$':
      return millions * 1000;
    case 'USD':
      return millions * 1_000_000;
    case 'm$':
    default:
      return millions;
  }
}

/**
 * Display emissions in user's preferred unit
 */
export function displayEmissions(mt: number, unit: EmissionsUnit): number {
  switch (unit) {
    case 'kt CO2':
      return mt * 1000;
    case 't CO2':
      return mt * 1_000_000;
    case 'Mt CO2':
    default:
      return mt;
  }
}

/**
 * Format number with appropriate precision for unit
 */
export function formatWithUnit(value: number, unit: PowerUnit | EnergyUnit | MoneyUnit | EmissionsUnit): string {
  let precision = 0;

  // Higher precision for smaller units
  if (unit === 'kW' || unit === 'MWh' || unit === 'k$' || unit === 't CO2') {
    precision = 0;
  } else if (unit === 'GW' || unit === 'TWh' || unit === 'B$' || unit === 'kt CO2') {
    precision = 2;
  } else {
    precision = 1;
  }

  return `${value.toFixed(precision)} ${unit}`;
}

/**
 * Auto-detect best display unit based on magnitude
 */
export function autoSelectPowerUnit(mw: number): PowerUnit {
  if (mw >= 10000) return 'GW';
  if (mw < 1) return 'kW';
  return 'MW';
}

export function autoSelectEnergyUnit(gwh: number): EnergyUnit {
  if (gwh >= 10000) return 'TWh';
  if (gwh < 1) return 'MWh';
  return 'GWh';
}

export function autoSelectMoneyUnit(millions: number): MoneyUnit {
  if (millions >= 1000) return 'B$';
  if (millions < 1) return 'k$';
  return 'm$';
}

export function autoSelectEmissionsUnit(mt: number): EmissionsUnit {
  if (mt >= 100) return 'Mt CO2';
  if (mt < 0.001) return 't CO2';
  return 'kt CO2';
}

/**
 * Smart formatting: auto-select unit and format
 */
export function smartFormatPower(mw: number): string {
  const unit = autoSelectPowerUnit(mw);
  const displayed = displayCapacity(mw, unit);
  return formatWithUnit(displayed, unit);
}

export function smartFormatEnergy(gwh: number): string {
  const unit = autoSelectEnergyUnit(gwh);
  const displayed = displayGeneration(gwh, unit);
  return formatWithUnit(displayed, unit);
}

export function smartFormatMoney(millions: number): string {
  const unit = autoSelectMoneyUnit(millions);
  const displayed = displayMoney(millions, unit);
  return formatWithUnit(displayed, unit);
}

export function smartFormatEmissions(mt: number): string {
  const unit = autoSelectEmissionsUnit(mt);
  const displayed = displayEmissions(mt, unit);
  return formatWithUnit(displayed, unit);
}
