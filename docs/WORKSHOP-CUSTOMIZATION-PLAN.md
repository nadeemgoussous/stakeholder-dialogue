# Workshop Customization System - Implementation Plan

> **Status**: DEFERRED - Implement after core features complete (F027-F042)
> 
> **Reason**: Complete workshop functionality first, then add customization based on pilot feedback
> 
> **Priority**: Build after Communication tab, Persistence, UX Polish, and Deployment features

---

# Workshop Customization System - Implementation Plan

## Overview

Build a comprehensive workshop customization system allowing:
- **IRENA**: Create regional template configurations (JSON files)
- **Facilitators**: Fine-tune parameters via UI during workshop prep
- **Scope**: Customize ALL hardcoded parameters (thresholds, context multipliers, technology factors, stakeholder variants)

**Original Priority**: HIGH - Build before Communication tab
**Revised Priority**: Build after F027-F042 complete

---

## Architecture: Three-Layer Configuration

```
Layer 1: DEFAULT CONFIG (Hardcoded TypeScript)
   ↓
Layer 2: REGIONAL TEMPLATES (JSON in public/config/regions/)
   ↓
Layer 3: FACILITATOR OVERRIDES (localStorage)
   ↓
MERGED CONFIG (used by app)
```

**Merge Strategy**: Deep merge with priority Layer 3 > Layer 2 > Layer 1

---

## Implementation Phases

### Phase 1: Core Infrastructure (Days 1-2)

**Create Type Definitions**

File: `src/types/workshop-config.ts`
- `WorkshopConfig` - Master configuration interface
- `ConfigMetadata` - Template metadata (id, name, region, version)
- `StakeholderThresholds` - Concern triggers and positive indicators
- `ContextProfilesConfig` - LDC/emerging/developed multipliers
- `TechnologyFactorsConfig` - Jobs/land/emissions factors
- `StakeholderVariantsConfig` - Conservative/pragmatic/progressive
- `SentimentScoringConfig` - Delta thresholds for sentiment changes

**Build Default Config**

File: `src/config/default-config.ts`
- Extract all hardcoded values from:
  - `stakeholder-profiles.ts`
  - `stakeholder-enhancements.ts`
  - `technology-factors.ts`
  - `sentiment-calculator.ts`
- Export `DEFAULT_WORKSHOP_CONFIG` constant

**Configuration Utilities**

File: `src/utils/config-merge.ts`
- Deep merge function using lodash/merge
- Handle partial configs, null values, arrays

File: `src/utils/config-validation.ts`
- Validate config structure matches interface
- Check for missing required fields
- Warn about invalid values

File: `src/utils/config-persistence.ts`
- `loadRegionalTemplate(templateId)` - Fetch from public/config/regions/
- `saveFacilitatorOverrides(overrides)` - Save to localStorage
- `loadFacilitatorOverrides()` - Load from localStorage
- `downloadConfig(config, filename)` - Export as JSON file

---

### Phase 2: State Management (Days 3-4)

**React Context**

File: `src/context/WorkshopConfigContext.tsx`

```typescript
interface WorkshopConfigContextType {
  config: WorkshopConfig;                     // Current merged config
  regionalTemplate: PartialWorkshopConfig;    // Layer 2
  facilitatorOverrides: PartialWorkshopConfig; // Layer 3
  loadRegionalTemplate(id: string): Promise<void>;
  updateFacilitatorOverride(override: PartialWorkshopConfig): void;
  resetToRegional(): void;                    // Clear Layer 3
  resetToDefault(): void;                     // Clear Layers 2 & 3
  exportConfig(): string;                     // JSON export
  importConfig(json: string): Promise<void>;  // JSON import
}
```

**Custom Hooks**

File: `src/hooks/useWorkshopConfig.ts`
- `useWorkshopConfig()` - Access current merged config
- `useStakeholderThresholds(id)` - Get thresholds for specific stakeholder
- `useTechnologyFactors()` - Get job/land/emission factors
- `useContextProfile()` - Get active development context

---

### Phase 3: UI Components (Days 5-7)

**Settings Panel Container**

File: `src/components/settings/SettingsPanel.tsx`
- Tab navigation for 6 sections
- Display current config metadata
- Reset buttons (to regional / to default)

**Template Selector**

File: `src/components/settings/TemplateSelector.tsx`
- Dropdown with regional templates
- Display template description
- Load template button

**Threshold Editor**

