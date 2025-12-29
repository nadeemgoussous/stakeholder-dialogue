// IndexedDB Database using Dexie.js
// F033: Offline storage for scenarios

import Dexie, { Table } from 'dexie';
import { ScenarioInput } from '../types/scenario';

// Stored scenario with additional metadata
export interface StoredScenario {
  id?: number;                    // Auto-incremented primary key
  scenarioData: ScenarioInput;    // Full scenario data
  lastModified: Date;             // When scenario was last saved
  isActive: boolean;              // Currently active scenario (only one should be true)
}

// User predictions stored separately for pedagogy tracking
export interface StoredPrediction {
  id?: number;
  scenarioId: number;             // Links to StoredScenario
  stakeholderId: string;          // Which stakeholder
  predictionText: string;         // User's prediction
  timestamp: Date;
}

// App settings (e.g., AI preferences, UI state)
export interface AppSettings {
  key: string;                    // Setting key (primary)
  value: string | number | boolean | object;
  lastModified: Date;
}

class ScenarioDatabase extends Dexie {
  scenarios!: Table<StoredScenario, number>;
  predictions!: Table<StoredPrediction, number>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('ScenarioDialogueDB');

    // Schema definition
    this.version(1).stores({
      // Scenarios: auto-increment id, index on isActive and lastModified
      scenarios: '++id, isActive, lastModified',
      // Predictions: auto-increment id, index on scenarioId and stakeholderId
      predictions: '++id, scenarioId, stakeholderId, timestamp',
      // Settings: key is primary key
      settings: 'key, lastModified'
    });
  }
}

// Singleton database instance
export const db = new ScenarioDatabase();

// ========================================
// SCENARIO OPERATIONS
// ========================================

/**
 * Save or update the active scenario
 * Only one scenario can be active at a time
 */
export async function saveActiveScenario(scenario: ScenarioInput): Promise<number> {
  try {
    // Check if we have an existing active scenario to update
    const existing = await db.scenarios.where('isActive').equals(1).first();

    if (existing?.id) {
      // Update existing scenario
      await db.scenarios.update(existing.id, {
        scenarioData: scenario,
        lastModified: new Date(),
        isActive: true
      });
      return existing.id;
    } else {
      // Deactivate any other scenarios first
      await db.scenarios.toCollection().modify({ isActive: false });

      // Create new active scenario
      return await db.scenarios.add({
        scenarioData: scenario,
        lastModified: new Date(),
        isActive: true
      });
    }
  } catch (error) {
    console.error('[DB] Error saving scenario:', error);
    throw error;
  }
}

/**
 * Load the active scenario (if any)
 */
export async function loadActiveScenario(): Promise<ScenarioInput | null> {
  try {
    // Try to find active scenario - check both boolean true and number 1
    // (Dexie may store booleans as numbers in some cases)
    let active = await db.scenarios.where('isActive').equals(true as unknown as number).first();

    // Fallback: get all scenarios and find active one
    if (!active) {
      const all = await db.scenarios.toArray();
      active = all.find(s => s.isActive === true || (s.isActive as unknown) === 1);
    }

    console.log('[DB] Loaded active scenario:', active?.scenarioData?.metadata?.scenarioName || 'none');
    return active?.scenarioData || null;
  } catch (error) {
    console.error('[DB] Error loading active scenario:', error);
    return null;
  }
}

/**
 * Clear the active scenario
 */
export async function clearActiveScenario(): Promise<void> {
  try {
    await db.scenarios.where('isActive').equals(1).modify({ isActive: false });
  } catch (error) {
    console.error('[DB] Error clearing active scenario:', error);
    throw error;
  }
}

/**
 * Get all saved scenarios (for history/management)
 */
export async function getAllScenarios(): Promise<StoredScenario[]> {
  try {
    return await db.scenarios.orderBy('lastModified').reverse().toArray();
  } catch (error) {
    console.error('[DB] Error getting all scenarios:', error);
    return [];
  }
}

/**
 * Delete a specific scenario by ID
 */
export async function deleteScenario(id: number): Promise<void> {
  try {
    await db.scenarios.delete(id);
    // Also delete associated predictions
    await db.predictions.where('scenarioId').equals(id).delete();
  } catch (error) {
    console.error('[DB] Error deleting scenario:', error);
    throw error;
  }
}

// ========================================
// PREDICTION OPERATIONS
// ========================================

/**
 * Save a user prediction
 */
export async function savePrediction(
  scenarioId: number,
  stakeholderId: string,
  predictionText: string
): Promise<number> {
  try {
    return await db.predictions.add({
      scenarioId,
      stakeholderId,
      predictionText,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('[DB] Error saving prediction:', error);
    throw error;
  }
}

/**
 * Get predictions for a scenario
 */
export async function getPredictions(scenarioId: number): Promise<StoredPrediction[]> {
  try {
    return await db.predictions.where('scenarioId').equals(scenarioId).toArray();
  } catch (error) {
    console.error('[DB] Error getting predictions:', error);
    return [];
  }
}

// ========================================
// SETTINGS OPERATIONS
// ========================================

/**
 * Save an app setting
 */
export async function saveSetting(key: string, value: string | number | boolean | object): Promise<void> {
  try {
    await db.settings.put({
      key,
      value,
      lastModified: new Date()
    });
  } catch (error) {
    console.error('[DB] Error saving setting:', error);
    throw error;
  }
}

/**
 * Get an app setting
 */
export async function getSetting<T>(key: string): Promise<T | null> {
  try {
    const setting = await db.settings.get(key);
    return setting?.value as T || null;
  } catch (error) {
    console.error('[DB] Error getting setting:', error);
    return null;
  }
}

// ========================================
// DATABASE UTILITIES
// ========================================

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Get database storage estimate (if available)
 */
export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Clear all data (for testing or reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    await db.scenarios.clear();
    await db.predictions.clear();
    await db.settings.clear();
  } catch (error) {
    console.error('[DB] Error clearing all data:', error);
    throw error;
  }
}
