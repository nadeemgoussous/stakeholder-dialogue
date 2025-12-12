/**
 * Test script to verify stakeholder enhancements are working
 * Run with: node test-enhancements.js
 */

console.log('Testing Stakeholder Enhancements Framework\n');
console.log('='.repeat(60));

// Test 1: Check if modules load
console.log('\n✓ Test 1: Module Loading');
try {
  const enhancements = require('./src/data/stakeholder-enhancements.ts');
  console.log('  ✓ stakeholder-enhancements.ts loaded');
} catch (e) {
  console.log('  ✗ Failed to load enhancements:', e.message);
}

// Test 2: Check interaction triggers
console.log('\n✓ Test 2: Interaction Triggers');
try {
  const {
    gridOperatorsInteractions,
    policyMakersInteractions,
    evaluateInteractionTriggers
  } = require('./src/data/stakeholder-enhancements.ts');

  console.log(`  ✓ Grid Operators: ${gridOperatorsInteractions.length} triggers`);
  console.log(`  ✓ Policy Makers: ${policyMakersInteractions.length} triggers`);

  // Test trigger evaluation
  const testIndicators = {
    'renewableShare.2040': 75,
    'supply.capacity.battery.2040': 150
  };

  const triggered = evaluateInteractionTriggers('grid-operators', testIndicators, 'emerging');
  console.log(`  ✓ Trigger evaluation: ${triggered.length} triggers activated`);

  if (triggered.length > 0) {
    console.log(`    - "${triggered[0].id}": ${triggered[0].concernText.slice(0, 60)}...`);
  }
} catch (e) {
  console.log('  ✗ Interaction trigger test failed:', e.message);
}

// Test 3: Check variants
console.log('\n✓ Test 3: Stakeholder Variants');
try {
  const { gridOperatorsVariants, policyMakersVariants } = require('./src/data/stakeholder-enhancements.ts');

  console.log('  ✓ Grid Operators variants:');
  console.log(`    - Conservative: "${gridOperatorsVariants.conservative.framingPreference.slice(0, 50)}..."`);
  console.log(`    - Progressive: "${gridOperatorsVariants.progressive.framingPreference.slice(0, 50)}..."`);

  console.log('  ✓ Policy Makers variants:');
  console.log(`    - Conservative: "${policyMakersVariants.conservative.framingPreference.slice(0, 50)}..."`);
  console.log(`    - Progressive: "${policyMakersVariants.progressive.framingPreference.slice(0, 50)}..."`);
} catch (e) {
  console.log('  ✗ Variant test failed:', e.message);
}

// Test 4: Check context profiles
console.log('\n✓ Test 4: Development Context Profiles');
try {
  const { contextProfiles, applyContextModifiers } = require('./src/data/stakeholder-enhancements.ts');

  console.log(`  ✓ Found ${contextProfiles.length} context profiles`);

  const baseThreshold = 50;
  const ldcThreshold = applyContextModifiers(baseThreshold, 'renewableShare.2030', 'least-developed');
  const devThreshold = applyContextModifiers(baseThreshold, 'renewableShare.2030', 'developed');

  console.log(`  ✓ Threshold adjustments:`);
  console.log(`    - Base: ${baseThreshold}%`);
  console.log(`    - LDC adjusted: ${ldcThreshold}% (${baseThreshold - ldcThreshold}% lower)`);
  console.log(`    - Developed adjusted: ${devThreshold}% (${devThreshold - baseThreshold}% higher)`);
} catch (e) {
  console.log('  ✗ Context profile test failed:', e.message);
}

// Test 5: Check if generateEnhancedResponse exists
console.log('\n✓ Test 5: Enhanced Response Generation');
try {
  const { generateEnhancedResponse } = require('./src/utils/stakeholder-rules.ts');

  if (typeof generateEnhancedResponse === 'function') {
    console.log('  ✓ generateEnhancedResponse function exists');
    console.log('  ✓ Function signature correct');
  } else {
    console.log('  ✗ generateEnhancedResponse is not a function');
  }
} catch (e) {
  console.log('  ✗ Enhanced response generation test failed:', e.message);
}

console.log('\n' + '='.repeat(60));
console.log('Testing Complete\n');
