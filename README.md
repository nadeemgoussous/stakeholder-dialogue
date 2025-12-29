# Scenario Dialogue Tool

<div align="center">

**Interactive stakeholder engagement tool for energy scenario planning**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

*Part of IRENA's Participatory Processes for Strategic Energy Planning toolkit*

</div>

---

## 📋 Overview

The Scenario Dialogue Tool helps energy planners bridge the gap between technical modelling and stakeholder engagement. It simulates how different stakeholder groups would respond to energy scenarios, helping planners:

- **Anticipate concerns** before engaging real stakeholders
- **Visualize co-benefits** using metrics that matter to different audiences
- **Practice communication** through predict-before-reveal pedagogy
- **Generate materials** tailored to specific stakeholder groups

### Key Principle: Complement, Don't Contradict

This tool **complements** energy system optimization models (MESSAGE, OSeMOSYS, LEAP, SPLAT) - it does not replace them. It shows directional impacts for discussion purposes using soft metrics (jobs, land use, emissions) while always deferring to full models for technical feasibility.

---

## ✨ Key Features

### 🎯 **Offline-First Design**
- Works 100% offline after initial load (PWA)
- No internet dependency for workshops in remote venues
- Silent failover between AI and rule-based responses

### 👥 **Nine Stakeholder Perspectives**
Simulates responses from:
- Policy Makers & Regulators
- Grid Operators
- Industry & Business
- Public & Communities
- CSOs & NGOs
- Scientific Institutions
- Financial Institutions
- Regional Bodies (power pools)
- Development Partners

### 📊 **Flexible Data Import**
- **CSV Upload**: Import real model outputs (SPLAT, MESSAGE, OSeMOSYS, LEAP)
- **Excel Template**: Pre-formatted template for quick data entry
- **Quick Entry**: Simplified form for key metrics
- **JSON**: Direct JSON import/export

### 🤖 **Multi-Tier AI Enhancement**
1. **WebLLM** (browser-based, zero installation) - *Coming Soon*
2. **Ollama** (local server for facilitators)
3. **Cloud API** (optional, requires API key)
4. **Rule-based** (always works, no AI required)

### 🧠 **Predict-Before-Reveal Pedagogy**
Interactive learning workflow:
1. User predicts stakeholder response
2. Tool reveals simulated response
3. User reflects on differences
4. Builds stakeholder empathy and anticipation skills

### 🎨 **Context-Aware Responses**
- **Development Context**: Adjusts for LDC/Emerging/Developed country stage
- **Stakeholder Variants**: Conservative, Pragmatic, or Progressive perspectives
- **Multi-Metric Triggers**: Detects complex scenario patterns (e.g., high RE + low storage)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Modern browser** (Chrome 113+, Edge 113+, Firefox 115+, Safari 16+)
- **Optional**: Ollama for local AI enhancement

### Installation

```bash
# Clone the repository
git clone https://github.com/IRENA/stakeholder-dialogue-tool.git
cd stakeholder-dialogue-tool

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
# Build PWA
npm run build

# Preview production build
npm run preview
```

The `dist/` folder contains the production-ready PWA that can be:
- Hosted on any static web server
- Distributed on USB drives for offline workshops
- Deployed to GitHub Pages, Netlify, Vercel, etc.

---

## 📖 Usage

### 1. Import Scenario Data

Choose one of four import methods:

#### Option A: CSV Upload (Recommended for Model Outputs)
1. Click **"Upload CSV File"**
2. Select your model output CSV (SPLAT, MESSAGE, OSeMOSYS, etc.)
3. Configure column mappings
4. Preview and load scenario

#### Option B: Excel Template
1. Download `SCENARIO-INPUT-TEMPLATE.xlsx` from `/public/templates/`
2. Fill in your scenario data
3. Copy the generated JSON
4. Paste into tool

#### Option C: Quick Entry Form
1. Click **"Quick Entry Form"**
2. Enter basic scenario metrics (7-10 fields per milestone)
3. Add/remove milestone years as needed
4. Load scenario

#### Option D: Load Example
- Click **"Load Example"** to explore with sample data (ScenarioLand baseline scenario)

