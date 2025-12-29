/**
 * Stakeholder Response Testing Utility
 *
 * This script tests the stakeholder response system with various scenario inputs
 * to evaluate how realistic and robust the responses are for each stakeholder group.
 *
 * Usage: Run this in the browser console or as a Node script
 */

import type { ScenarioInput } from '../../src/types/scenario';
import type { DerivedMetrics } from '../../src/types/derived-metrics';
import { generateRuleBasedResponse, generateEnhancedResponse } from '../../src/utils/stakeholder-rules';
import { stakeholderProfiles } from '../../src/data/stakeholder-profiles';
import { calculateJobs, calculateLandUse, calculateEmissions } from '../../src/utils/calculations';

// ============================================================================
// TEST SCENARIO DEFINITIONS
// ============================================================================

/**
 * Test Scenario 1: High Renewable Ambition
 * - High RE share by 2030 (70%)
 * - Coal phaseout by 2030
 * - Large battery storage
 * - High investment needs
 * - Strong emissions reductions
 */
const highRenewableScenario: ScenarioInput = {
  metadata: {
    country: "Test Country A",
    scenarioName: "High Renewable Ambition",
    description: "Aggressive renewable transition with coal phaseout",
    sourceFile: "test-high-re.json",
    createdAt: new Date().toISOString()
  },
  milestones: [
    {
      year: 2025,
      reShare: 35,
      capacity: {
        total: {
          renewables: 800,
          fossil: 600,
          storage: 50,
          other: 100
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 2800,
          fossil: 5200,
          other: 400
        },
        unit: "GWh"
      },
      emissions: {
        total: 3.2,
        unit: "Mt CO2"
      },
      investment: {
        cumulative: 500,
        unit: "million USD"
      },
      peakDemand: {
        value: 1200,
        unit: "MW"
      }
    },
    {
      year: 2030,
      reShare: 70,
      capacity: {
        total: {
          renewables: 2400,
          fossil: 200, // Coal phased out
          storage: 400,
          other: 100
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 8800,
          fossil: 1500,
          other: 500
        },
        unit: "GWh"
      },
      emissions: {
        total: 1.1,
        unit: "Mt CO2",
        reductionPercent: 65
      },
      investment: {
        cumulative: 4500,
        unit: "million USD"
      },
      peakDemand: {
        value: 1600,
        unit: "MW"
      },
      capacityAdditions: {
        additions: {
          renewables: 1600,
          fossil: -400,
          storage: 350,
          other: 0
        },
        unit: "MW"
      }
    },
    {
      year: 2040,
      reShare: 85,
      capacity: {
        total: {
          renewables: 4200,
          fossil: 100, // Minimal gas backup
          storage: 800,
          other: 150
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 16500,
          fossil: 800,
          other: 700
        },
        unit: "GWh"
      },
      emissions: {
        total: 0.5,
        unit: "Mt CO2",
        reductionPercent: 84
      },
      investment: {
        cumulative: 9200,
        unit: "million USD"
      },
      peakDemand: {
        value: 2200,
        unit: "MW"
      },
      capacityAdditions: {
        additions: {
          renewables: 1800,
          fossil: -100,
          storage: 400,
          other: 50
        },
        unit: "MW"
      }
    }
  ]
};

/**
 * Test Scenario 2: Fossil Fuel Dependent (BAU)
 * - Low RE share (25% by 2030)
 * - Continued coal reliance
 * - Minimal battery storage
 * - Lower investment
 * - Limited emissions reductions
 */
const fossilDependentScenario: ScenarioInput = {
  metadata: {
    country: "Test Country B",
    scenarioName: "Business as Usual",
    description: "Continued fossil fuel reliance with modest renewable growth",
    sourceFile: "test-bau.json",
    createdAt: new Date().toISOString()
  },
  milestones: [
    {
      year: 2025,
      reShare: 18,
      capacity: {
        total: {
          renewables: 400,
          fossil: 1800,
          storage: 20,
          other: 80
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 1500,
          fossil: 7500,
          other: 300
        },
        unit: "GWh"
      },
      emissions: {
        total: 4.8,
        unit: "Mt CO2"
      },
      investment: {
        cumulative: 300,
        unit: "million USD"
      },
      peakDemand: {
        value: 1800,
        unit: "MW"
      }
    },
    {
      year: 2030,
      reShare: 25,
      capacity: {
        total: {
          renewables: 650,
          fossil: 2000,
          storage: 50,
          other: 100
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 2800,
          fossil: 8500,
          other: 400
        },
        unit: "GWh"
      },
      emissions: {
        total: 4.5,
        unit: "Mt CO2",
        reductionPercent: 6
      },
      investment: {
        cumulative: 800,
        unit: "million USD"
      },
      peakDemand: {
        value: 2100,
        unit: "MW"
      },
      capacityAdditions: {
        additions: {
          renewables: 250,
          fossil: 200,
          storage: 30,
          other: 20
        },
        unit: "MW"
      }
    },
    {
      year: 2040,
      reShare: 35,
      capacity: {
        total: {
          renewables: 1100,
          fossil: 2200,
          storage: 120,
          other: 150
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 4800,
          fossil: 9200,
          other: 600
        },
        unit: "GWh"
      },
      emissions: {
        total: 4.2,
        unit: "Mt CO2",
        reductionPercent: 12
      },
      investment: {
        cumulative: 1500,
        unit: "million USD"
      },
      peakDemand: {
        value: 2600,
        unit: "MW"
      },
      capacityAdditions: {
        additions: {
          renewables: 450,
          fossil: 200,
          storage: 70,
          other: 50
        },
        unit: "MW"
      }
    }
  ]
};

