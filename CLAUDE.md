# Scenario Dialogue Tool

## Project Overview

The Scenario Dialogue Tool is an interactive web application designed to accompany IRENA's capacity building workshops on energy system modelling. It bridges the gap between technical modelling outputs and stakeholder engagement by helping energy planners visualize how different stakeholders would perceive and respond to their energy scenarios.

### Purpose

Energy planners often struggle to balance technical modelling work with stakeholder engagement and communications. This tool helps them:

1. **Understand stakeholder perspectives** on their modelling results through simulated dialogues
2. **Practice anticipating concerns** before engaging real stakeholders (predict-before-reveal pedagogy)
3. **Visualize co-benefits and trade-offs** using soft metrics (jobs, land use, emissions) that matter to different audiences
4. **Communicate results effectively** by generating audience-specific framings of the same underlying data

### Critical Design Principle: Complement, Don't Contradict

**This tool must NEVER contradict energy system optimization models.** Participants may have spent days learning rigorous modelling. This tool is for exploring stakeholder perspectives, NOT for re-running scenarios or calculating technical feasibility.

### Context

This tool is part of IRENA's Participatory Processes for Strategic Energy Planning toolkit, which emphasizes that meaningful stakeholder engagement is essential for achieving ambitious energy and climate goals. The toolkit identifies three core engagement approaches:

- **Knowledge gathering**: Collecting perspectives from stakeholders
- **Co-creation**: Enabling stakeholders to participate in shaping scenarios
- **Knowledge dissemination**: Communicating complex energy concepts to various audiences

This tool primarily supports knowledge dissemination and co-creation by helping planners anticipate stakeholder responses and adapt their communication accordingly.

### Target Users

- Ministry of Energy officials and planners
- Utility planning staff
- Participants in energy planning capacity building workshops (e.g., MESSAGE, OSeMOSYS, LEAP, SPLAT)
- Energy planning professionals seeking to improve stakeholder engagement
- Regional power pool planners

### Workshop Integration

The tool is designed for use in a half-day to full-day module within existing energy planning workshops. Participants will:

1. Import their scenario results using a pre-formatted Excel template (5 minutes max)
2. **Predict** how different stakeholders would respond (learning exercise)
3. **Compare** their predictions to the tool's simulated responses
4. Explore how adjustments affect stakeholder sentiment (directional only)
5. Generate communication materials for different audiences

---

## Critical Architecture Decisions

### 1. OFFLINE-FIRST (Non-Negotiable)

**Internet in workshop venues is often unreliable.** The tool MUST work fully offline.

- **Primary Mode**: Rule-based stakeholder responses (always works)
- **Enhanced Mode**: AI-powered responses (when API available)
- **Silent Failover**: If API fails, switch to rule-based WITHOUT errors or spinners
- **No Loading States for Core Functionality**: The tool should feel instant

### 2. NO SHADOW MODEL

**The tool does NOT recalculate technical/economic feasibility.**

What the tool DOES calculate (soft metrics only):
- Estimated jobs (construction and operations)
- Land use requirements (hectares)
- Emissions trajectory
- Directional stakeholder sentiment

What the tool does NOT calculate:
- ~~LCOE~~ (removed - contradicts optimization model)
- ~~Tariff implications~~ (removed - requires economic modelling)
- ~~Reserve margin impacts~~ (removed - requires dispatch modelling)
- ~~System reliability~~ (removed - requires technical modelling)

**Prominent Disclaimer Required**: "This tool shows DIRECTIONAL impacts only. It does not replace energy system optimization models. Always verify technical feasibility in the full model."

### 3. PREDICT-BEFORE-REVEAL PEDAGOGY

**The goal is to teach participants to think like stakeholders, not to give them answers.**

Workflow:
1. User inputs scenario data
2. User selects a stakeholder group
3. **Tool asks: "What do you think [Stakeholder] will say about this scenario?"**
4. User types their prediction (required, minimum 20 characters)
5. User clicks "Reveal Response"
6. Tool shows simulated stakeholder response
7. **Compare/Contrast moment**: User reflects on differences

