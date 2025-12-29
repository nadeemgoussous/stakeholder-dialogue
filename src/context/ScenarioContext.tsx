import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ScenarioInput } from '../types/scenario';
import { DerivedMetrics } from '../types/derived-metrics';
import { calculateDerivedMetrics } from '../utils/calculations';
import {
  saveActiveScenario,
  loadActiveScenario,
  clearActiveScenario,
  isIndexedDBAvailable
} from '../utils/db';

interface ScenarioContextType {
  scenario: ScenarioInput | null;
  derivedMetrics: DerivedMetrics | null;
  loadScenario: (scenario: ScenarioInput) => void;
  clearScenario: () => void;
  // New: Storage status
  isLoading: boolean;
  storageAvailable: boolean;
  lastSaved: Date | null;
  saveError: string | null;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<ScenarioInput | null>(null);
  const [derivedMetrics, setDerivedMetrics] = useState<DerivedMetrics | null>(null);

  // Storage status
  const [isLoading, setIsLoading] = useState(true);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Check storage availability on mount
  useEffect(() => {
    setStorageAvailable(isIndexedDBAvailable());
  }, []);

  // Load saved scenario on mount
  useEffect(() => {
    async function loadSaved() {
      if (!isIndexedDBAvailable()) {
        setIsLoading(false);
        return;
      }

      try {
        const savedScenario = await loadActiveScenario();
        if (savedScenario) {
          setScenario(savedScenario);
          const metrics = calculateDerivedMetrics(savedScenario);
          setDerivedMetrics(metrics);
          console.log('[ScenarioContext] Loaded saved scenario:', savedScenario.metadata.scenarioName);
        }
      } catch (error) {
        console.error('[ScenarioContext] Error loading saved scenario:', error);
        // Don't show error to user - just start fresh
      } finally {
        setIsLoading(false);
      }
    }

    loadSaved();
  }, []);

  // Auto-save scenario when it changes
  useEffect(() => {
    async function autoSave() {
      if (!scenario || !isIndexedDBAvailable()) return;

      try {
        await saveActiveScenario(scenario);
        setLastSaved(new Date());
        setSaveError(null);
        console.log('[ScenarioContext] Auto-saved scenario:', scenario.metadata.scenarioName);
      } catch (error) {
        console.error('[ScenarioContext] Error auto-saving scenario:', error);
        setSaveError('Failed to save scenario to local storage');
        // Don't throw - auto-save should fail silently
      }
    }

    // Debounce: wait 500ms after last change before saving
    const timeoutId = setTimeout(autoSave, 500);
    return () => clearTimeout(timeoutId);
  }, [scenario]);

  const loadScenario = useCallback((newScenario: ScenarioInput) => {
    setScenario(newScenario);
    const metrics = calculateDerivedMetrics(newScenario);
    setDerivedMetrics(metrics);
    setSaveError(null);
  }, []);

  const clearScenario = useCallback(async () => {
    setScenario(null);
    setDerivedMetrics(null);
    setLastSaved(null);
    setSaveError(null);

    // Also clear from IndexedDB
    if (isIndexedDBAvailable()) {
      try {
        await clearActiveScenario();
        console.log('[ScenarioContext] Cleared saved scenario');
      } catch (error) {
        console.error('[ScenarioContext] Error clearing saved scenario:', error);
        // Fail silently
      }
    }
  }, []);

  return (
    <ScenarioContext.Provider
      value={{
        scenario,
        derivedMetrics,
        loadScenario,
        clearScenario,
        isLoading,
        storageAvailable,
        lastSaved,
        saveError
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
}