File: `src/components/settings/ThresholdEditor.tsx`
- Select stakeholder dropdown
- Table of concern triggers with threshold inputs
- Enable/disable toggles for each trigger
- Real-time validation

**Context Profile Editor**

File: `src/components/settings/ContextProfileEditor.tsx`
- Select active context (LDC/emerging/developed)
- Edit threshold multipliers table
- Edit priority weights for stakeholders

**Technology Factors Editor**

File: `src/components/settings/TechnologyFactorsEditor.tsx`
- Edit job factors (construction/operations) by technology
- Edit land factors
- Edit emission factors
- Show units and guidance

**Config Import/Export**

File: `src/components/settings/ConfigImportExport.tsx`
- Export current config as JSON (download)
- Import config from JSON file
- Copy/paste JSON text area
- Validation before import

---

### Phase 4: Integration (Days 8-10)

**Modify Existing Code to Use Config**

File: `src/utils/stakeholder-rules.ts` (MODIFY)
- Replace hardcoded stakeholderProfiles import
- Use `useStakeholderThresholds()` hook
- Apply context multipliers from config
- Apply variant multipliers from config

File: `src/utils/calculations.ts` (MODIFY)
- Replace hardcoded JOB_FACTORS, LAND_FACTORS, EMISSION_FACTORS
- Use `useTechnologyFactors()` hook
- Calculate jobs/land/emissions with config values

File: `src/utils/sentiment-calculator.ts` (MODIFY)
- Replace hardcoded delta thresholds
- Use config.sentimentScoring values
- Apply scoring weights per stakeholder

File: `src/App.tsx` (MODIFY)
- Wrap app in `<WorkshopConfigProvider>`
- Add settings button to header
- Modal/drawer for SettingsPanel

---

### Phase 5: Regional Templates (Days 11-12)

**Create 5 Regional Template JSON Files**

File: `public/config/regions/east-africa.json`
- Metadata: East Africa Power Pool
- Lower investment thresholds (smaller economies)
- Higher emphasis on energy access
- Context: least-developed

File: `public/config/regions/west-africa.json`
- Metadata: West African Power Pool
- Moderate thresholds
- Balance access and climate
- Context: emerging

File: `public/config/regions/southern-africa.json`
- Metadata: SAPP region
- Higher industrial electricity use
- Coal transition concerns
- Context: emerging

File: `public/config/regions/southeast-asia.json`
- Metadata: Southeast Asia (ASEAN)
- Rapid growth assumptions
- Private sector financing
- Context: emerging

File: `public/config/regions/small-island-states.json`
- Metadata: SIDS (Caribbean, Pacific)
- Very high renewable ambition
- Import dependence concerns
- Context: varies

File: `public/config/default.json`
- Auto-generated from TypeScript defaults
- Global average assumptions

---

### Phase 6: Testing & Documentation (Days 13-14)

**Create Tests**
- Unit tests for config merge logic
- Unit tests for validation
- Integration tests for config context
- E2E tests for UI customization flow

**Write Documentation**

File: `docs/WORKSHOP-CUSTOMIZATION-GUIDE.md`
- How to select regional templates
- How to fine-tune thresholds
- How to export/import configs
- Best practices for workshops

File: `docs/REGIONAL-TEMPLATE-CREATION.md`
- Guide for IRENA staff
- How to create new regional templates
- JSON schema reference
- Validation checklist

**Update Facilitator Guide**

File: `FACILITATOR_GUIDE.md` (UPDATE)
- Add customization section
- Workshop prep checklist includes config selection
- Troubleshooting config issues

---

## Critical Files Summary

**NEW FILES (21 total)**:
```
src/types/workshop-config.ts
src/config/default-config.ts
src/context/WorkshopConfigContext.tsx
src/hooks/useWorkshopConfig.ts
src/utils/config-merge.ts
src/utils/config-validation.ts
src/utils/config-persistence.ts
src/components/settings/SettingsPanel.tsx
src/components/settings/TemplateSelector.tsx
src/components/settings/ThresholdEditor.tsx
src/components/settings/ContextProfileEditor.tsx
src/components/settings/TechnologyFactorsEditor.tsx
src/components/settings/VariantEditor.tsx
src/components/settings/ConfigImportExport.tsx
public/config/default.json
public/config/regions/east-africa.json
public/config/regions/west-africa.json
public/config/regions/southern-africa.json
public/config/regions/southeast-asia.json
public/config/regions/small-island-states.json
docs/WORKSHOP-CUSTOMIZATION-GUIDE.md
```