This creates active learning, not passive consumption.

### 4. 5-MINUTE DATA INPUT (Not 50 Minutes)

**Energy model outputs can be messy.** We cannot expect participants to manually format CSVs.

Solution:
- Provide a **pre-formatted Excel template** (SCENARIO-INPUT-TEMPLATE.xlsx)
- Template has clear instructions and validates data
- Single "Copy Results" button in Excel copies formatted JSON
- User pastes into tool OR exports as JSON file to upload
- Alternative: Manual entry form for key metrics only (10-15 fields)

---

## Technical Architecture

### Deployment Modes (Priority Order)

1. **PWA (Progressive Web App)** - Primary, works offline after first load
2. **Local Server** - Runs via batch file for fully air-gapped workshops
3. **Hosted Web App** - For remote access and updates

### Technology Stack

- **Frontend**: React 18+ with Vite
- **Styling**: Tailwind CSS (matching IRENA brand colors)
- **State Management**: React Context or Zustand
- **Charts**: Recharts
- **AI Integration**: Anthropic Claude API (optional enhancement, not required)
- **Offline Storage**: IndexedDB via Dexie.js
- **PWA**: vite-plugin-pwa with Workbox
- **Testing**: Playwright for end-to-end testing

### Key Technical Requirements

- **MUST work fully offline** after initial load
- **MUST silently failover** to rule-based responses if API unavailable
- **MUST load and respond in under 2 seconds** for all core interactions
- CSV and JSON import/export for scenario data
- Responsive design (primarily desktop, tablet-friendly)

### File Structure

```
scenario-dialogue-tool/
├── CLAUDE.md                    # This file - project instructions
├── docs/                        # Extended documentation
│   ├── STAKEHOLDER-PROFILES.md  # All 9 stakeholder definitions
│   ├── TECHNICAL-IMPLEMENTATION.md  # Code examples and algorithms
│   ├── DATA-SCHEMAS.md          # TypeScript interfaces and constants
│   └── UI-DESIGN.md             # Design system and mockups
├── feature_list.json            # Feature tracking for development
├── claude-progress.txt          # Session progress log
├── init.sh                      # Development server startup
├── playwright.config.ts         # Testing configuration
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── public/
│   ├── icons/                   # Stakeholder icons from toolkit
│   │   ├── policy-makers.svg
│   │   ├── grid-operators.svg
│   │   ├── industry.svg
│   │   ├── public.svg
│   │   ├── csos-ngos.svg
│   │   ├── scientific.svg
│   │   ├── finance.svg
│   │   ├── regional-bodies.svg
│   │   └── development-partners.svg
│   ├── graphics/                # Toolkit graphics for branding
│   │   ├── planning-cycle.svg
│   │   ├── tool-categories.svg
│   │   └── irena-logo.svg
│   ├── templates/
│   │   └── SCENARIO-INPUT-TEMPLATE.xlsx  # Excel template for data import
│   └── sample-data/
│       └── example-scenario.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── input/
│   │   ├── stakeholder/
│   │   ├── prediction/          # Predict-before-reveal components
│   │   ├── calculator/
│   │   └── output/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   │   ├── calculations.ts      # Soft metrics ONLY (jobs, land, emissions)
│   │   ├── stakeholder-rules.ts # Rule-based responses (PRIMARY)
│   │   ├── stakeholder-ai.ts    # AI responses (OPTIONAL enhancement)
│   │   └── data-transforms.ts
│   ├── data/
│   │   ├── stakeholder-profiles.ts
│   │   └── technology-factors.ts
│   ├── types/
│   └── App.tsx
└── tests/
    └── e2e/
```

---

## Documentation Structure

The project documentation is split into focused files:

