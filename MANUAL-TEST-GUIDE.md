# Manual Testing Guide - Stakeholder Enhancements

## How to Verify the Enhancements Are Working

### 1. Start the Dev Server

```bash
./init.sh
```

Wait for "Local: http://localhost:5173"

### 2. Open Browser DevTools

1. Open http://localhost:5173 in Chrome
2. Press F12 to open DevTools
3. Go to Console tab
4. Keep it open throughout testing

### 3. Load Example Scenario

1. Click "Load Example Scenario" on Input tab
2. Go to "Stakeholder Dialogue" tab

### 4. Test Different Context + Variant Combinations

You should see a blue "Response Settings" section at the top with two dropdowns:
- **Country Development Context**: least-developed / emerging / developed
- **Stakeholder Perspective**: conservative / pragmatic / progressive

#### Test A: Grid Operators - Emerging + Pragmatic (Baseline)

1. Select **Emerging Economies** (default)
2. Select **Pragmatic** (default)
3. Click Grid Operators icon
4. Click "Predict Their Response"
5. Type: "They will be concerned about reliability"
6. Click "Reveal Response"
7. **Check Console** for:
   ```
   Context: emerging Variant: pragmatic
   Interaction triggers: X
   ```
8. **Note the Initial Reaction text**

#### Test B: Grid Operators - Least-Developed + Conservative

1. Change to **Least-Developed Countries**
2. Change to **Conservative**
3. Click Grid Operators again
4. Predict and reveal
5. **Check Console** for:
   ```
   Context: least-developed Variant: conservative
   ```
6. **Compare Initial Reaction** - should be MORE cautious than Test A

#### Test C: Grid Operators - Developed + Progressive

1. Change to **Developed Countries**
2. Change to **Progressive**
3. Click Grid Operators again
4. Predict and reveal
5. **Check Console** for:
   ```
   Context: developed Variant: progressive
   ```
6. **Compare Initial Reaction** - should be MORE ambitious than Test A

### 5. Expected Differences

| Setting | Expected Tone | Expected Concerns |
|---------|--------------|-------------------|
| LDC + Conservative | Very cautious, risk-averse | More concerns triggered (lower thresholds) |
| Emerging + Pragmatic | Balanced, practical | Moderate concerns |
| Developed + Progressive | Ambitious, forward-looking | Fewer concerns (higher thresholds) |

### 6. Check Interaction Triggers

The console should log:
```
Interaction triggers: 2
```

This means 2 multi-metric conditions were met. For example:
- High RE share (>60%) + Low battery (<200 MW) = "Intermittency Risk"

### 7. Verify Different Stakeholders

Try the same context/variant settings with:
- **Policy Makers** - should trigger different interactions
- **CSOs/NGOs** - different framing entirely
- **Development Partners** - focus on debt sustainability

### 8. What Should Change

✅ **Initial Reaction** - different framing based on variant
✅ **Number of concerns** - more in LDC, fewer in developed
✅ **Concern text** - includes interaction trigger insights
✅ **Console logs** - shows context, variant, trigger count

❌ **Should NOT change**:
- Stakeholder icon
- Typical questions list
- Engagement advice

### 9. Debugging If Nothing Changes

If responses look identical regardless of settings:

1. **Check Console for errors**
   - Red errors mean TypeScript issues
   - Look for "Failed to load" messages

2. **Verify generateEnhancedResponse is called**
   - Console should show "Context: X Variant: Y"
   - If you see "Generating response for:" but no context log, function wasn't called

3. **Check if indicators are built**
   - Add `console.log(indicators)` in buildScenarioIndicators
   - Should see object with keys like "renewableShare.2040"

4. **Check if triggers fire**
   - Add `console.log('Triggered:', triggered)` in handleRevealResponse
   - Should see array of interaction objects

### 10. Example Console Output (Success)

```
Generating response for: Grid Operators
Context: least-developed Variant: progressive
Scenario loaded: true
Derived metrics loaded: true
Response generated: enhanced-rule-based
Interaction triggers: 1
```

### 11. Example Console Output (Failure)

```
Generating response for: Grid Operators
Scenario loaded: true
Derived metrics loaded: true
Response generated: rule-based
```

☝️ Notice: No "Context:" log, no "Interaction triggers:" log, type is "rule-based" not "enhanced-rule-based"

### 12. Visual Verification

The Response Settings section should:
- ✅ Have gradient blue background
- ✅ Show icon with sliders
- ✅ Have two dropdowns
- ✅ Show dynamic description text below each dropdown
- ✅ Have help text at bottom explaining settings

If you don't see this section at all, the StakeholderTab.tsx changes didn't load properly.

---

## Quick Test Checklist

- [ ] Response Settings section visible
- [ ] Context dropdown has 3 options
- [ ] Variant dropdown has 3 options
- [ ] Console shows "Context: X Variant: Y" when generating response
- [ ] Console shows "Interaction triggers: N"
- [ ] Initial reaction text changes between conservative/progressive
- [ ] Number of concerns changes between LDC/developed
- [ ] generationType is "enhanced-rule-based" not "rule-based"

## If All Checks Pass

The enhancements are working! Different combinations should produce meaningfully different stakeholder responses.

## If Checks Fail

1. Check browser console for JavaScript errors
2. Verify dev server reloaded after changes (Vite HMR)
3. Hard refresh browser (Ctrl+Shift+R)
4. Check if TypeScript compilation succeeded
5. Review StakeholderTab.tsx line 52-60 to ensure generateEnhancedResponse is called