/**
 * Test Scenario 3: Moderate Transition
 * - Balanced RE growth (55% by 2030)
 * - Gradual coal reduction
 * - Moderate battery deployment
 * - Realistic investment
 * - Good emissions reductions
 */
const moderateScenario: ScenarioInput = {
  metadata: {
    country: "Test Country C",
    scenarioName: "Moderate Transition",
    description: "Balanced renewable growth with manageable grid integration",
    sourceFile: "test-moderate.json",
    createdAt: new Date().toISOString()
  },
  milestones: [
    {
      year: 2025,
      reShare: 30,
      capacity: {
        total: {
          renewables: 600,
          fossil: 1200,
          storage: 40,
          other: 100
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 2200,
          fossil: 5800,
          other: 350
        },
        unit: "GWh"
      },
      emissions: {
        total: 3.5,
        unit: "Mt CO2"
      },
      investment: {
        cumulative: 400,
        unit: "million USD"
      },
      peakDemand: {
        value: 1400,
        unit: "MW"
      }
    },
    {
      year: 2030,
      reShare: 55,
      capacity: {
        total: {
          renewables: 1600,
          fossil: 800,
          storage: 250,
          other: 120
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 6500,
          fossil: 4200,
          other: 500
        },
        unit: "GWh"
      },
      emissions: {
        total: 2.1,
        unit: "Mt CO2",
        reductionPercent: 40
      },
      investment: {
        cumulative: 2800,
        unit: "million USD"
      },
      peakDemand: {
        value: 1800,
        unit: "MW"
      },
      capacityAdditions: {
        additions: {
          renewables: 1000,
          fossil: -400,
          storage: 210,
          other: 20
        },
        unit: "MW"
      }
    },
    {
      year: 2040,
      reShare: 72,
      capacity: {
        total: {
          renewables: 3000,
          fossil: 400,
          storage: 600,
          other: 180
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 12500,
          fossil: 2800,
          other: 800
        },
        unit: "GWh"
      },
      emissions: {
        total: 1.4,
        unit: "Mt CO2",
        reductionPercent: 60
      },
      investment: {
        cumulative: 6500,
        unit: "million USD"
      },
      peakDemand: {
        value: 2400,
        unit: "MW"
      },
      capacityAdditions: {
        additions: {
          renewables: 1400,
          fossil: -400,
          storage: 350,
          other: 60
        },
        unit: "MW"
      }
    }
  ]
};

/**
 * Test Scenario 4: High Investment, Low Jobs
 * - Tests financial concerns
 * - Capital-intensive technologies (offshore wind, nuclear)
 * - Limited job creation per MW
 */
