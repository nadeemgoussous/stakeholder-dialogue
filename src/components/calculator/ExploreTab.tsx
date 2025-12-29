import { useState, useMemo } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import DirectionalImpacts from './DirectionalImpacts';
import SentimentChanges from './SentimentChanges';
import { Tooltip } from '../common/Tooltip';

/**
 * ExploreTab Component - F023
 *
 * Provides directional sliders for exploring scenario parameter adjustments.
 * Shows DIRECTIONAL impacts only (not precise calculations).
 *
 * Critical: Does NOT recalculate technical/economic feasibility.
 * This is for exploring stakeholder sentiment changes, not model outputs.
 */

interface AdjustmentState {
  reShare2030: number;    // % renewable energy share in 2030
  reShare2040: number;    // % renewable energy share in 2040
  coalPhaseout: number;   // Year of coal phaseout
}

export default function ExploreTab() {
  const { scenario } = useScenario();

  // Calculate base values from scenario
  const baseValues = useMemo(() => {
    if (!scenario) return null;

    // Get milestone years from new schema
    const milestoneYears = scenario.milestones.map(m => m.year);

    // Find milestones closest to 2030 and 2040 for sliders
    const milestone2030 = scenario.milestones.find(m => m.year === 2030) ||
                          scenario.milestones.find(m => m.year >= 2030) ||
                          scenario.milestones[Math.floor(scenario.milestones.length / 2)]; // midpoint if no 2030

    const milestone2040 = scenario.milestones.find(m => m.year === 2040) ||
                          scenario.milestones.find(m => m.year >= 2040) ||
                          scenario.milestones[scenario.milestones.length - 1]; // last if no 2040

    // Get RE share from milestones (already calculated)
    const reShare2030 = milestone2030 ? Math.round(milestone2030.reShare) : 0;
    const reShare2040 = milestone2040 ? Math.round(milestone2040.reShare) : 0;

    // Estimate coal phaseout year based on fossil capacity decline
    // In new schema, we only have aggregated fossil (coal + gas + diesel + HFO)
    // So we estimate based on when fossil capacity becomes minimal
    const coalPhaseout = (() => {
      // Look for significant drop in fossil capacity share
      for (let i = milestoneYears.length - 1; i >= 0; i--) {
        const milestone = scenario.milestones[i];
        const totalCapacity = milestone.capacity.total.renewables +
                             milestone.capacity.total.fossil +
                             (milestone.capacity.total.storage || 0) +
                             (milestone.capacity.total.other || 0);

        const fossilShare = totalCapacity > 0 ? (milestone.capacity.total.fossil / totalCapacity) * 100 : 0;

        // If fossil still >10% of capacity, coal likely still present
        if (fossilShare > 10) {
          return milestone.year < 2050 ? milestone.year + 5 : 2050;
        }
      }
      // Fossil minimal from first year
      return milestoneYears[0];
    })();

    return { reShare2030, reShare2040, coalPhaseout };
  }, [scenario]);

  // State for adjusted values
  const [adjustments, setAdjustments] = useState<AdjustmentState | null>(null);

  // Use adjusted values if set, otherwise use base values
  const currentValues = adjustments || baseValues;

  if (!scenario) {
    return (
      <div className="card max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-irena-blue">
          Explore Impacts
        </h2>
        <p className="text-gray-600 mb-6">
          Explore how adjusting key scenario parameters might directionally affect stakeholder sentiment.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800">
          <p className="font-semibold">⚠️ No Scenario Loaded</p>
          <p className="text-sm mt-2">
            Please load a scenario from the Input tab before exploring impacts.
          </p>
        </div>
      </div>
    );
  }

  if (!baseValues) {
    return (
      <div className="card max-w-4xl mx-auto text-center">
        <p className="text-gray-600">Loading scenario data...</p>
      </div>
    );
  }

  const handleReShare2030Change = (value: number) => {
    setAdjustments({
      reShare2030: value,
      reShare2040: currentValues?.reShare2040 || baseValues.reShare2040,
      coalPhaseout: currentValues?.coalPhaseout || baseValues.coalPhaseout,
    });
  };

  const handleReShare2040Change = (value: number) => {
    setAdjustments({
      reShare2030: currentValues?.reShare2030 || baseValues.reShare2030,
      reShare2040: value,
      coalPhaseout: currentValues?.coalPhaseout || baseValues.coalPhaseout,
    });
  };

  const handleCoalPhaseoutChange = (value: number) => {
    setAdjustments({
      reShare2030: currentValues?.reShare2030 || baseValues.reShare2030,
      reShare2040: currentValues?.reShare2040 || baseValues.reShare2040,
      coalPhaseout: value,
    });
  };

  const handleReset = () => {
    setAdjustments(null);
  };

  const hasAdjustments = adjustments !== null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-irena-blue">
          Explore Impacts
        </h2>
        <p className="text-gray-600 mb-4">
          Use the sliders below to explore how adjusting key scenario parameters might directionally affect stakeholder sentiment.
          This tool shows <strong>directional trends only</strong>, not precise calculations.
        </p>

        {/* Prominent Disclaimer */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-4">
          <p className="font-bold text-amber-900 text-lg mb-2">⚠️ DIRECTIONAL INDICATORS ONLY</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            These adjustments show <strong>directional impacts</strong> for discussion purposes only.
            They do <strong>NOT</strong> recalculate technical feasibility, grid reliability, or economic viability.
            Always verify changes in your full energy system optimization model (MESSAGE, OSeMOSYS, LEAP, SPLAT).
          </p>
        </div>
      </div>

      {/* Adjustable Parameters */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Adjustable Parameters</h3>

        <div className="space-y-8">
          {/* RE Share 2030 Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="re-share-2030" className="font-medium text-gray-700">
                <Tooltip content="renewable_share">
                  <span>Renewable Energy Share 2030</span>
                </Tooltip>
              </label>
              <div className="text-right">
                <span className="text-sm text-gray-500">Base: {baseValues.reShare2030}%</span>
                {hasAdjustments && currentValues && (
                  <span className="ml-3 text-lg font-semibold text-irena-blue">
                    → {currentValues.reShare2030}%
                  </span>
                )}
              </div>
            </div>
            <input
              id="re-share-2030"
              type="range"
              min="0"
              max="100"
              step="5"
              value={currentValues?.reShare2030 || baseValues.reShare2030}
              onChange={(e) => handleReShare2030Change(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-irena"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* RE Share 2040 Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="re-share-2040" className="font-medium text-gray-700">
                <Tooltip content="renewable_share">
                  <span>Renewable Energy Share 2040</span>
                </Tooltip>
              </label>
              <div className="text-right">
                <span className="text-sm text-gray-500">Base: {baseValues.reShare2040}%</span>
                {hasAdjustments && currentValues && (
                  <span className="ml-3 text-lg font-semibold text-irena-blue">
                    → {currentValues.reShare2040}%
                  </span>
                )}
              </div>
            </div>
            <input
              id="re-share-2040"
              type="range"
              min="0"
              max="100"
              step="5"
              value={currentValues?.reShare2040 || baseValues.reShare2040}
              onChange={(e) => handleReShare2040Change(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-irena"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Coal Phaseout Year Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="coal-phaseout" className="font-medium text-gray-700">
                <Tooltip content="coal" isGlossaryKey={true}>
                  <span>Coal Phaseout Year</span>
                </Tooltip>
              </label>
              <div className="text-right">
                <span className="text-sm text-gray-500">Base: {baseValues.coalPhaseout}</span>
                {hasAdjustments && currentValues && (
                  <span className="ml-3 text-lg font-semibold text-irena-blue">
                    → {currentValues.coalPhaseout}
                  </span>
                )}
              </div>
            </div>
            <input
              id="coal-phaseout"
              type="range"
              min="2025"
              max="2050"
              step="5"
              value={currentValues?.coalPhaseout || baseValues.coalPhaseout}
              onChange={(e) => handleCoalPhaseoutChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-irena"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2025</span>
              <span>2035</span>
              <span>2050+</span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        {hasAdjustments && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              ← Reset to Base Scenario
            </button>
          </div>
        )}
      </div>

      {/* Directional Impacts (F024) */}
      {hasAdjustments && currentValues ? (
        <>
          <DirectionalImpacts
            baseValues={baseValues}
            adjustedValues={currentValues}
          />
          {/* Stakeholder Sentiment Changes (F025) */}
          <SentimentChanges
            baseValues={baseValues}
            adjustedValues={currentValues}
          />
        </>
      ) : (
        <div className="card bg-gray-50">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Directional Impacts</h3>
          <p className="text-gray-600 mb-4">
            Adjust parameters above to see directional impacts on jobs, land use, emissions, and stakeholder sentiment.
          </p>
        </div>
      )}
    </div>
  );
}