**MODIFIED FILES (4 total)**:
```
src/utils/stakeholder-rules.ts
src/utils/calculations.ts
src/utils/sentiment-calculator.ts
src/App.tsx
```

---

## Key Design Decisions

### 1. Backwards Compatibility
- All hooks provide fallback to hardcoded defaults
- Existing code works WITHOUT any config changes
- Gradual migration file-by-file

### 2. Offline-First Architecture
- Regional templates bundled in PWA (public/config/)
- localStorage for facilitator overrides
- No API calls required

### 3. Type Safety
- Full TypeScript interfaces for all configs
- Compile-time validation
- Runtime validation before import

### 4. User Experience
- Simple UI for non-technical facilitators
- Import/export for sharing configs
- Clear metadata displays (template name, region, version)
- Reset buttons for safety

### 5. Flexibility
- Partial configs supported (only override what you need)
- Deep merge allows granular overrides
- Templates can inherit from other templates (basedOn field)

---

## Success Criteria

✅ IRENA can create regional templates without coding
✅ Facilitators can fine-tune thresholds via UI
✅ Configs exportable/importable as JSON
✅ Offline functionality maintained
✅ Zero breaking changes to existing features
✅ All 11 parameter categories customizable:
  1. Stakeholder concern thresholds
  2. Context multipliers (LDC/emerging/developed)
  3. Technology job factors
  4. Technology land factors
  5. Technology emission factors
  6. Stakeholder variants (conservative/pragmatic/progressive)
  7. Interaction trigger thresholds
  8. Sentiment delta thresholds
  9. Sentiment scoring weights
  10. Response template matching thresholds
  11. Priority weights by context

---

## Estimated Timeline

- **Phase 1** (Infrastructure): 2 days
- **Phase 2** (State Management): 2 days
- **Phase 3** (UI Components): 3 days
- **Phase 4** (Integration): 3 days
- **Phase 5** (Templates): 2 days
- **Phase 6** (Testing/Docs): 2 days

**Total: 14 days** (2-3 weeks with buffer)

---

## Risk Mitigation

**Risk**: Breaking existing stakeholder responses
- **Mitigation**: Comprehensive unit tests, backwards compatibility hooks

**Risk**: Facilitators confused by technical parameters
- **Mitigation**: Simple UI with tooltips, sensible defaults, regional templates

**Risk**: Config files too large for PWA bundle
- **Mitigation**: Templates are ~10-20KB each, negligible impact

**Risk**: localStorage conflicts between workshops
- **Mitigation**: Clear labeling, export/import flow, reset buttons

---

## When to Resume This Work

**Prerequisites:**
1. ✅ Communication tab complete (F027-F032)
2. ✅ Persistence features complete (F033-F034)
3. ✅ UX polish complete (F035-F037)
4. ✅ Deployment ready (F038-F042)
5. ✅ At least 1 workshop piloted with default values

**Trigger**: After gathering feedback from first workshop pilots on which parameters need regional customization

---

## Customizable Parameters Discovery

During exploration, found **11 categories** of hardcoded parameters across 4 files:

### From `stakeholder-profiles.ts`:
- Base concern trigger thresholds (70+ triggers across 9 stakeholders)
- Positive indicator thresholds (50+ indicators)
- Template matching thresholds (investment, RE share, etc.)

### From `stakeholder-enhancements.ts`:
- Context multipliers (LDC: 0.5-0.8×, Developed: 1.3-1.4×)
- Variant threshold multipliers (conservative/pragmatic/progressive)
- Multi-metric interaction triggers (27 triggers total)
- Priority weights per context

### From `technology-factors.ts`:
- Job factors: construction (3-15 jobs/MW) and operations (0.05-1.0 jobs/MW)
- Land factors: 0.1-2.2 ha/MW
- Emission factors: 400-950 tCO2/GWh

### From `sentiment-calculator.ts`:
- Delta thresholds (5%, 10%, 15%, 20% changes)
- Scoring weights (+/- 1 to 3 points per metric)
- Severity exceedance ratios (0.2, 0.5 for low/medium/high)

**All documented in plan for future implementation**

---

## Next Steps After F027-F042 Complete

1. Review this plan with IRENA team
2. Prioritize which parameters are most critical for regional customization
3. Simplify scope if needed based on workshop pilot feedback
4. Create feature branch: `feature/workshop-customization`
5. Start with Phase 1: Type definitions
