import { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { parseCSV, getAvailableYears, suggestMilestoneYears } from '../../utils/csv-parser';
import { validateScenario } from '../../types/scenario';

interface CSVUploaderProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function CSVUploader({ onCancel, onSuccess }: CSVUploaderProps) {
  const { loadScenario } = useScenario();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedMilestones, setSelectedMilestones] = useState<number[]>([]);
  const [country, setCountry] = useState('');
  const [scenarioName, setScenarioName] = useState('');
  const [step, setStep] = useState<'upload' | 'configure' | 'preview'>('upload');
  const [preview, setPreview] = useState<any>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      // Get available years from CSV
      const years = await getAvailableYears(selectedFile);
      setAvailableYears(years);

      // Suggest milestone years
      const suggested = suggestMilestoneYears(years);
      setSelectedMilestones(suggested);

      // Auto-populate scenario name from filename
      const name = selectedFile.name.replace('.csv', '').replace(/_/g, ' ');
      setScenarioName(name);

      setStep('configure');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read CSV file');
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (year: number) => {
    if (selectedMilestones.includes(year)) {
      setSelectedMilestones(selectedMilestones.filter(y => y !== year));
    } else {
      setSelectedMilestones([...selectedMilestones, year].sort((a, b) => a - b));
    }
  };

  const handleParse = async () => {
    if (!file || selectedMilestones.length === 0 || !country || !scenarioName) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scenario = await parseCSV(file, selectedMilestones, country, scenarioName);

      // Validate scenario
      const validation = validateScenario(scenario);
      if (!validation.valid) {
        setError(`Validation failed:\n${validation.errors.join('\n')}`);
        setLoading(false);
        return;
      }

      setPreview(scenario);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = () => {
    if (preview) {
      loadScenario(preview);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Upload CSV File</h3>
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back to options
        </button>
      </div>

      {/* Step 1: Upload File */}
      {step === 'upload' && (
        <div>
          <p className="text-gray-600 mb-6">
            Upload a CSV file from SPLAT, MESSAGE, OSeMOSYS, or other energy models.
            The tool will auto-detect the format and aggregate data to milestone years.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
              data-testid="csv-file-input"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm text-gray-600">
                Click to select CSV file or drag and drop
              </span>
              <span className="text-xs text-gray-500 mt-1">
                SPLAT, MESSAGE, OSeMOSYS, or generic CSV format
              </span>
            </label>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Selected: <span className="font-medium">{file.name}</span>
                {' '}({(file.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-irena-blue"></div>
              <p className="text-sm text-gray-600 mt-2">Reading CSV file...</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Configure Import */}
      {step === 'configure' && (
        <div>
          <p className="text-gray-600 mb-6">
            Found <span className="font-semibold">{availableYears.length} years</span> of data.
            Select milestone years to import and provide scenario details.
          </p>

          {/* Scenario details */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-field"
                placeholder="e.g., ScenarioLand"
                data-testid="csv-country-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scenario Name *
              </label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="input-field"
                placeholder="e.g., High Renewable Scenario"
                data-testid="csv-scenario-name-input"
              />
            </div>
          </div>

          {/* Milestone year selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Milestone Years * (choose 2-6 years)
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => toggleMilestone(year)}
                  className={`
                    px-3 py-2 text-sm rounded border transition-colors
                    ${selectedMilestones.includes(year)
                      ? 'bg-irena-blue text-white border-irena-blue'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-irena-blue'
                    }
                  `}
                  data-testid={`milestone-year-${year}`}
                >
                  {year}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedMilestones.join(', ') || 'None'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('upload')}
              className="btn-secondary flex-1"
            >
              ← Back
            </button>
            <button
              onClick={handleParse}
              disabled={loading || selectedMilestones.length === 0 || !country || !scenarioName}
              className="btn-primary flex-1"
              data-testid="csv-parse-button"
            >
              {loading ? 'Parsing...' : 'Parse CSV →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && preview && (
        <div>
          <p className="text-gray-600 mb-4">
            Preview the imported scenario. Verify the data before loading.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
            <h4 className="font-semibold text-gray-900 mb-3">Scenario Summary</h4>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Country:</span>
                <span className="font-medium">{preview.metadata.country}</span>

                <span className="text-gray-600">Scenario:</span>
                <span className="font-medium">{preview.metadata.scenarioName}</span>

                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{preview.metadata.modelVersion}</span>

                <span className="text-gray-600">Milestones:</span>
                <span className="font-medium">{preview.milestones.length} years</span>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <h5 className="font-medium text-gray-900 mb-2">Milestone Years:</h5>
                <div className="space-y-2">
                  {preview.milestones.map((m: any) => (
                    <div key={m.year} className="bg-white p-2 rounded border border-gray-200">
                      <div className="font-medium text-gray-900">{m.year}</div>
                      <div className="text-xs text-gray-600 mt-1 grid grid-cols-2 gap-x-4">
                        <div>RE: {m.capacity.total.renewables} {m.capacity.unit}</div>
                        <div>Fossil: {m.capacity.total.fossil} {m.capacity.unit}</div>
                        <div>RE Share: {m.reShare.toFixed(1)}%</div>
                        <div>Emissions: {m.emissions.total} {m.emissions.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('configure')}
              className="btn-secondary flex-1"
            >
              ← Back
            </button>
            <button
              onClick={handleLoad}
              className="btn-primary flex-1"
              data-testid="csv-load-button"
            >
              Load Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
