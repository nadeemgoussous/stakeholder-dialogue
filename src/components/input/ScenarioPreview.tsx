import { ScenarioInput } from '../../types/scenario';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScenarioPreviewProps {
  scenario: ScenarioInput;
  onProceed?: () => void;
}

export default function ScenarioPreview({ scenario, onProceed }: ScenarioPreviewProps) {
  // Calculate key metrics
  const calculateREShare = (year: number): number => {
    const capacity = scenario.supply.capacity;
    const renewableCapacity =
      (capacity.hydro[year] || 0) +
      (capacity.solarPV[year] || 0) +
      (capacity.wind[year] || 0) +
      (capacity.geothermal[year] || 0) +
      (capacity.biomass[year] || 0);

    const totalCapacity =
      renewableCapacity +
      (capacity.coal[year] || 0) +
      (capacity.naturalGas[year] || 0) +
      (capacity.diesel[year] || 0) +
      (capacity.hfo[year] || 0) +
      (capacity.nuclear[year] || 0) +
      (capacity.battery[year] || 0);

    return totalCapacity > 0 ? (renewableCapacity / totalCapacity) * 100 : 0;
  };

  // Calculate emissions reduction
  const calculateEmissionsReduction = (): number => {
    const emissions = scenario.supply.emissions;
    const years = Object.keys(emissions).map(Number).sort((a, b) => a - b);
    if (years.length < 2) return 0;

    const baseline = emissions[years[0]];
    const target = emissions[years[years.length - 1]];

    return baseline > 0 ? ((baseline - target) / baseline) * 100 : 0;
  };

  // Prepare data for capacity mix chart (2030 and 2040)
  const prepareCapacityData = () => {
    const capacity = scenario.supply.capacity;
    const years = [2030, 2040];

    return years.map(year => ({
      year: year.toString(),
      Hydro: capacity.hydro[year] || 0,
      'Solar PV': capacity.solarPV[year] || 0,
      Wind: capacity.wind[year] || 0,
      Geothermal: capacity.geothermal[year] || 0,
      Biomass: capacity.biomass[year] || 0,
      Battery: capacity.battery[year] || 0,
      Coal: capacity.coal[year] || 0,
      'Natural Gas': capacity.naturalGas[year] || 0,
      Diesel: capacity.diesel[year] || 0,
      Nuclear: capacity.nuclear[year] || 0,
    }));
  };

  const capacityData = prepareCapacityData();
  const reShare2030 = calculateREShare(2030);
  const reShare2040 = calculateREShare(2040);
  const emissionsReduction = calculateEmissionsReduction();

  // Get total investment (cumulative 2050)
  const totalInvestment = scenario.supply.investment.cumulative[2050] ||
                          scenario.supply.investment.cumulative[2040] ||
                          Object.values(scenario.supply.investment.cumulative)[
                            Object.values(scenario.supply.investment.cumulative).length - 1
                          ] || 0;

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

        {/* RE Share */}
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">RE SHARE 2030</p>
          <p className="font-bold text-2xl text-green-700" data-testid="preview-re-2030">
            {reShare2030.toFixed(0)}%
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">RE SHARE 2040</p>
          <p className="font-bold text-2xl text-green-700" data-testid="preview-re-2040">
            {reShare2040.toFixed(0)}%
          </p>
        </div>

        {/* Investment */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">TOTAL INVESTMENT</p>
          <p className="font-bold text-2xl text-purple-700" data-testid="preview-investment">
            ${(totalInvestment / 1000).toFixed(1)}B
          </p>
          <p className="text-xs text-gray-500">Cumulative to 2050</p>
        </div>

        {/* Emissions Reduction */}
        <div className="bg-orange-50 p-4 rounded-lg md:col-span-2 lg:col-span-3">
          <p className="text-xs text-gray-600 mb-1">EMISSIONS REDUCTION</p>
          <p className="font-bold text-2xl" style={{ color: 'var(--color-irena-orange)' }} data-testid="preview-emissions">
            {emissionsReduction > 0 ? `-${emissionsReduction.toFixed(0)}%` : 'N/A'}
          </p>
          <p className="text-xs text-gray-500">From baseline to 2050</p>
        </div>
      </div>

      {/* Capacity Mix Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-irena-blue)' }}>
          Capacity Mix by Technology
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg" data-testid="capacity-mix-chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={capacityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: 'Capacity (MW)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {/* Renewable Technologies */}
              <Bar dataKey="Hydro" stackId="a" fill="#1e88e5" />
              <Bar dataKey="Solar PV" stackId="a" fill="#ffa726" />
              <Bar dataKey="Wind" stackId="a" fill="#66bb6a" />
              <Bar dataKey="Geothermal" stackId="a" fill="#ab47bc" />
              <Bar dataKey="Biomass" stackId="a" fill="#8d6e63" />
              <Bar dataKey="Battery" stackId="a" fill="#26c6da" />
              {/* Fossil Technologies */}
              <Bar dataKey="Coal" stackId="a" fill="#424242" />
              <Bar dataKey="Natural Gas" stackId="a" fill="#78909c" />
              <Bar dataKey="Diesel" stackId="a" fill="#bdbdbd" />
              <Bar dataKey="Nuclear" stackId="a" fill="#ff7043" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Proceed Button */}
      {onProceed && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
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
  );
}
