import { useState, FormEvent } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { QuickScenarioInput } from '../../types/scenario';
import { convertQuickEntryToFullScenario } from '../../utils/quick-entry-converter';

// Global country list for dropdown
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Brazil',
  'Bulgaria', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia',
  'Congo (DRC)', 'Costa Rica', 'Croatia', 'Cuba', 'Czech Republic', 'Denmark', 'Ecuador',
  'Egypt', 'Ethiopia', 'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'Guatemala',
  'Honduras', 'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Laos', 'Lebanon',
  'Libya', 'Malaysia', 'Mexico', 'Morocco', 'Mozambique', 'Myanmar', 'Nepal', 'Netherlands',
  'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Panama', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan',
  'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

interface QuickEntryFormProps {
  onCancel: () => void;
  onSubmit?: () => void;
}

export default function QuickEntryForm({ onCancel, onSubmit }: QuickEntryFormProps) {
  const { loadScenario } = useScenario();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<QuickScenarioInput>({
    country: '',
    scenarioName: '',
    renewableCapacity2030: 0,
    fossilCapacity2030: 0,
    batteryCapacity2030: 0,
    renewableCapacity2040: 0,
    fossilCapacity2040: 0,
    batteryCapacity2040: 0,
    totalInvestment2030: 0,
    totalInvestment2050: 0,
    emissions2025: 0,
    emissions2030: 0,
    emissions2050: 0,
    peakDemand2030: 0,
    peakDemand2040: 0,
  });

  const handleChange = (field: keyof QuickScenarioInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.scenarioName) {
      newErrors.scenarioName = 'Scenario name is required';
    }

    // Validate numeric fields
    const numericFields: (keyof QuickScenarioInput)[] = [
      'renewableCapacity2030', 'fossilCapacity2030', 'batteryCapacity2030',
      'renewableCapacity2040', 'fossilCapacity2040', 'batteryCapacity2040',
      'totalInvestment2030', 'totalInvestment2050',
      'emissions2025', 'emissions2030', 'emissions2050',
      'peakDemand2030', 'peakDemand2040'
    ];

    numericFields.forEach(field => {
      const value = formData[field] as number;
      if (value < 0) {
        newErrors[field] = 'Must be non-negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertToFullScenario = (quick: QuickScenarioInput): ScenarioInput => {
    const currentYear = new Date().getFullYear();

    // Distribute renewable capacity into simple categories
    const solarPV = Math.round(quick.renewableCapacity2030 * 0.4);
    const windOnshore = Math.round(quick.renewableCapacity2030 * 0.3);
    const hydro = Math.round(quick.renewableCapacity2030 * 0.3);

    const solarPV2040 = Math.round(quick.renewableCapacity2040 * 0.4);
    const windOnshore2040 = Math.round(quick.renewableCapacity2040 * 0.3);
    const hydro2040 = Math.round(quick.renewableCapacity2040 * 0.3);

    // Distribute fossil capacity
    const coal = Math.round(quick.fossilCapacity2030 * 0.4);
    const gas = Math.round(quick.fossilCapacity2030 * 0.4);
    const diesel = Math.round(quick.fossilCapacity2030 * 0.2);

    const coal2040 = Math.round(quick.fossilCapacity2040 * 0.4);
    const gas2040 = Math.round(quick.fossilCapacity2040 * 0.4);
    const diesel2040 = Math.round(quick.fossilCapacity2040 * 0.2);

    return {
      metadata: {
        country: quick.country,
        scenarioName: quick.scenarioName,
        modelVersion: 'Quick Entry',
        dateCreated: new Date().toISOString(),
      },
      capacity: {
        '2025': {
          'Solar PV': solarPV * 0.5,
          'Wind Onshore': windOnshore * 0.5,
          'Hydro': hydro * 0.7,
          'Coal': coal * 1.2,
          'Gas': gas * 1.2,
          'Diesel/HFO': diesel * 1.2,
          'Battery Storage': quick.batteryCapacity2030 * 0.3,
        },
        '2030': {
          'Solar PV': solarPV,
          'Wind Onshore': windOnshore,
          'Hydro': hydro,
          'Coal': coal,
          'Gas': gas,
          'Diesel/HFO': diesel,
          'Battery Storage': quick.batteryCapacity2030,
        },
        '2040': {
          'Solar PV': solarPV2040,
          'Wind Onshore': windOnshore2040,
          'Hydro': hydro2040,
          'Coal': coal2040,
          'Gas': gas2040,
          'Diesel/HFO': diesel2040,
          'Battery Storage': quick.batteryCapacity2040,
        },
        '2050': {
          'Solar PV': solarPV2040 * 1.3,
          'Wind Onshore': windOnshore2040 * 1.3,
          'Hydro': hydro2040 * 1.1,
          'Coal': coal2040 * 0.2,
          'Gas': gas2040 * 0.5,
          'Diesel/HFO': diesel2040 * 0.3,
          'Battery Storage': quick.batteryCapacity2040 * 1.5,
        },
      },
      generation: {
        '2025': {
          'Solar PV': solarPV * 0.5 * 2000,
          'Wind Onshore': windOnshore * 0.5 * 2500,
          'Hydro': hydro * 0.7 * 4000,
          'Coal': coal * 1.2 * 6000,
          'Gas': gas * 1.2 * 4000,
          'Diesel/HFO': diesel * 1.2 * 2000,
        },
        '2030': {
          'Solar PV': solarPV * 2000,
          'Wind Onshore': windOnshore * 2500,
          'Hydro': hydro * 4000,
          'Coal': coal * 6000,
          'Gas': gas * 4000,
          'Diesel/HFO': diesel * 2000,
        },
        '2040': {
          'Solar PV': solarPV2040 * 2000,
          'Wind Onshore': windOnshore2040 * 2500,
          'Hydro': hydro2040 * 4000,
          'Coal': coal2040 * 6000,
          'Gas': gas2040 * 4000,
          'Diesel/HFO': diesel2040 * 2000,
        },
        '2050': {
          'Solar PV': solarPV2040 * 1.3 * 2000,
          'Wind Onshore': windOnshore2040 * 1.3 * 2500,
          'Hydro': hydro2040 * 1.1 * 4000,
          'Coal': coal2040 * 0.2 * 6000,
          'Gas': gas2040 * 0.5 * 4000,
          'Diesel/HFO': diesel2040 * 0.3 * 2000,
        },
      },
      investment: {
        '2025': { total: quick.totalInvestment2030 * 0.2 },
        '2030': { total: quick.totalInvestment2030 },
        '2040': { total: quick.totalInvestment2030 + (quick.totalInvestment2050 - quick.totalInvestment2030) * 0.6 },
        '2050': { total: quick.totalInvestment2050 },
      },
      emissions: {
        '2025': { totalCO2: quick.emissions2025 },
        '2030': { totalCO2: quick.emissions2030 },
        '2040': { totalCO2: quick.emissions2030 + (quick.emissions2050 - quick.emissions2030) * 0.6 },
        '2050': { totalCO2: quick.emissions2050 },
      },
      demand: {
        '2025': {
          total: quick.peakDemand2030 * 5000 * 0.7,
          peak: quick.peakDemand2030 * 0.7,
          sectoral: {
            residential: quick.peakDemand2030 * 5000 * 0.7 * 0.3,
            commercial: quick.peakDemand2030 * 5000 * 0.7 * 0.25,
            industrial: quick.peakDemand2030 * 5000 * 0.7 * 0.35,
            transport: quick.peakDemand2030 * 5000 * 0.7 * 0.1,
          },
        },
        '2030': {
          total: quick.peakDemand2030 * 5000,
          peak: quick.peakDemand2030,
          sectoral: {
            residential: quick.peakDemand2030 * 5000 * 0.3,
            commercial: quick.peakDemand2030 * 5000 * 0.25,
            industrial: quick.peakDemand2030 * 5000 * 0.35,
            transport: quick.peakDemand2030 * 5000 * 0.1,
          },
        },
        '2040': {
          total: quick.peakDemand2040 * 5000,
          peak: quick.peakDemand2040,
          sectoral: {
            residential: quick.peakDemand2040 * 5000 * 0.28,
            commercial: quick.peakDemand2040 * 5000 * 0.27,
            industrial: quick.peakDemand2040 * 5000 * 0.32,
            transport: quick.peakDemand2040 * 5000 * 0.13,
          },
        },
        '2050': {
          total: quick.peakDemand2040 * 1.2 * 5000,
          peak: quick.peakDemand2040 * 1.2,
          sectoral: {
            residential: quick.peakDemand2040 * 1.2 * 5000 * 0.27,
            commercial: quick.peakDemand2040 * 1.2 * 5000 * 0.28,
            industrial: quick.peakDemand2040 * 1.2 * 5000 * 0.3,
            transport: quick.peakDemand2040 * 1.2 * 5000 * 0.15,
          },
        },
      },
    };
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const fullScenario = convertQuickEntryToFullScenario(formData);
    loadScenario(fullScenario);
    // Notify parent that form was submitted successfully
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-green-600">
          ⚡ Quick Entry Form
        </h3>
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back to options
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Enter 15 essential metrics to generate a complete scenario. Target: under 3 minutes.
      </p>

      <form onSubmit={handleSubmit} data-testid="quick-entry-form">
        {/* Basic Info */}
        <div className="mb-8">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">Basic Information</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="country-select"
              >
                <option value="">Select a country</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
            </div>

            <div>
              <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-700 mb-1">
                Scenario Name *
              </label>
              <input
                type="text"
                id="scenarioName"
                value={formData.scenarioName}
                onChange={(e) => handleChange('scenarioName', e.target.value)}
                placeholder="e.g., High Ambition RE"
                className={`w-full px-3 py-2 border rounded-lg ${errors.scenarioName ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="scenario-name-input"
              />
              {errors.scenarioName && <p className="text-red-500 text-xs mt-1">{errors.scenarioName}</p>}
            </div>
          </div>
        </div>

        {/* Capacity 2030 */}
        <div className="mb-8">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">Installed Capacity 2030 (MW)</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="renewableCapacity2030" className="block text-sm font-medium text-gray-700 mb-1">
                Renewable Capacity
              </label>
              <input
                type="number"
                id="renewableCapacity2030"
                value={formData.renewableCapacity2030}
                onChange={(e) => handleChange('renewableCapacity2030', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.renewableCapacity2030 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="renewable-capacity-2030"
              />
              {errors.renewableCapacity2030 && <p className="text-red-500 text-xs mt-1">{errors.renewableCapacity2030}</p>}
            </div>

            <div>
              <label htmlFor="fossilCapacity2030" className="block text-sm font-medium text-gray-700 mb-1">
                Fossil Capacity
              </label>
              <input
                type="number"
                id="fossilCapacity2030"
                value={formData.fossilCapacity2030}
                onChange={(e) => handleChange('fossilCapacity2030', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.fossilCapacity2030 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="fossil-capacity-2030"
              />
              {errors.fossilCapacity2030 && <p className="text-red-500 text-xs mt-1">{errors.fossilCapacity2030}</p>}
            </div>

            <div>
              <label htmlFor="batteryCapacity2030" className="block text-sm font-medium text-gray-700 mb-1">
                Battery Storage
              </label>
              <input
                type="number"
                id="batteryCapacity2030"
                value={formData.batteryCapacity2030}
                onChange={(e) => handleChange('batteryCapacity2030', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.batteryCapacity2030 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="battery-capacity-2030"
              />
              {errors.batteryCapacity2030 && <p className="text-red-500 text-xs mt-1">{errors.batteryCapacity2030}</p>}
            </div>
          </div>
        </div>

        {/* Capacity 2040 */}
        <div className="mb-8">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">Installed Capacity 2040 (MW)</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="renewableCapacity2040" className="block text-sm font-medium text-gray-700 mb-1">
                Renewable Capacity
              </label>
              <input
                type="number"
                id="renewableCapacity2040"
                value={formData.renewableCapacity2040}
                onChange={(e) => handleChange('renewableCapacity2040', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.renewableCapacity2040 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="renewable-capacity-2040"
              />
              {errors.renewableCapacity2040 && <p className="text-red-500 text-xs mt-1">{errors.renewableCapacity2040}</p>}
            </div>

            <div>
              <label htmlFor="fossilCapacity2040" className="block text-sm font-medium text-gray-700 mb-1">
                Fossil Capacity
              </label>
              <input
                type="number"
                id="fossilCapacity2040"
                value={formData.fossilCapacity2040}
                onChange={(e) => handleChange('fossilCapacity2040', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.fossilCapacity2040 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="fossil-capacity-2040"
              />
              {errors.fossilCapacity2040 && <p className="text-red-500 text-xs mt-1">{errors.fossilCapacity2040}</p>}
            </div>

            <div>
              <label htmlFor="batteryCapacity2040" className="block text-sm font-medium text-gray-700 mb-1">
                Battery Storage
              </label>
              <input
                type="number"
                id="batteryCapacity2040"
                value={formData.batteryCapacity2040}
                onChange={(e) => handleChange('batteryCapacity2040', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.batteryCapacity2040 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="battery-capacity-2040"
              />
              {errors.batteryCapacity2040 && <p className="text-red-500 text-xs mt-1">{errors.batteryCapacity2040}</p>}
            </div>
          </div>
        </div>

        {/* Investment & Emissions */}
        <div className="mb-8">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">Investment & Emissions</h4>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="totalInvestment2030" className="block text-sm font-medium text-gray-700 mb-1">
                Total Investment by 2030 (USD millions)
              </label>
              <input
                type="number"
                id="totalInvestment2030"
                value={formData.totalInvestment2030}
                onChange={(e) => handleChange('totalInvestment2030', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.totalInvestment2030 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="total-investment-2030"
              />
              {errors.totalInvestment2030 && <p className="text-red-500 text-xs mt-1">{errors.totalInvestment2030}</p>}
            </div>

            <div>
              <label htmlFor="totalInvestment2050" className="block text-sm font-medium text-gray-700 mb-1">
                Total Investment by 2050 (USD millions)
              </label>
              <input
                type="number"
                id="totalInvestment2050"
                value={formData.totalInvestment2050}
                onChange={(e) => handleChange('totalInvestment2050', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.totalInvestment2050 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="total-investment-2050"
              />
              {errors.totalInvestment2050 && <p className="text-red-500 text-xs mt-1">{errors.totalInvestment2050}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="emissions2025" className="block text-sm font-medium text-gray-700 mb-1">
                Emissions 2025 (Mt CO2)
              </label>
              <input
                type="number"
                id="emissions2025"
                value={formData.emissions2025}
                onChange={(e) => handleChange('emissions2025', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.emissions2025 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="emissions-2025"
              />
              {errors.emissions2025 && <p className="text-red-500 text-xs mt-1">{errors.emissions2025}</p>}
            </div>

            <div>
              <label htmlFor="emissions2030" className="block text-sm font-medium text-gray-700 mb-1">
                Emissions 2030 (Mt CO2)
              </label>
              <input
                type="number"
                id="emissions2030"
                value={formData.emissions2030}
                onChange={(e) => handleChange('emissions2030', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.emissions2030 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="emissions-2030"
              />
              {errors.emissions2030 && <p className="text-red-500 text-xs mt-1">{errors.emissions2030}</p>}
            </div>

            <div>
              <label htmlFor="emissions2050" className="block text-sm font-medium text-gray-700 mb-1">
                Emissions 2050 (Mt CO2)
              </label>
              <input
                type="number"
                id="emissions2050"
                value={formData.emissions2050}
                onChange={(e) => handleChange('emissions2050', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.emissions2050 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="emissions-2050"
              />
              {errors.emissions2050 && <p className="text-red-500 text-xs mt-1">{errors.emissions2050}</p>}
            </div>
          </div>
        </div>

        {/* Demand */}
        <div className="mb-8">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">Peak Demand (MW)</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="peakDemand2030" className="block text-sm font-medium text-gray-700 mb-1">
                Peak Demand 2030
              </label>
              <input
                type="number"
                id="peakDemand2030"
                value={formData.peakDemand2030}
                onChange={(e) => handleChange('peakDemand2030', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.peakDemand2030 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="peak-demand-2030"
              />
              {errors.peakDemand2030 && <p className="text-red-500 text-xs mt-1">{errors.peakDemand2030}</p>}
            </div>

            <div>
              <label htmlFor="peakDemand2040" className="block text-sm font-medium text-gray-700 mb-1">
                Peak Demand 2040
              </label>
              <input
                type="number"
                id="peakDemand2040"
                value={formData.peakDemand2040}
                onChange={(e) => handleChange('peakDemand2040', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.peakDemand2040 ? 'border-red-500' : 'border-gray-300'}`}
                data-testid="peak-demand-2040"
              />
              {errors.peakDemand2040 && <p className="text-red-500 text-xs mt-1">{errors.peakDemand2040}</p>}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            data-testid="submit-quick-entry"
          >
            Generate Scenario
          </button>
        </div>
      </form>
    </div>
  );
}
