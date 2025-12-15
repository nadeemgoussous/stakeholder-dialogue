import { ScenarioInput } from '../../types/scenario';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { smartFormatMoney } from '../../utils/unit-conversions';

interface ScenarioPreviewProps {
  scenario: ScenarioInput;
  onProceed?: () => void;
  onLoadDifferent?: () => void;
}

export default function ScenarioPreview({ scenario, onProceed, onLoadDifferent }: ScenarioPreviewProps) {
  // Get total investment from last milestone
  const lastMilestone = scenario.milestones[scenario.milestones.length - 1];
  const totalInvestment = lastMilestone.investment.cumulative;
  const investmentUnit = lastMilestone.investment.unit;

  // Calculate emissions reduction
  const calculateEmissionsReduction = (): number => {
    if (scenario.milestones.length < 2) return 0;

    const firstEmissions = scenario.milestones[0].emissions.total;
    const lastEmissions = lastMilestone.emissions.total;

    return firstEmissions > 0 ? ((firstEmissions - lastEmissions) / firstEmissions) * 100 : 0;
  };

  const emissionsReduction = calculateEmissionsReduction();

  // Prepare data for capacity mix chart
  const prepareCapacityData = () => {
    return scenario.milestones.map(m => ({
      year: m.year.toString(),
      Renewables: m.capacity.total.renewables,
      Fossil: m.capacity.total.fossil,
      Storage: m.capacity.total.storage || 0,
      Other: m.capacity.total.other || 0,
    }));
  };

  const capacityData = prepareCapacityData();

  return (
    <div className="card" data-testid="scenario-preview">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-irena-blue)' }}>
          ✓ Scenario Preview
        </h3>
        <p className="text-gray-600">
          Review the key metrics from your scenario before proceeding to stakeholder dialogue.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Country and Scenario */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">COUNTRY</p>
          <p className="font-bold text-lg" data-testid="preview-country">
            {scenario.metadata.country}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">SCENARIO</p>
          <p className="font-bold text-lg" data-testid="preview-scenario-name">
            {scenario.metadata.scenarioName}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">MODEL</p>
          <p className="font-bold text-lg" data-testid="preview-model">
            {scenario.metadata.modelVersion}
          </p>
        </div>

        {/* RE Share for Each Milestone */}
        {scenario.milestones.slice(0, 3).map((milestone) => (
          <div key={milestone.year} className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">RE SHARE {milestone.year}</p>
            <p className="font-bold text-2xl text-green-700" data-testid={`preview-re-${milestone.year}`}>
              {milestone.reShare.toFixed(1)}%
            </p>
          </div>
        ))}

        {/* Investment */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">TOTAL INVESTMENT</p>
          <p className="font-bold text-2xl text-purple-700" data-testid="preview-investment">
            {smartFormatMoney(totalInvestment)}
          </p>
          <p className="text-xs text-gray-500">Cumulative to {lastMilestone.year}</p>
        </div>

        {/* Emissions Reduction */}
        <div className="bg-orange-50 p-4 rounded-lg md:col-span-2 lg:col-span-3">
          <p className="text-xs text-gray-600 mb-1">EMISSIONS REDUCTION</p>
          <p className="font-bold text-2xl" style={{ color: 'var(--color-irena-orange)' }} data-testid="preview-emissions">
            {emissionsReduction > 0 ? `-${emissionsReduction.toFixed(0)}%` : 'N/A'}
          </p>
          <p className="text-xs text-gray-500">From {scenario.milestones[0].year} to {lastMilestone.year}</p>
        </div>
      </div>

      {/* Capacity Mix Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-irena-blue)' }}>
          Capacity Mix by Technology Category
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg" data-testid="capacity-mix-chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={capacityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: `Capacity (${scenario.milestones[0].capacity.unit})`, angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Renewables" stackId="a" fill="#66bb6a" />
              <Bar dataKey="Fossil" stackId="a" fill="#424242" />
              <Bar dataKey="Storage" stackId="a" fill="#26c6da" />
              <Bar dataKey="Other" stackId="a" fill="#ff7043" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Milestone years: {scenario.milestones.map(m => m.year).join(', ')}
        </div>
      </div>

      {/* Detailed Tech Info (if available) */}
      {scenario.detailedTech && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">
            ℹ️ Detailed Technology Data Available
          </h4>
          <p className="text-xs text-gray-600">
            This scenario includes detailed technology breakdowns for:{' '}
            {Object.keys(scenario.detailedTech).join(', ')}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {/* Load Different Scenario Button */}
        {onLoadDifferent && (
          <button
            onClick={onLoadDifferent}
            className="btn-secondary flex-shrink-0"
            data-testid="load-different-button"
          >
            ← Load Different Scenario
          </button>
        )}

        {/* Proceed Button */}
        {onProceed && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-800 mb-1">
                  Ready to explore stakeholder responses!
                </p>
                <p className="text-sm text-green-700">
                  Predict how different stakeholders will respond to this scenario.
                </p>
              </div>
              <button
                onClick={onProceed}
                className="btn-primary whitespace-nowrap"
                data-testid="proceed-button"
              >
                Proceed to Dialogue →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
