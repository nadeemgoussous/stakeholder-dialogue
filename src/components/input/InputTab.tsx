import { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { ScenarioInput } from '../../types/scenario';
import QuickEntryForm from './QuickEntryForm';

type InputMethod = 'example' | 'paste' | 'quick' | null;

export default function InputTab() {
  const [selectedMethod, setSelectedMethod] = useState<InputMethod>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { scenario, loadScenario } = useScenario();

  const handleLoadExample = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load the Rwanda baseline scenario (bundled with the app - works offline)
      const response = await fetch('/sample-data/rwanda-baseline.json');
      if (!response.ok) {
        throw new Error('Failed to load example scenario');
      }
      const data: ScenarioInput = await response.json();
      loadScenario(data);
      setSelectedMethod('example');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load example');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteJSON = () => {
    setSelectedMethod('paste');
  };

  const handleQuickEntry = () => {
    setSelectedMethod('quick');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-irena-blue)' }}>
          Import Your Scenario
        </h2>
        <p className="text-lg text-gray-700 mb-2">
          Choose your preferred method to input scenario data.
        </p>
        <p className="text-sm text-gray-600">
          ⏱️ Target: Complete data input in under 5 minutes
        </p>
      </div>

      {/* Three Input Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Option 1: Load Example */}
        <button
          onClick={handleLoadExample}
          disabled={loading}
          className="card text-left hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-500"
          data-testid="load-example-button"
        >
          <div className="text-4xl mb-3" style={{ color: 'var(--color-irena-blue)' }}>
            📊
          </div>
          <h3 className="text-xl font-semibold mb-2">Load Example</h3>
          <p className="text-gray-600 text-sm mb-4">
            Load the Rwanda baseline scenario to explore the tool's features
          </p>
          <div className="text-xs text-gray-500">
            ✓ Works offline<br />
            ✓ Instant loading<br />
            ✓ Perfect for learning
          </div>
        </button>

        {/* Option 2: Paste from Template */}
        <button
          onClick={handlePasteJSON}
          disabled={loading}
          className="card text-left hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-500"
          data-testid="paste-json-button"
        >
          <div className="text-4xl mb-3" style={{ color: 'var(--color-irena-orange)' }}>
            📋
          </div>
          <h3 className="text-xl font-semibold mb-2">Paste from Template</h3>
          <p className="text-gray-600 text-sm mb-4">
            Paste JSON output from the Excel template
          </p>
          <div className="text-xs text-gray-500">
            ✓ Full model data<br />
            ✓ Copy-paste workflow<br />
            ✓ Template validates data
          </div>
        </button>

        {/* Option 3: Quick Entry */}
        <button
          onClick={handleQuickEntry}
          disabled={loading}
          className="card text-left hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-500"
          data-testid="quick-entry-button"
        >
          <div className="text-4xl mb-3 text-green-600">
            ⚡
          </div>
          <h3 className="text-xl font-semibold mb-2">Quick Entry</h3>
          <p className="text-gray-600 text-sm mb-4">
            Enter 15 essential metrics manually
          </p>
          <div className="text-xs text-gray-500">
            ✓ Fast manual entry<br />
            ✓ 15 key fields only<br />
            ✓ Validation included
          </div>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" data-testid="error-message">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8" data-testid="loading-indicator">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Loading scenario...</p>
        </div>
      )}

      {/* Scenario Preview (if loaded) */}
      {scenario && !loading && (
        <div className="card" data-testid="scenario-preview">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-irena-blue)' }}>
            ✓ Scenario Loaded Successfully
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Country</p>
              <p className="font-semibold" data-testid="scenario-country">{scenario.metadata.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Scenario Name</p>
              <p className="font-semibold" data-testid="scenario-name">{scenario.metadata.scenarioName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Model Version</p>
              <p className="font-semibold" data-testid="scenario-model">{scenario.metadata.modelVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date Created</p>
              <p className="font-semibold">{new Date(scenario.metadata.dateCreated).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-800 mb-2">
              <strong>Ready to explore stakeholder responses!</strong>
            </p>
            <p className="text-sm text-green-700">
              Navigate to the <strong>Stakeholder Dialogue</strong> tab to predict and reveal how different stakeholders would respond to this scenario.
            </p>
          </div>
        </div>
      )}

      {/* Selected Method Content (Paste/Quick Entry - Coming Soon) */}
      {selectedMethod === 'paste' && !scenario && (
        <div className="card text-center" data-testid="paste-placeholder">
          <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-irena-orange)' }}>
            Paste JSON from Template
          </h3>
          <p className="text-gray-600 mb-4">
            Coming soon: JSON paste functionality
          </p>
          <button
            onClick={() => setSelectedMethod(null)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to options
          </button>
        </div>
      )}

      {selectedMethod === 'quick' && !scenario && (
        <QuickEntryForm onCancel={() => setSelectedMethod(null)} />
      )}
    </div>
  );
}