### 2. Explore Stakeholder Responses

1. Select a stakeholder group (e.g., "Grid Operators")
2. **Predict**: Write what you think they'll say
3. **Reveal**: See the simulated response
4. **Compare**: Reflect on differences
5. Adjust **Response Settings**:
   - Development Context (LDC/Emerging/Developed)
   - Stakeholder Variant (Conservative/Pragmatic/Progressive)

### 3. Explore Impacts (Optional)

- Adjust scenario parameters (RE share, coal phaseout, etc.)
- See directional impacts on:
  - Jobs (construction + operations)
  - Land use (hectares)
  - Emissions (Mt CO₂)
  - Stakeholder sentiment

### 4. Generate Communications (Coming Soon)

- Select target audience
- Generate tailored summaries and talking points

---

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa + Workbox
- **Storage**: IndexedDB (Dexie.js)
- **Testing**: Playwright
- **AI**: WebLLM (browser), Ollama (local), Anthropic API (cloud)

### Project Structure

```
stakeholder_dialogue/
├── src/
│   ├── components/       # React components
│   │   ├── input/        # Data import components
│   │   ├── stakeholder/  # Stakeholder dialogue UI
│   │   ├── calculator/   # Soft metrics calculations
│   │   └── output/       # Communication outputs
│   ├── data/             # Stakeholder profiles & factors
│   ├── utils/            # Response generation & calculations
│   ├── types/            # TypeScript interfaces
│   └── App.tsx           # Main app component
├── docs/                 # Extended documentation
├── public/
│   ├── icons/            # Stakeholder icons
│   ├── templates/        # Excel template
│   └── sample-data/      # Example scenarios
├── tests/e2e/            # Playwright tests
└── archive/              # Historical documentation
```

### Key Documentation

- **[CLAUDE.md](CLAUDE.md)** - Full project specification and agent instructions
- **[docs/STAKEHOLDER-PROFILES.md](docs/STAKEHOLDER-PROFILES.md)** - Detailed stakeholder definitions
- **[docs/DATA-SCHEMAS.md](docs/DATA-SCHEMAS.md)** - TypeScript interfaces and data structures
- **[docs/TECHNICAL-IMPLEMENTATION.md](docs/TECHNICAL-IMPLEMENTATION.md)** - Implementation guides
- **[docs/UI-DESIGN.md](docs/UI-DESIGN.md)** - Design system and components
- **[docs/SIMPLIFIED-SCHEMA-DESIGN.md](docs/SIMPLIFIED-SCHEMA-DESIGN.md)** - Flexible schema design
- **[docs/OLLAMA-SETUP.md](docs/OLLAMA-SETUP.md)** - Local AI setup guide
- **[docs/WORKSHOP-DEPLOYMENT.md](docs/WORKSHOP-DEPLOYMENT.md)** - Workshop deployment guide

---

## 🧪 Testing

```bash
# Run all tests (multi-browser)
npm test

# Run specific test file (Chromium only, faster)
npm test tests/e2e/01-app-loads.spec.ts -- --project=chromium

# Run tests in UI mode
npx playwright test --ui

# Generate test report
npx playwright show-report
```

---

## 🌍 Workshop Deployment

### Pre-Workshop Checklist

- [ ] Build production PWA (`npm run build`)
- [ ] Test offline functionality (DevTools offline mode)
- [ ] Prepare Excel template with instructions
- [ ] Load sample scenarios for target region
- [ ] Copy `dist/` folder to USB drives (for offline distribution)
- [ ] Optional: Set up Ollama on facilitator laptop
- [ ] Print facilitator guide

### Offline Distribution

The tool can run entirely from a USB drive:

1. Build production PWA: `npm run build`
2. Copy `dist/` folder to USB drive
3. Participants open `dist/index.html` in their browser
4. Tool works offline (no installation required)

See [docs/WORKSHOP-DEPLOYMENT.md](docs/WORKSHOP-DEPLOYMENT.md) for detailed instructions.

---

## 🤝 Contributing

Contributions are welcome! This tool is designed to be adaptable to different regional contexts.

### Areas for Contribution

