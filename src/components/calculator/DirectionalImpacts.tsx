/**
 * DirectionalImpacts Component - F024
 *
 * Displays DIRECTIONAL indicators only (NOT precise calculations).
 * Shows how adjustments affect jobs, land use, emissions, and stakeholder sentiment
 * RELATIVE TO THE BASE SCENARIO.
 *
 * Critical: This is about directional changes, not exact numbers.
 */

interface DirectionalImpactsProps {
  baseValues: {
    reShare2030: number;
    reShare2040: number;
    coalPhaseout: number;
  };
  adjustedValues: {
    reShare2030: number;
    reShare2040: number;
    coalPhaseout: number;
  };
}

type Direction = 'increase' | 'decrease' | 'unchanged';
type Magnitude = 'minimal' | 'moderate' | 'significant';

interface Impact {
  direction: Direction;
  magnitude: Magnitude;
  explanation: string;
}

export default function DirectionalImpacts({ baseValues, adjustedValues }: DirectionalImpactsProps) {
  // Calculate directional impacts
  const impacts = calculateDirectionalImpacts(baseValues, adjustedValues);

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Directional Impacts</h3>
      <p className="text-sm text-gray-600 mb-6">
        These indicators show <strong>directional trends only</strong> relative to your base scenario.
        They are meant to spark discussion, not replace detailed analysis.
      </p>

      {/* Impact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Jobs Impact */}
        <ImpactCard
          title="Jobs"
          impact={impacts.jobs}
          color="blue"
        />

        {/* Land Use Impact */}
        <ImpactCard
          title="Land Use"
          impact={impacts.landUse}
          color="green"
        />

        {/* Emissions Impact */}
        <ImpactCard
          title="Emissions"
          impact={impacts.emissions}
          color="purple"
        />
      </div>

      {/* Explanatory Note */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 How to Use These Indicators</p>
        <p>
          These directional indicators help you anticipate how stakeholders might respond to adjustments.
          Use them to prepare for dialogue, not as precise predictions.
        </p>
      </div>
    </div>
  );
}

/**
 * Individual Impact Card Component
 */
interface ImpactCardProps {
  title: string;
  impact: Impact;
  color: 'blue' | 'green' | 'purple';
}