const highInvestmentLowJobsScenario: ScenarioInput = {
  metadata: {
    country: "Test Country D",
    scenarioName: "Capital Intensive Path",
    description: "High investment in capital-intensive technologies",
    sourceFile: "test-capital-intensive.json",
    createdAt: new Date().toISOString()
  },
  milestones: [
    {
      year: 2025,
      reShare: 28,
      capacity: {
        total: {
          renewables: 500,
          fossil: 1400,
          storage: 30,
          other: 200 // Includes nuclear
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 1800,
          fossil: 6200,
          other: 1500 // Nuclear baseload
        },
        unit: "GWh"
      },
      emissions: {
        total: 3.8,
        unit: "Mt CO2"
      },
      investment: {
        cumulative: 1200, // High due to nuclear
        unit: "million USD"
      },
      peakDemand: {
        value: 1600,
        unit: "MW"
      }
    },
    {
      year: 2030,
      reShare: 48,
      capacity: {
        total: {
          renewables: 1400,
          fossil: 900,
          storage: 150,
          other: 600 // More nuclear
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 5600,
          fossil: 4500,
          other: 4200 // Nuclear baseload
        },
        unit: "GWh"
      },
      emissions: {
        total: 2.2,
        unit: "Mt CO2",
        reductionPercent: 42
      },
      investment: {
        cumulative: 8500, // Very high (nuclear + offshore wind)
        unit: "million USD"
      },
      peakDemand: {
        value: 2000,
        unit: "MW"
      },
      capacityAdditions: {
        additions: {
          renewables: 900,
          fossil: -500,
          storage: 120,
          other: 400 // Nuclear addition
        },
        unit: "MW"
      }
    },
    {
      year: 2040,
      reShare: 65,
      capacity: {
        total: {
          renewables: 2800,
          fossil: 300,
          storage: 400,
          other: 800 // Nuclear stable
        },
        unit: "MW"
      },
      generation: {
        output: {
          renewables: 11200,
          fossil: 2200,
          other: 5600 // Nuclear baseload
        },
        unit: "GWh"
      },
      emissions: {
        total: 1.1,
        unit: "Mt CO2",
        reductionPercent: 71
      },
      investment: {
        cumulative: 16000, // Very high total investment
        unit: "million USD"
      },
      peakDemand: {
        value: 2600,
        unit: "MW"
      },
      capacityAdditions: {
        additions: {
          renewables: 1400,
          fossil: -600,
          storage: 250,
          other: 200
        },
        unit: "MW"
      }
    }
  ]
};

// ============================================================================
// TESTING FRAMEWORK
// ============================================================================

interface TestResult {
  scenarioName: string;
  stakeholderId: string;
  stakeholderName: string;
  context: string;
  variant: string;
  responseType: 'rule-based' | 'enhanced';
  initialReaction: string;
  appreciationCount: number;
  appreciationPoints: string[];
  concernCount: number;
  concernPoints: Array<{
    text: string;
    severity: string;
    metric: string;
  }>;
  questionsCount: number;
  questions: string[];
  timestamp: string;
}

const testResults: TestResult[] = [];

/**
 * Calculate derived metrics for a scenario
 */
function calculateDerivedMetrics(scenario: ScenarioInput): DerivedMetrics {
  const jobs = calculateJobs(scenario);
  const landUse = calculateLandUse(scenario);
  const emissions = calculateEmissions(scenario);

  return {
    jobs,
    landUse,
    emissions
  };
}

/**
 * Test a single scenario against all stakeholders
 */
function testScenario(
  scenario: ScenarioInput,
  useEnhanced: boolean = false,
  context: 'least-developed' | 'emerging' | 'developed' = 'emerging',
  variant: 'conservative' | 'pragmatic' | 'progressive' = 'pragmatic'
): TestResult[] {
  const results: TestResult[] = [];
  const derivedMetrics = calculateDerivedMetrics(scenario);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`TESTING SCENARIO: ${scenario.metadata.scenarioName}`);
  console.log(`Context: ${context} | Variant: ${variant} | Enhanced: ${useEnhanced}`);
  console.log(`${'='.repeat(80)}\n`);

  for (const stakeholder of stakeholderProfiles) {
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`Stakeholder: ${stakeholder.name}`);
    console.log(`${'-'.repeat(80)}`);

    const response = useEnhanced
      ? generateEnhancedResponse(scenario, derivedMetrics, stakeholder, { context, variant })
      : generateRuleBasedResponse(scenario, derivedMetrics, stakeholder);

    console.log(`\nInitial Reaction:`);
    console.log(`  ${response.initialReaction}`);

    console.log(`\nAppreciation (${response.appreciation.length}):`);
    response.appreciation.forEach((point, i) => {
      console.log(`  ${i + 1}. ${point}`);
    });

    console.log(`\nConcerns (${response.concerns.length}):`);
    response.concerns.forEach((concern, i) => {
      console.log(`  ${i + 1}. [${concern.severity?.toUpperCase()}] ${concern.text}`);
      console.log(`      Metric: ${concern.metric}`);
    });

    console.log(`\nQuestions (${response.questions.length}):`);
    response.questions.forEach((question, i) => {
      console.log(`  ${i + 1}. ${question}`);
    });

    // Store result
    const result: TestResult = {
      scenarioName: scenario.metadata.scenarioName,
      stakeholderId: stakeholder.id,
      stakeholderName: stakeholder.name,
      context,
      variant,
      responseType: useEnhanced ? 'enhanced' : 'rule-based',
      initialReaction: response.initialReaction,
      appreciationCount: response.appreciation.length,
      appreciationPoints: response.appreciation,
      concernCount: response.concerns.length,
      concernPoints: response.concerns.map(c => ({
        text: c.text,
        severity: c.severity || 'unknown',
        metric: c.metric
      })),
      questionsCount: response.questions.length,
      questions: response.questions,
      timestamp: new Date().toISOString()
    };

    results.push(result);
  }

  return results;
}