- **Regional Adaptations**: Customize stakeholder profiles for specific regions
- **Model Compatibility**: Add parsers for additional energy models
- **Translations**: Add UI translations (currently English)
- **Stakeholder Groups**: Add region-specific stakeholder types
- **Example Scenarios**: Contribute sample scenarios from different contexts

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Convention

We use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation updates
- `test:` - Test updates

---

## 📊 Soft Metrics Methodology

### What We Calculate

- ✅ **Jobs**: Construction (job-years) + operations (permanent positions)
  - Based on IRENA job factor studies
  - Technology-specific multipliers

- ✅ **Land Use**: Hectares required for renewable energy installations
  - Solar PV, wind, battery storage
  - Other technologies too site-specific to estimate

- ✅ **Emissions**: CO₂ from fossil fuel combustion
  - Annual emissions trajectory
  - Percent reduction from baseline

### What We DO NOT Calculate

- ❌ LCOE (levelized cost of electricity)
- ❌ Tariff implications
- ❌ System reliability metrics
- ❌ Reserve margin adequacy
- ❌ Dispatch feasibility
- ❌ Transmission constraints

**All pages showing calculations display a prominent disclaimer:**

> ⚠️ **ILLUSTRATIVE ESTIMATES ONLY**
> These figures show directional impacts for discussion purposes.
> They do NOT replace energy system optimization model analysis.
> Always verify feasibility in the full model.

---

## 🔧 Configuration

### AI Enhancement (Optional)

#### Ollama (Local)

```bash
# Install Ollama
# Visit https://ollama.ai/download

# Pull recommended model
ollama pull llama3.2:3b

# Start Ollama (runs on http://localhost:11434)
ollama serve
```

Configure in tool: Settings → AI Enhancement → Ollama → Enable

#### Cloud API

Configure in tool: Settings → AI Enhancement → Cloud API
- Enter API key
- Select model (Claude, GPT-4, etc.)

#### WebLLM (Browser) - Coming Soon

Zero installation, runs in browser using WebGPU.
- Model: Phi-3.5-mini-instruct (~800MB)
- Downloads once, cached in browser
- Works offline after initial load

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

This tool was developed as part of IRENA's capacity building program for energy planning. It builds on:

- **IRENA's Participatory Processes Toolkit** - Stakeholder engagement framework
- **IRENA Job Factor Studies** - Employment multipliers for renewable energy
- **Energy Planning Community** - Insights from MESSAGE, OSeMOSYS, LEAP, and SPLAT users
- **Workshop Participants** - Feedback from energy planning professionals worldwide

---

## 📧 Contact

For questions, suggestions, or support:

- **GitHub Issues**: [Report bugs or request features](https://github.com/IRENA/stakeholder-dialogue-tool/issues)
- **Email**: [capacity-building@irena.org](mailto:capacity-building@irena.org)
- **IRENA Website**: [www.irena.org](https://www.irena.org)

---

## 🗺️ Roadmap

### Current Status (v0.9 - Beta)

- ✅ Offline-first PWA architecture
- ✅ CSV import with flexible schema
- ✅ Nine stakeholder profiles with context-aware responses
- ✅ Rule-based response generation (always works)
- ✅ Ollama integration (local AI)
- ✅ Predict-before-reveal pedagogy
- ✅ Soft metrics calculations (jobs, land, emissions)
- ⏳ Test suite updates (in progress)

### Upcoming (v1.0 - Release)

- 🔜 WebLLM browser-based AI (zero installation)
- 🔜 Communication tab (audience-specific outputs)
- 🔜 Multi-scenario comparison
- 🔜 Excel template with VBA macros
- 🔜 Translations (French, Spanish, Arabic)

### Future Enhancements

- Multi-user collaboration features
- Additional stakeholder groups (labor unions, indigenous communities)
- Integration with online model APIs
- Mobile app version
- Sector expansion (water, transport, industry)

---

<div align="center">

**Built with ❤️ by the IRENA Capacity Building Team**

[Website](https://www.irena.org) • [Documentation](docs/) • [Report Issue](https://github.com/IRENA/stakeholder-dialogue-tool/issues)

</div>
