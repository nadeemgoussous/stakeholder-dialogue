/**
 * Community Impact Calculator - Interactive Demo
 *
 * Teaching example showing how to make energy scenarios personal for communities
 * This is NOT a production tool - it's educational guidance for practitioners
 *
 * Based on IRENA toolkit examples (Belgium "My2050", Kenya energy calculator)
 */

import { useState } from 'react';
import type { ScenarioInput } from '../../types/scenario';
import { calculateJobs } from '../../utils/calculations';

interface CommunityImpactCalculatorProps {
  scenario: ScenarioInput;
  onBack: () => void;
}

// Sample regions for demo purposes
const DEMO_REGIONS = [
  { id: 'north', name: 'Northern Region', population: 2500000, share: 0.25 },
  { id: 'south', name: 'Southern Region', population: 3000000, share: 0.30 },
  { id: 'east', name: 'Eastern Region', population: 1800000, share: 0.18 },
  { id: 'west', name: 'Western Region', population: 2200000, share: 0.22 },
  { id: 'central', name: 'Central Region', population: 500000, share: 0.05 },
];

export default function CommunityImpactCalculator({ scenario, onBack }: CommunityImpactCalculatorProps) {
  const [householdSize, setHouseholdSize] = useState<number>(4);
  const [region, setRegion] = useState<string>('central');
  const [currentBill, setCurrentBill] = useState<number>(50);

  // Get scenario metrics
  const milestones = scenario.milestones || [];
  const baseline = milestones[0];
  const target = milestones[milestones.length - 1];

  // Calculate derived metrics
  const jobs = calculateJobs(scenario);
  const targetYearJobs = jobs.total[target.year] || 0;

  // Regional distribution
  const selectedRegion = DEMO_REGIONS.find(r => r.id === region) || DEMO_REGIONS[0];
  const regionalJobs = Math.round(targetYearJobs * selectedRegion.share);

  // Emissions reduction
  const emissionsReduction = baseline.emissions && target.emissions
    ? Math.round((1 - target.emissions.total / baseline.emissions.total) * 100)
    : 0;

  // Bill impact (directional estimate based on RE share and investment)
  // Higher RE share with reasonable investment = lower bills in long term
  // This is ILLUSTRATIVE ONLY
  const reShareIncrease = target.reShare - baseline.reShare;
  const investmentPerCapita = target.investment.cumulative / (selectedRegion.population / 1000000);

  // Simplified bill impact logic (directional only)
  let billChangePercent = 0;
  if (reShareIncrease > 30) {
    billChangePercent = -15; // Significant RE increase = lower bills long-term
  } else if (reShareIncrease > 15) {
    billChangePercent = -8; // Moderate RE increase
  } else {
    billChangePercent = 5; // Low RE = likely higher bills (fossil fuel prices)
  }

  // Adjust for high investment costs (short-term pressure)
  if (investmentPerCapita > 500) {
    billChangePercent += 10; // High upfront investment
  }

  const estimatedBillChange = currentBill * (billChangePercent / 100);
  const estimatedNewBill = currentBill + estimatedBillChange;

  // Air quality indicator (based on emissions reduction)
  const airQualityImprovement = emissionsReduction > 50 ? 'Significant' :
                                 emissionsReduction > 30 ? 'Moderate' :
                                 emissionsReduction > 10 ? 'Minor' : 'Minimal';

  // Export template HTML
  const exportTemplate = () => {
    const templateHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Community Energy Impact Calculator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .calculator {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #0078a7; margin-bottom: 20px; }
        .input-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }
        input, select {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .results {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 4px;
            margin-top: 20px;
        }
        .result-item {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #ccc;
        }
        .result-item:last-child {
            border-bottom: none;
        }
        .disclaimer {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-top: 20px;
            font-size: 14px;
        }
        button {
            background: #0078a7;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
        }
        button:hover {
            background: #005f87;
        }
    </style>
</head>
<body>
    <div class="calculator">
        <h1>🏡 How Will This Scenario Affect Your Community?</h1>

        <div class="input-group">
            <label for="household">Household Size:</label>
            <input type="number" id="household" min="1" max="15" value="4">
        </div>

        <div class="input-group">
            <label for="region">Your Region:</label>
            <select id="region">
                <option value="north">Northern Region</option>
                <option value="south">Southern Region</option>
                <option value="east">Eastern Region</option>
                <option value="west">Western Region</option>
                <option value="central">Central Region</option>
            </select>
        </div>

        <div class="input-group">
            <label for="bill">Current Monthly Electricity Bill ($):</label>
            <input type="number" id="bill" min="0" step="5" value="50">
        </div>

        <button onclick="calculateImpact()">Calculate My Impact</button>

        <div class="results" id="results" style="display:none;">
            <h2>Your Estimated Impact by ${target.year}:</h2>
            <div class="result-item">
                <strong>💡 Monthly Bill:</strong>
                <div id="billResult"></div>
            </div>
            <div class="result-item">
                <strong>💼 Jobs Created in Your Region:</strong>
                <div id="jobsResult"></div>
            </div>
            <div class="result-item">
                <strong>🌫️ Air Quality Improvement:</strong>
                <div id="airResult"></div>
            </div>
        </div>

        <div class="disclaimer">
            <strong>⚠️ ILLUSTRATIVE ESTIMATES ONLY</strong><br>
            These figures show directional impacts for discussion purposes.
            Actual impacts depend on many local factors including policy design,
            tariff structures, and implementation details. Always verify with
            detailed economic modeling.
        </div>
    </div>

    <script>
        // TODO: Implement calculation logic based on your scenario data
        // This template provides the structure - you customize with your data
        function calculateImpact() {
            const household = document.getElementById('household').value;
            const region = document.getElementById('region').value;
            const bill = parseFloat(document.getElementById('bill').value);

            // YOUR CALCULATION LOGIC HERE
            // Use your scenario data to estimate:
            // - Bill changes based on RE share and investment
            // - Jobs distributed by region
            // - Air quality from emissions reduction

            // Example outputs (replace with your calculations):
            document.getElementById('billResult').innerHTML =
                'Estimated: $' + (bill * 0.9).toFixed(2) + ' (10% decrease)';
            document.getElementById('jobsResult').innerHTML =
                'Approximately 1,200 jobs in renewable energy sector';
            document.getElementById('airResult').innerHTML =
                'Moderate improvement (30% emissions reduction)';

            document.getElementById('results').style.display = 'block';
        }
    </script>
</body>
</html>`;

    const blob = new Blob([templateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'community-calculator-template.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-irena-blue hover:underline mb-4 flex items-center gap-2"
        >
          ← Back to Strategies
        </button>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-irena-blue)' }}>
          🏡 Community Impact Calculator
        </h2>
        <p className="text-gray-700 mb-4">
          Interactive demo showing how to make energy scenarios personal and relatable for communities
        </p>

        {/* Demo Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-900">
            <strong>📚 This is a Teaching Example</strong> - This calculator demonstrates how to translate
            technical scenario data into personal impacts that communities care about. Use the "Export Template"
            button to get starter code you can customize for your local context.
          </p>
        </div>
      </div>

      {/* Calculator Interface */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          How Will This Scenario Affect You?
        </h3>

        {/* Scenario Context */}
        <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Using Scenario:</strong> {scenario.metadata.scenarioName || 'Your Scenario'}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Target Year:</strong> {target.year} |
            <strong> Renewable Share:</strong> {target.reShare.toFixed(0)}% |
            <strong> Emissions Reduction:</strong> {emissionsReduction}%
          </p>
        </div>

        {/* User Inputs */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="household-size" className="block text-sm font-semibold text-gray-700 mb-2">
              Household Size
            </label>
            <input
              id="household-size"
              type="number"
              min="1"
              max="15"
              value={householdSize}
              onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-irena-blue"
            />
            <p className="text-xs text-gray-500 mt-1">Number of people in your household</p>
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Region
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-irena-blue"
            >
              {DEMO_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Population: {selectedRegion.population.toLocaleString()}
            </p>
          </div>

          <div>
            <label htmlFor="current-bill" className="block text-sm font-semibold text-gray-700 mb-2">
              Current Monthly Electricity Bill ($)
            </label>
            <input
              id="current-bill"
              type="number"
              min="0"
              step="5"
              value={currentBill}
              onChange={(e) => setCurrentBill(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-irena-blue"
            />
            <p className="text-xs text-gray-500 mt-1">Your average monthly bill</p>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">
            Estimated Impact by {target.year}:
          </h4>

          <div className="space-y-4">
            {/* Bill Impact */}
            <div className="bg-white rounded p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💡</div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800 mb-1">Monthly Electricity Bill</h5>
                  <p className="text-2xl font-bold" style={{
                    color: estimatedBillChange < 0 ? '#10b981' : '#ef4444'
                  }}>
                    ${estimatedNewBill.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {estimatedBillChange < 0 ? '↓' : '↑'} {Math.abs(billChangePercent)}%
                    ({estimatedBillChange < 0 ? '-' : '+'}${Math.abs(estimatedBillChange).toFixed(2)})
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on {target.reShare.toFixed(0)}% renewable energy share
                  </p>
                </div>
              </div>
            </div>

            {/* Jobs */}
            <div className="bg-white rounded p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💼</div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800 mb-1">Jobs Created in {selectedRegion.name}</h5>
                  <p className="text-2xl font-bold text-green-600">
                    ~{regionalJobs.toLocaleString()} jobs
                  </p>
                  <p className="text-sm text-gray-600">
                    In renewable energy sector (construction + operations)
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Total scenario: {targetYearJobs.toLocaleString()} jobs nationwide
                  </p>
                </div>
              </div>
            </div>

            {/* Air Quality */}
            <div className="bg-white rounded p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🌫️</div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800 mb-1">Air Quality Improvement</h5>
                  <p className="text-2xl font-bold text-green-600">
                    {airQualityImprovement}
                  </p>
                  <p className="text-sm text-gray-600">
                    {emissionsReduction}% reduction in CO₂ emissions
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Cleaner air means fewer respiratory illnesses and healthcare costs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
        <p className="text-sm text-yellow-900">
          <strong>⚠️ ILLUSTRATIVE ESTIMATES ONLY</strong><br />
          These figures show directional impacts for discussion purposes. They do NOT replace detailed
          economic modeling. Actual bill impacts depend on tariff design, subsidy policies, and many
          other local factors. Job estimates use IRENA average factors. Air quality benefits depend
          on local pollution levels and health baselines.
        </p>
      </div>

      {/* Export Template */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Build Your Own Calculator
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          This demo shows the concept. To create your own customized calculator:
        </p>
        <ol className="text-sm text-gray-700 list-decimal list-inside space-y-2 mb-4">
          <li>Export the HTML template below (includes structure and styling)</li>
          <li>Customize regions, calculation logic, and branding for your country</li>
          <li>Add more impacts relevant to your context (e.g., water savings, fuel imports avoided)</li>
          <li>Host on your ministry website or share as standalone file</li>
          <li>Use in town halls, stakeholder workshops, and public consultations</li>
        </ol>
        <button
          onClick={exportTemplate}
          className="bg-irena-orange hover:bg-orange-600 text-white px-6 py-3 rounded font-semibold transition-colors"
        >
          📥 Export Calculator Template
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Exports as standalone HTML file with embedded CSS and JavaScript
        </p>
      </div>

      {/* Educational Context */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Why Community Calculators Work
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          IRENA's toolkit highlights successful examples from Belgium ("My2050") and Kenya that show
          personal impact calculators:
        </p>
        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 ml-4">
          <li>Make abstract scenarios concrete and relatable</li>
          <li>Increase engagement by showing "what's in it for me"</li>
          <li>Generate discussion about trade-offs and co-benefits</li>
          <li>Build public support for ambitious energy transitions</li>
          <li>Can be gamified to increase reach (especially youth audiences)</li>
        </ul>
      </div>
    </div>
  );
}