1. **[CLAUDE.md](CLAUDE.md)** (this file) - Project overview, architecture decisions, and agent instructions
2. **[docs/STAKEHOLDER-PROFILES.md](docs/STAKEHOLDER-PROFILES.md)** - Detailed profiles for all 9 stakeholder groups
3. **[docs/TECHNICAL-IMPLEMENTATION.md](docs/TECHNICAL-IMPLEMENTATION.md)** - Reference code for response generation, AI enhancement, and calculations
4. **[docs/DATA-SCHEMAS.md](docs/DATA-SCHEMAS.md)** - TypeScript interfaces, data structures, and reference constants
5. **[docs/UI-DESIGN.md](docs/UI-DESIGN.md)** - Design system, layouts, and component specifications

---

## Data Input System

### Design Goal: 5-Minute Import

Participants should go from "I have my model results" to "I'm exploring stakeholder responses" in under 5 minutes.

### Option 1: Excel Template (Recommended)

**SCENARIO-INPUT-TEMPLATE.xlsx** - A macro-enabled Excel workbook that:

1. Has clear input cells for each metric (color-coded)
2. Accepts copy-paste from model result files
3. Validates data and highlights errors
4. Generates JSON with a single button click
5. Instructions in multiple languages (English, French, Spanish)

Template Structure:
```
Sheet 1: Instructions
Sheet 2: Metadata (Country, Scenario Name, Year)
Sheet 3: Capacity (MW by technology and year)
Sheet 4: Generation (GWh by technology and year)
Sheet 5: Emissions (Mt CO2 by year)
Sheet 6: Investment (USD millions by year)
Sheet 7: Demand (Total, Peak, Sectoral)
Sheet 8: OUTPUT (JSON - copy this)
```

### Option 2: Quick Entry Form

For workshops where Excel isn't practical, provide a simplified form with 10-15 essential fields. See [docs/DATA-SCHEMAS.md](docs/DATA-SCHEMAS.md) for the `QuickScenarioInput` interface.

### Option 3: Load Example

Pre-loaded sample scenario for demonstration and testing.

---

## Core Stakeholder Groups

The tool implements nine stakeholder groups. For detailed profiles, concern triggers, and response templates, see **[docs/STAKEHOLDER-PROFILES.md](docs/STAKEHOLDER-PROFILES.md)**.

1. **Policy Makers & Regulators** - Government officials responsible for energy policy
2. **Grid Operators** - Transmission and distribution network operators
3. **Industry & Business** - Energy-intensive industries and developers
4. **Public & Communities** - General public and affected communities
5. **CSOs & NGOs** - Civil society and advocacy organizations
6. **Scientific Institutions** - Universities and research organizations
7. **Financial Institutions** - Banks, development finance institutions, investors
8. **Regional Bodies** - Power pools, regional integration bodies
9. **Development Partners** - Bilateral and multilateral development agencies

Each stakeholder has:
- Unique priorities and concerns
- Typical questions they would ask
- Engagement best practices
- Automated concern triggers based on scenario metrics
- Response templates for common scenarios

---

## Response Generation

The tool uses a two-tier system:

### Primary: Rule-Based Responses (Always Available)

- Works 100% offline
- Fast (< 200ms response time)
- Based on stakeholder profiles and metric thresholds
- Consistent and predictable

### Optional: AI Enhancement (When Available)

- Enhances rule-based responses with more natural language
- 3-second timeout with silent failover
- Never blocks the user or shows errors
- Requires API key configuration

For implementation details, see **[docs/TECHNICAL-IMPLEMENTATION.md](docs/TECHNICAL-IMPLEMENTATION.md)**.

---

## Soft Metrics Calculations

The tool calculates illustrative estimates for:

### Jobs
- Construction jobs (temporary, job-years)
- Operations jobs (permanent positions)
- Based on IRENA job factor studies

### Land Use
- Hectares required by technology
- Only for solar PV, wind, and battery storage
- Other technologies too site-specific

### Emissions
- CO2 emissions from fossil fuel combustion
- Percent reduction from baseline
- Does NOT include lifecycle emissions

**See [docs/DATA-SCHEMAS.md](docs/DATA-SCHEMAS.md) for all job factors, land factors, and emission factors.**

### What We Do NOT Calculate