function ImpactCard({ title, impact, color }: ImpactCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      icon: 'text-purple-600'
    }
  };

  const colors = colorClasses[color];

  const directionIcon = {
    increase: '↑',
    decrease: '↓',
    unchanged: '→'
  };

  const directionLabel = {
    increase: 'Increase',
    decrease: 'Decrease',
    unchanged: 'Unchanged'
  };

  const magnitudeLabel = {
    minimal: 'Minimal',
    moderate: 'Moderate',
    significant: 'Significant'
  };

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
      <h4 className={`font-semibold ${colors.text} mb-3`}>{title}</h4>

      {/* Direction and Magnitude */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-3xl ${colors.icon}`}>
          {directionIcon[impact.direction]}
        </span>
        <div>
          <div className={`font-medium ${colors.text}`}>
            {directionLabel[impact.direction]}
          </div>
          <div className={`text-xs ${colors.text} opacity-75`}>
            {magnitudeLabel[impact.magnitude]}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <p className={`text-sm ${colors.text} leading-relaxed`}>
        {impact.explanation}
      </p>
    </div>
  );
}

/**
 * Calculate Directional Impacts
 *
 * This function determines HOW adjustments affect key metrics directionally.
 * It does NOT calculate exact numbers - only direction and magnitude.
 */
function calculateDirectionalImpacts(
  base: { reShare2030: number; reShare2040: number; coalPhaseout: number },
  adjusted: { reShare2030: number; reShare2040: number; coalPhaseout: number }
): {
  jobs: Impact;
  landUse: Impact;
  emissions: Impact;
} {
  // Calculate deltas
  const reShareDelta2030 = adjusted.reShare2030 - base.reShare2030;
  const reShareDelta2040 = adjusted.reShare2040 - base.reShare2040;
  const coalPhaseoutDelta = adjusted.coalPhaseout - base.coalPhaseout;

  // Jobs Impact
  // More renewables = more construction jobs (solar/wind are labor-intensive)
  // Earlier coal phaseout = fewer fossil fuel jobs but more renewable jobs
  const jobsImpact = (() => {
    const totalREIncrease = reShareDelta2030 + reShareDelta2040;

    if (totalREIncrease > 20) {
      return {
        direction: 'increase' as Direction,
        magnitude: 'significant' as Magnitude,
        explanation: 'Higher renewable capacity typically creates substantial construction jobs and operational positions.'
      };
    } else if (totalREIncrease > 5) {
      return {
        direction: 'increase' as Direction,
        magnitude: 'moderate' as Magnitude,
        explanation: 'Moderate increase in renewable capacity creates additional jobs in construction and operations.'
      };
    } else if (totalREIncrease < -20) {
      return {
        direction: 'decrease' as Direction,
        magnitude: 'significant' as Magnitude,
        explanation: 'Lower renewable capacity reduces job creation potential in the clean energy sector.'
      };
    } else if (totalREIncrease < -5) {
      return {
        direction: 'decrease' as Direction,
        magnitude: 'moderate' as Magnitude,
        explanation: 'Reduced renewable deployment creates fewer new jobs than the base scenario.'
      };
    } else {
      return {
        direction: 'unchanged' as Direction,
        magnitude: 'minimal' as Magnitude,
        explanation: 'Job creation potential remains similar to the base scenario.'
      };
    }
  })();

  // Land Use Impact
  // More solar/wind = more land needed
  // Earlier coal phaseout has minimal land impact
  const landUseImpact = (() => {
    const totalREIncrease = reShareDelta2030 + reShareDelta2040;

    if (totalREIncrease > 30) {
      return {
        direction: 'increase' as Direction,
        magnitude: 'significant' as Magnitude,
        explanation: 'Substantially higher solar and wind capacity requires more land, particularly for utility-scale installations.'
      };
    } else if (totalREIncrease > 10) {
      return {
        direction: 'increase' as Direction,
        magnitude: 'moderate' as Magnitude,
        explanation: 'Increased renewable capacity requires additional land for solar and wind projects.'
      };
    } else if (totalREIncrease < -30) {
      return {
        direction: 'decrease' as Direction,
        magnitude: 'significant' as Magnitude,
        explanation: 'Lower renewable deployment reduces land requirements for energy infrastructure.'
      };
    } else if (totalREIncrease < -10) {
      return {
        direction: 'decrease' as Direction,
        magnitude: 'moderate' as Magnitude,
        explanation: 'Reduced solar and wind capacity requires less land than the base scenario.'
      };
    } else {
      return {
        direction: 'unchanged' as Direction,
        magnitude: 'minimal' as Magnitude,
        explanation: 'Land use requirements remain similar to the base scenario.'
      };
    }
  })();

  // Emissions Impact
  // More renewables = lower emissions
  // Earlier coal phaseout = lower emissions
  // Later coal phaseout = higher emissions
  const emissionsImpact = (() => {
    const totalREIncrease = reShareDelta2030 + reShareDelta2040;

    // Earlier coal phaseout + higher RE = significant emissions reduction
    if (coalPhaseoutDelta < -5 && totalREIncrease > 10) {
      return {
        direction: 'decrease' as Direction,
        magnitude: 'significant' as Magnitude,
        explanation: 'Earlier coal phaseout combined with higher renewable share substantially reduces emissions.'
      };
    }

    // Earlier coal phaseout OR higher RE = moderate reduction
    if (coalPhaseoutDelta < -5 || totalREIncrease > 15) {
      return {
        direction: 'decrease' as Direction,
        magnitude: 'moderate' as Magnitude,
        explanation: 'Faster transition to renewables reduces fossil fuel combustion and associated emissions.'
      };
    }

    // Later coal phaseout + lower RE = significant increase
    if (coalPhaseoutDelta > 5 && totalREIncrease < -10) {
      return {
        direction: 'increase' as Direction,
        magnitude: 'significant' as Magnitude,
        explanation: 'Delayed coal phaseout with lower renewable share extends fossil fuel dependency and increases emissions.'
      };
    }

    // Later coal phaseout OR lower RE = moderate increase
    if (coalPhaseoutDelta > 5 || totalREIncrease < -15) {
      return {
        direction: 'increase' as Direction,
        magnitude: 'moderate' as Magnitude,
        explanation: 'Slower decarbonization pace results in higher cumulative emissions.'
      };
    }

    // Small changes = minimal impact
    return {
      direction: 'unchanged' as Direction,
      magnitude: 'minimal' as Magnitude,
      explanation: 'Emissions trajectory remains similar to the base scenario.'
    };
  })();

  return {
    jobs: jobsImpact,
    landUse: landUseImpact,
    emissions: emissionsImpact
  };
}
