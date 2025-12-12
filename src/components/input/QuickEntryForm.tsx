import { useState, FormEvent } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { QuickScenarioInput, ScenarioInput, calculateREShare } from '../../types/scenario';
import { PowerUnit, EnergyUnit, MoneyUnit, EmissionsUnit } from '../../utils/unit-conversions';

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

// Default milestone template
const createDefaultMilestone = (year: number) => ({
  year,
  renewablesCapacity: 0,
  fossilCapacity: 0,
  storageCapacity: 0,
  capacityUnit: 'MW' as PowerUnit,
  renewablesGeneration: 0,
  fossilGeneration: 0,
  generationUnit: 'GWh' as EnergyUnit,
  cumulativeInvestment: 0,
  investmentUnit: 'million USD' as MoneyUnit,
  emissions: 0,
  emissionsUnit: 'Mt CO2' as EmissionsUnit,
  peakDemand: 0,
  peakDemandUnit: 'MW' as PowerUnit,
  renewablesAdditions: 0,
  fossilAdditions: 0,
});

export default function QuickEntryForm({ onCancel, onSubmit }: QuickEntryFormProps) {
  const { loadScenario } = useScenario();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize with 3 default milestones (2030, 2040, 2050)
  const [formData, setFormData] = useState<QuickScenarioInput>({
    country: '',
    scenarioName: '',
    milestones: [
      createDefaultMilestone(2030),
      createDefaultMilestone(2040),
      createDefaultMilestone(2050),
    ],
  });

  const handleMetadataChange = (field: 'country' | 'scenarioName', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMilestoneChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newMilestones = [...prev.milestones];
      newMilestones[index] = {
        ...newMilestones[index],
        [field]: typeof value === 'string' && field !== 'capacityUnit' && field !== 'generationUnit'
                  && field !== 'investmentUnit' && field !== 'emissionsUnit' && field !== 'peakDemandUnit'
          ? parseFloat(value) || 0
          : value
      };
      return { ...prev, milestones: newMilestones };
    });
  };

  const addMilestone = () => {
    const lastYear = formData.milestones[formData.milestones.length - 1]?.year || 2050;
    const newYear = Math.min(lastYear + 5, 2060);

    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, createDefaultMilestone(newYear)]
    }));
  };

  const removeMilestone = (index: number) => {
    if (formData.milestones.length <= 2) {
      alert('You must have at least 2 milestones');
      return;
    }
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.scenarioName) {
      newErrors.scenarioName = 'Scenario name is required';
    }

    // Validate milestones
    formData.milestones.forEach((m, i) => {
      if (m.renewablesCapacity < 0) newErrors[`m${i}_renewables`] = 'Must be non-negative';
      if (m.fossilCapacity < 0) newErrors[`m${i}_fossil`] = 'Must be non-negative';
      if (m.emissions < 0) newErrors[`m${i}_emissions`] = 'Must be non-negative';
      if (m.peakDemand <= 0) newErrors[`m${i}_demand`] = 'Must be positive';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertToFullScenario = (quick: QuickScenarioInput): ScenarioInput => {
    return {
      metadata: {
        country: quick.country,
        scenarioName: quick.scenarioName,
        modelVersion: 'Quick Entry',
        dateCreated: new Date().toISOString(),
      },
      milestones: quick.milestones.map((m, idx) => {
        const totalGeneration = m.renewablesGeneration + m.fossilGeneration;
        const reShare = totalGeneration > 0
          ? calculateREShare({ renewables: m.renewablesGeneration, fossil: m.fossilGeneration })
          : 0;

        // Calculate additions from previous milestone
        const prevMilestone = idx > 0 ? quick.milestones[idx - 1] : null;
        const renewablesAdditions = prevMilestone
          ? Math.max(0, m.renewablesCapacity - prevMilestone.renewablesCapacity)
          : m.renewablesCapacity;
        const fossilAdditions = prevMilestone
          ? Math.max(0, m.fossilCapacity - prevMilestone.fossilCapacity)
          : m.fossilCapacity;

        return {
          year: m.year,
          capacity: {
            total: {
              renewables: m.renewablesCapacity,
              fossil: m.fossilCapacity,
              storage: m.storageCapacity || 0,
            },
            unit: m.capacityUnit,
          },
          generation: {
            output: {
              renewables: m.renewablesGeneration,
              fossil: m.fossilGeneration,
            },
            unit: m.generationUnit,
          },
          reShare,
          investment: {
            cumulative: m.cumulativeInvestment,
            unit: m.investmentUnit,
          },
          emissions: {
            total: m.emissions,
            unit: m.emissionsUnit,
          },
          peakDemand: {
            value: m.peakDemand,
            unit: m.peakDemandUnit,
          },
          capacityAdditions: {
            additions: {
              renewables: renewablesAdditions,
              fossil: fossilAdditions,
            },
            unit: m.capacityUnit,
          },
        };
      }),
    };
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const fullScenario = convertToFullScenario(formData);
    loadScenario(fullScenario);

    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 text-irena-blue">Quick Entry Form</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter simplified scenario data. You can add multiple milestone years.
        </p>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleMetadataChange('country', e.target.value)}
              className={`input-field ${errors.country ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select a country</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
          </div>

          <div>
            <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Name *
            </label>
            <input
              id="scenarioName"
              type="text"
              value={formData.scenarioName}
              onChange={(e) => handleMetadataChange('scenarioName', e.target.value)}
              className={`input-field ${errors.scenarioName ? 'border-red-500' : ''}`}
              placeholder="e.g., Business as Usual"
              required
            />
            {errors.scenarioName && <p className="text-xs text-red-600 mt-1">{errors.scenarioName}</p>}
          </div>
        </div>
      </div>

      {/* Milestones */}
      {formData.milestones.map((milestone, idx) => (
        <div key={idx} className="card bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Milestone Year: {milestone.year}
            </h4>
            {formData.milestones.length > 2 && (
              <button
                type="button"
                onClick={() => removeMilestone(idx)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                value={milestone.year}
                onChange={(e) => handleMilestoneChange(idx, 'year', parseInt(e.target.value))}
                className="input-field"
                min="2020"
                max="2060"
                step="1"
              />
            </div>

            {/* Renewables Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renewables Capacity *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={milestone.renewablesCapacity}
                  onChange={(e) => handleMilestoneChange(idx, 'renewablesCapacity', e.target.value)}
                  className="input-field flex-1"
                  min="0"
                  step="0.1"
                />
                <select
                  value={milestone.capacityUnit}
                  onChange={(e) => handleMilestoneChange(idx, 'capacityUnit', e.target.value)}
                  className="input-field w-24"
                >
                  <option value="MW">MW</option>
                  <option value="GW">GW</option>
                </select>
              </div>
            </div>

            {/* Fossil Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fossil Capacity *
              </label>
              <input
                type="number"
                value={milestone.fossilCapacity}
                onChange={(e) => handleMilestoneChange(idx, 'fossilCapacity', e.target.value)}
                className="input-field"
                min="0"
                step="0.1"
              />
            </div>

            {/* Storage Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Capacity (optional)
              </label>
              <input
                type="number"
                value={milestone.storageCapacity || 0}
                onChange={(e) => handleMilestoneChange(idx, 'storageCapacity', e.target.value)}
                className="input-field"
                min="0"
                step="0.1"
              />
            </div>

            {/* Renewables Generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renewables Generation *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={milestone.renewablesGeneration}
                  onChange={(e) => handleMilestoneChange(idx, 'renewablesGeneration', e.target.value)}
                  className="input-field flex-1"
                  min="0"
                  step="0.1"
                />
                <select
                  value={milestone.generationUnit}
                  onChange={(e) => handleMilestoneChange(idx, 'generationUnit', e.target.value)}
                  className="input-field w-24"
                >
                  <option value="GWh">GWh</option>
                  <option value="TWh">TWh</option>
                </select>
              </div>
            </div>

            {/* Fossil Generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fossil Generation *
              </label>
              <input
                type="number"
                value={milestone.fossilGeneration}
                onChange={(e) => handleMilestoneChange(idx, 'fossilGeneration', e.target.value)}
                className="input-field"
                min="0"
                step="0.1"
              />
            </div>

            {/* Investment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cumulative Investment *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={milestone.cumulativeInvestment}
                  onChange={(e) => handleMilestoneChange(idx, 'cumulativeInvestment', e.target.value)}
                  className="input-field flex-1"
                  min="0"
                  step="0.1"
                />
                <select
                  value={milestone.investmentUnit}
                  onChange={(e) => handleMilestoneChange(idx, 'investmentUnit', e.target.value)}
                  className="input-field w-32"
                >
                  <option value="million USD">m$</option>
                  <option value="billion USD">B$</option>
                </select>
              </div>
            </div>

            {/* Emissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emissions *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={milestone.emissions}
                  onChange={(e) => handleMilestoneChange(idx, 'emissions', e.target.value)}
                  className="input-field flex-1"
                  min="0"
                  step="0.01"
                />
                <select
                  value={milestone.emissionsUnit}
                  onChange={(e) => handleMilestoneChange(idx, 'emissionsUnit', e.target.value)}
                  className="input-field w-32"
                >
                  <option value="Mt CO2">Mt CO2</option>
                </select>
              </div>
            </div>

            {/* Peak Demand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peak Demand *
              </label>
              <input
                type="number"
                value={milestone.peakDemand}
                onChange={(e) => handleMilestoneChange(idx, 'peakDemand', e.target.value)}
                className="input-field"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Milestone Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={addMilestone}
          className="btn-secondary"
          disabled={formData.milestones.length >= 10}
        >
          + Add Milestone Year
        </button>
        {formData.milestones.length >= 10 && (
          <p className="text-xs text-gray-500 mt-2">Maximum 10 milestones allowed</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Load Scenario
        </button>
      </div>
    </form>
  );
}