```typescript
// REMOVED - These require technical modelling
// ❌ LCOE (levelized cost of electricity)
// ❌ Tariff implications
// ❌ Reserve margin adequacy
// ❌ VRE integration limits
// ❌ System reliability metrics
// ❌ Dispatch feasibility
// ❌ Transmission constraints
```

### Required Disclaimer

Every page showing calculations MUST display:

```
⚠️ ILLUSTRATIVE ESTIMATES ONLY
These figures show directional impacts for discussion purposes.
They do NOT replace energy system optimization model analysis.
Always verify feasibility in the full model.
```

---

## User Interface

The tool uses a four-tab layout:

1. **Input** - Data import (5 minutes max)
2. **Stakeholder Dialogue** - Predict-before-reveal learning
3. **Explore Impacts** - Directional sensitivity (soft metrics only)
4. **Communicate** - Audience-specific outputs

For complete design specifications, mockups, and component patterns, see **[docs/UI-DESIGN.md](docs/UI-DESIGN.md)**.

### Design Principles

- **IRENA branding** - Official colors and typography
- **Accessibility** - WCAG 2.1 AA compliant
- **Responsive** - Desktop primary, tablet-friendly
- **Offline indicators** - Clear status of AI availability
- **Fast feedback** - No unnecessary loading states

---

## Agent Instructions for Claude Code

### On First Run (Initializer Mode)

If `claude-progress.txt` does not exist:

1. Create `init.sh` with:
   - `npm install`
   - `npm run dev`

2. Create `feature_list.json` with ALL features marked `"passes": false`

3. Create `claude-progress.txt` with initial state

4. Set up project structure:
   - Initialize Vite + React + TypeScript
   - Configure Tailwind with IRENA tokens (see docs/UI-DESIGN.md)
   - Set up PWA configuration IMMEDIATELY (offline-first)
   - Create placeholder components

5. Make initial git commit

### On Subsequent Runs (Coding Agent Mode)

If `claude-progress.txt` exists:

1. Run `pwd` to confirm directory
2. Read `claude-progress.txt` and `git log --oneline -20`
3. Read `feature_list.json` for next failing feature
4. Run `./init.sh` to start dev server
5. Work on ONE feature only
6. Test with Playwright (use Chromium-only during development, multi-browser before commits)
7. Mark feature `"passes": true` only after testing
8. Git commit
9. Update `claude-progress.txt`

### Critical Rules

- **OFFLINE-FIRST**: PWA and rule-based responses are PRIORITY 1
- Work on ONE feature per session
- NEVER edit feature descriptions, only `passes` field
- ALWAYS leave code committable
- Reference CLAUDE.md and docs/ for all specifications
- Test offline functionality explicitly
- **Token Optimization**: Use Chromium-only tests during development (`--project=chromium`), full multi-browser before commits

### Reference Documentation

When implementing features, consult:

- **Stakeholder logic**: [docs/STAKEHOLDER-PROFILES.md](docs/STAKEHOLDER-PROFILES.md)
- **Response generation**: [docs/TECHNICAL-IMPLEMENTATION.md](docs/TECHNICAL-IMPLEMENTATION.md)
- **Data structures**: [docs/DATA-SCHEMAS.md](docs/DATA-SCHEMAS.md)
- **UI components**: [docs/UI-DESIGN.md](docs/UI-DESIGN.md)

---

## Adaptability and Customization

### Regional Adaptations

The tool is designed to be adaptable to different regional contexts:

- **Replace regional body profiles** - E.g., SAPP for Southern Africa, WAPP for West Africa, various regional power pools
- **Adjust concern thresholds** - Based on local benchmarks and policy targets
- **Customize stakeholder lists** - Add/remove stakeholders based on local context
- **Localize language** - Support multiple languages in UI and templates

### Model Compatibility

The tool accepts outputs from various energy models:

