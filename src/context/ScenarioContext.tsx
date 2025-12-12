import { createContext, useContext, useState, ReactNode } from 'react';
import { ScenarioInput } from '../types/scenario';
import { DerivedMetrics } from '../types/derived-metrics';
import { calculateDerivedMetrics } from '../utils/calculations';

interface ScenarioContextType {
  scenario: ScenarioInput | null;
  derivedMetrics: DerivedMetrics | null;
  loadScenario: (scenario: ScenarioInput) => void;
  clearScenario: () => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<ScenarioInput | null>(null);
  const [derivedMetrics, setDerivedMetrics] = useState<DerivedMetrics | null>(null);

  const loadScenario = (newScenario: ScenarioInput) => {
    setScenario(newScenario);
    const metrics = calculateDerivedMetrics(newScenario);
    setDerivedMetrics(metrics);
  };

  const clearScenario = () => {
    setScenario(null);
    setDerivedMetrics(null);
  };

  return (
    <ScenarioContext.Provider value={{ scenario, derivedMetrics, loadScenario, clearScenario }}>
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