/**
 * Run full test suite
 */
export function runFullTestSuite() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║         STAKEHOLDER RESPONSE SYSTEM - COMPREHENSIVE TEST SUITE           ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('Testing 4 scenarios × 9 stakeholders = 36 response combinations');
  console.log('Plus enhanced responses with different contexts and variants');
  console.log('\n');

  // Test 1: High Renewable Ambition - Rule-based
  const test1 = testScenario(highRenewableScenario, false);
  testResults.push(...test1);

  // Test 2: Fossil Dependent BAU - Rule-based
  const test2 = testScenario(fossilDependentScenario, false);
  testResults.push(...test2);

  // Test 3: Moderate Transition - Rule-based
  const test3 = testScenario(moderateScenario, false);
  testResults.push(...test3);

  // Test 4: High Investment Low Jobs - Rule-based
  const test4 = testScenario(highInvestmentLowJobsScenario, false);
  testResults.push(...test4);

  // Test 5: High Renewable with Enhanced responses (different contexts)
  console.log('\n\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    ENHANCED RESPONSE TESTING                             ║');
  console.log('║               (Testing Context & Variant Sensitivity)                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const test5a = testScenario(highRenewableScenario, true, 'least-developed', 'conservative');
  testResults.push(...test5a);

  const test5b = testScenario(highRenewableScenario, true, 'developed', 'progressive');
  testResults.push(...test5b);

  // Generate summary report
  generateSummaryReport();
}

/**
 * Generate summary report of all test results
 */
function generateSummaryReport() {
  console.log('\n\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                         SUMMARY REPORT                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Group results by scenario
  const byScenario = testResults.reduce((acc, result) => {
    if (!acc[result.scenarioName]) {
      acc[result.scenarioName] = [];
    }
    acc[result.scenarioName].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  for (const [scenarioName, results] of Object.entries(byScenario)) {
    console.log(`\n${scenarioName}`);
    console.log(`${'='.repeat(scenarioName.length)}`);
    console.log(`Total tests: ${results.length}`);

    const avgConcerns = results.reduce((sum, r) => sum + r.concernCount, 0) / results.length;
    const avgAppreciation = results.reduce((sum, r) => sum + r.appreciationCount, 0) / results.length;
    const avgQuestions = results.reduce((sum, r) => sum + r.questionsCount, 0) / results.length;

    console.log(`Average concerns per stakeholder: ${avgConcerns.toFixed(1)}`);
    console.log(`Average appreciation points per stakeholder: ${avgAppreciation.toFixed(1)}`);
    console.log(`Average questions per stakeholder: ${avgQuestions.toFixed(1)}`);

    // Show stakeholder-specific patterns
    console.log(`\nStakeholder Reaction Summary:`);
    const stakeholderGroups = ['policy-makers', 'grid-operators', 'industry', 'public', 'csos-ngos', 'scientific', 'finance', 'regional-bodies', 'development-partners'];

    stakeholderGroups.forEach(id => {
      const stakeholderResult = results.find(r => r.stakeholderId === id);
      if (stakeholderResult) {
        const sentiment = stakeholderResult.appreciationCount > stakeholderResult.concernCount ? '✅ Positive' :
                          stakeholderResult.appreciationCount < stakeholderResult.concernCount ? '⚠️  Concerned' :
                          '➖ Neutral';
        console.log(`  ${stakeholderResult.stakeholderName.padEnd(30)} ${sentiment} (${stakeholderResult.concernCount} concerns, ${stakeholderResult.appreciationCount} appreciations)`);
      }
    });
  }

  // Export to JSON for detailed analysis
  console.log('\n\n');
  console.log('Full test results saved to console as JSON');
  console.log('Copy the following JSON for detailed analysis:\n');
  console.log(JSON.stringify(testResults, null, 2));
}

/**
 * Export test results to downloadable file
 */
export function exportTestResults() {
  const blob = new Blob([JSON.stringify(testResults, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stakeholder-response-test-results-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Run the test suite automatically when loaded
if (typeof window !== 'undefined') {
  console.log('Stakeholder Response Testing Utility loaded.');
  console.log('Run runFullTestSuite() to execute all tests.');
  console.log('Run exportTestResults() to download results as JSON.');
}