- **MESSAGE** (IIASA's integrated assessment model)
- **OSeMOSYS** (Open Source Energy Modelling System)
- **LEAP** (Long-range Energy Alternatives Planning system)
- **SPLAT** (Long-term electricity planning model)
- **Custom models** - As long as they provide the required data schema

### Example Scenarios

Sample scenarios should represent diverse contexts:
- Different regions (Africa, Asia, Latin America, Small Island States)
- Different starting points (high fossil, high hydro, island grids)
- Different ambition levels (business-as-usual, moderate, ambitious)

---

## Testing Strategy

### Browser Testing Efficiency

To optimize token usage during development, use targeted browser testing:

**During Active Development:**
- Run Chromium-only tests: `npm test -- <test-file> --project=chromium`
- Saves ~75% tokens (~6,000-7,500 tokens per full test run)
- Chromium tests are sufficient for most logic/data validation

**Before Commits:**
- Run full multi-browser suite: `npm test -- <test-file>`
- Tests across Chromium, Firefox, Webkit, and Mobile Safari
- Essential for PWA and cross-browser compatibility verification

**Token Usage Estimates:**
- Chromium-only: ~2,000-2,500 tokens
- Multi-browser (4 browsers): ~8,000-10,000 tokens

**When to Use Multi-Browser:**
- Before git commits
- CSS/styling changes
- PWA/offline functionality changes
- Final feature validation
- Responsive design updates

### Critical Test Scenarios

1. **Offline functionality**
   - Tool loads without internet
   - Responses generate without API
   - Data persists in IndexedDB

2. **Data import**
   - Excel template correctly formats JSON
   - Quick entry validates inputs
   - Example data loads properly

3. **Predict-before-reveal workflow**
   - Prediction required before reveal
   - Comparison view shows both
   - Can try multiple stakeholders

4. **Response generation**
   - Rule-based always works
   - AI enhancement fails gracefully
   - Responses match stakeholder profiles

5. **Accessibility**
   - Keyboard navigation works
   - Screen reader compatible
   - Color contrast passes WCAG AA

---

## Deployment Checklist

Before deploying to workshops:

- [ ] PWA works offline (test with DevTools offline mode)
- [ ] Excel template tested with real model outputs
- [ ] Sample scenarios represent target region
- [ ] All disclaimers present and prominent
- [ ] Response generation < 2 seconds
- [ ] Works on tablets (9.7" and larger)
- [ ] Tested in low-bandwidth environment
- [ ] User documentation prepared
- [ ] Facilitator guide written
- [ ] Backup USB drives prepared (for offline distribution)

---

## Critical Pre-Deployment Enhancement

### WebLLM Integration (F043) - HIGH PRIORITY

**Status**: PLANNED - Package installed, awaiting implementation
**Priority**: Must complete before workshop deployment
**Implementation Guide**: docs/WEBLLM-IMPLEMENTATION.md

**Why Critical**:
- Current Ollama implementation requires separate installation (facilitators only)
- Workshop participants need zero-setup AI enhancement
- WebLLM enables truly offline AI in browser (no installation required)

**Benefits**:
- ✅ Zero installation for participants
- ✅ Runs 100% in browser (WebGPU)
- ✅ Truly offline after first model load
- ✅ Privacy-preserving (data stays local)
- ✅ PWA compatible
- ✅ Can be pre-loaded on USB drives

**Model**: Phi-3.5-mini-instruct (~800MB, one-time download)
**Browser Support**: Chrome 113+, Edge 113+ (WebGPU required)
**Performance**: 2-4 seconds inference on modern hardware
**Fallback**: Silent failover to Ollama or rule-based if unsupported

**Implementation Priority**: After completing current features (F022-F042), before final packaging

---

## Future Enhancements (Not Initial Scope)

Potential future additions (after WebLLM):

- Multi-scenario comparison
- Sensitivity analysis visualization
- Collaborative features (multi-user)
- Integration with online models
- Mobile app version
- Additional stakeholder groups (e.g., labor unions, indigenous communities)
- Support for other sectors (water, transport, industry)

---

*This tool is designed to improve energy planning stakeholder engagement worldwide. It complements rigorous technical modelling with accessible communication and anticipatory stakeholder analysis.*
