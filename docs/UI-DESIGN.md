# UI Design Specifications

This document contains design system specifications, layout mockups, and user interface guidelines for the Scenario Dialogue Tool.

## Design System

### IRENA Brand Colors

```typescript
const designTokens = {
  colors: {
    // Primary brand colors
    primary: '#0078a7',        // IRENA blue
    primaryDark: '#005373',    // Darker shade for hover states
    accent: '#f7941d',         // Orange accent for highlights

    // Stakeholder colors (from IRENA toolkit)
    policyMakers: '#c94f4f',
    gridOperators: '#4a90a4',
    industry: '#7b8a3e',
    public: '#e8a54b',
    csosNgos: '#6b4c9a',
    scientific: '#3d7ea6',
    finance: '#2e5a3a',
    regionalBodies: '#1a5276',
    developmentPartners: '#117a65',

    // Neutral colors
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceElevated: '#ffffff',
    border: '#e0e0e0',
    borderLight: '#f0f0f0',
    text: '#333333',
    textSecondary: '#666666',
    textDisabled: '#999999',

    // Semantic colors
    success: '#2e7d32',
    successLight: '#e8f5e9',
    warning: '#f57c00',
    warningLight: '#fff3e0',
    error: '#c62828',
    errorLight: '#ffebee',
    info: '#0288d1',
    infoLight: '#e1f5fe'
  },

  typography: {
    fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    headingFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    // Font sizes (rem)
    h1: '2.5rem',      // 40px
    h2: '2rem',        // 32px
    h3: '1.5rem',      // 24px
    h4: '1.25rem',     // 20px
    h5: '1.125rem',    // 18px
    body: '1rem',      // 16px
    small: '0.875rem', // 14px
    tiny: '0.75rem',   // 12px

    // Font weights
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },

  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out'
  }
};
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'irena-blue': '#0078a7',
        'irena-blue-dark': '#005373',
        'irena-orange': '#f7941d',
        'stakeholder-policy': '#c94f4f',
        'stakeholder-grid': '#4a90a4',
        'stakeholder-industry': '#7b8a3e',
        'stakeholder-public': '#e8a54b',
        'stakeholder-csos': '#6b4c9a',
        'stakeholder-science': '#3d7ea6',
        'stakeholder-finance': '#2e5a3a',
        'stakeholder-regional': '#1a5276',
        'stakeholder-development': '#117a65',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif']
      }
    }
  }
};
```

---

## Application Layout

### Four-Tab Structure

1. **Input** - Data import (5 minutes max)
2. **Stakeholder Dialogue** - Predict-before-reveal learning
3. **Explore Impacts** - Directional sensitivity (soft metrics only)
4. **Communicate** - Audience-specific outputs

### Main App Shell

```
┌─────────────────────────────────────────────────────────────┐
│  [IRENA Logo]    Scenario Dialogue Tool        [Settings ⚙] │
├─────────────────────────────────────────────────────────────┤
│  [Input] [Stakeholder Dialogue] [Explore] [Communicate]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                    Tab Content Area                          │
│                                                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Status: ScenarioLand High RE Scenario | Offline Mode ✓           │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 1: Data Input

### Input Options Screen

```
┌─────────────────────────────────────────────────────────────┐
│  DATA INPUT                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Choose how to input your scenario data:                     │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │   📊 FROM FILE     │  │   ✏️ QUICK ENTRY  │            │
│  │                    │  │                    │            │
│  │  Import from JSON  │  │  Enter key metrics │            │
│  │  or paste from     │  │  manually (10 min) │            │
│  │  Excel template    │  │                    │            │
│  │                    │  │                    │            │
│  │  [Upload/Paste]    │  │  [Start Entry]     │            │
│  └────────────────────┘  └────────────────────┘            │
│                                                              │
│  ┌────────────────────┐                                     │
│  │   🔍 LOAD EXAMPLE  │                                     │
│  │                    │                                     │
│  │  Try the tool with │                                     │
│  │  sample scenario   │                                     │
│  │                    │                                     │
│  │  [Load Sample]     │                                     │
│  └────────────────────┘                                     │
│                                                              │
│  ℹ️  Download Excel template: [SPLAT-OUTPUT-IMPORTER.xlsx] │
└─────────────────────────────────────────────────────────────┘
```

### Quick Entry Form

```
┌─────────────────────────────────────────────────────────────┐
│  QUICK ENTRY FORM                              Progress: 40% │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SCENARIO METADATA                                           │
│  Country/Region:    [________________]                       │
│  Scenario Name:     [________________]                       │
│                                                              │
│  CAPACITY (MW)                                               │
│                           2030         2040                  │
│  Renewable capacity:     [____]        [____]                │
│  Fossil capacity:        [____]        [____]                │
│  Battery storage:        [____]        [____]                │
│                                                              │
│  INVESTMENT (USD millions)                                   │
│  Total to 2030:          [________]                          │
│  Total to 2050:          [________]                          │
│                                                              │
│  EMISSIONS (Mt CO2)                                          │
│                     2025    2030    2040    2050             │
│  Emissions:        [___]   [___]   [___]   [___]            │
│                                                              │
│  [< Back]                          [Continue >]             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 2: Stakeholder Dialogue

### Predict-Before-Reveal Interface

```
┌─────────────────────────────────────────────────────────────┐
│  STAKEHOLDER DIALOGUE                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SELECT STAKEHOLDER:                                         │
│                                                              │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐            │
│  │🏛️│ │⚡│ │🏭│ │👥│ │🌿│ │🔬│ │💰│ │🌍│ │🤝│            │
│  └──┘ └▲─┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘            │
│       Grid                                                   │
│    Operators                                                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  YOUR PREDICTION                                      │   │
│  │  ──────────────────────────────────────────────────   │   │
│  │  What do you think Grid Operators will say about     │   │
│  │  this scenario?                                       │   │
│  │                                                       │   │
│  │  Consider their priorities:                           │   │
│  │  • System reliability and security of supply          │   │
│  │  • Manageable renewable integration pace              │   │
│  │  • Transmission infrastructure planning               │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ I think they will be concerned about the high  │  │   │
│  │  │ renewable share and will want to know about    │  │   │
│  │  │ battery storage and grid upgrades needed...    │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                        [78/20 chars] │   │
│  │                                                       │   │
│  │                      [Reveal Response]                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Response Comparison View

```
┌─────────────────────────────────────────────────────────────┐
│  COMPARE YOUR PREDICTION                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  YOUR PREDICTION:                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ I think they will be concerned about the high        │   │
│  │ renewable share and will want to know about battery  │   │
│  │ storage and grid upgrades needed...                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  SIMULATED GRID OPERATOR RESPONSE:            [Rule-based]  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ## Initial Reaction                                  │   │
│  │  This scenario shows ambition but raises important    │   │
│  │  questions about implementation pace and flexibility  │   │
│  │  resources to maintain system reliability.            │   │
│  │                                                       │   │
│  │  ## What They Would Appreciate                        │   │
│  │  ✓ Interconnector expansion of 500 MW by 2040        │   │
│  │    enables regional power balancing                   │   │
│  │  ✓ Battery storage deployment of 500 MW by 2040      │   │
│  │    provides essential system flexibility              │   │
│  │                                                       │   │
│  │  ## Key Concerns                                      │   │
│  │  ⚠ Variable renewable share of 70% by 2040 requires  │   │
│  │    significant transmission infrastructure upgrades   │   │
│  │  ⚠ Limited battery storage before 2035 may           │   │
│  │    constrain renewable integration pace               │   │
│  │                                                       │   │
│  │  ## Questions They Would Ask                          │   │
│  │  ? What transmission upgrades are assumed?            │   │
│  │  ? What flexibility resources support high RE shares? │   │
│  │  ? How are interconnector flows coordinated?          │   │
│  │                                                       │   │
│  │  ## Advice for Engaging Grid Operators               │   │
│  │  → Engage early to incorporate existing plans        │   │
│  │  → Include distribution-level operators               │   │
│  │  → Prioritize cost-efficient solutions                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  💭 REFLECTION: How did your prediction compare?            │
│                                                              │
│  [Try Another Stakeholder]  [Export Brief]  [Explore >]     │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 3: Explore Impacts

### Adjustment Calculator

```
┌─────────────────────────────────────────────────────────────┐
│  EXPLORE IMPACTS                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⚠️ DIRECTIONAL INDICATORS ONLY - NOT TECHNICAL ANALYSIS   │
│                                                              │
│  ADJUST SCENARIO PARAMETERS:                                 │
│                                                              │
│  Renewable Share Target 2040:  [||||||||----] 65%           │
│                                                              │
│  Investment Level:  ○ Low  ● Base  ○ High                   │
│                                                              │
│  Coal Phase-out Year:  [2035 ▼]                             │
│                                                              │
│  ─────────────────────────────────────────────────────       │
│                                                              │
│  DIRECTIONAL IMPACTS:                                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Jobs         │  │ Land Use     │  │ Emissions    │      │
│  │   ↑ +15%     │  │   ↑ +20%     │  │   ↓ -25%     │      │
│  │ Significant  │  │ Significant  │  │ Significant  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  STAKEHOLDER SENTIMENT CHANGES:                              │
│                                                              │
│  CSOs & NGOs:            ↗ More positive                    │
│    + Ambitious renewable target                              │
│    + Early coal phase-out                                    │
│                                                              │
│  Public & Communities:   → Mixed                            │
│    + More local jobs                                         │
│    - Increased land requirements                             │
│                                                              │
│  Financial Institutions: ↘ More cautious                    │
│    - Higher investment requirements                          │
│                                                              │
│  [Reset to Base]                    [Generate New Dialogue] │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 4: Communicate

### Output Generation

```
┌─────────────────────────────────────────────────────────────┐
│  COMMUNICATE RESULTS                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Generate stakeholder-specific briefs and presentations:     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SELECT STAKEHOLDERS:                                 │   │
│  │  ☑ Policy Makers & Regulators                         │   │
│  │  ☑ Grid Operators                                     │   │
│  │  ☐ Industry & Business                                │   │
│  │  ☑ Public & Communities                               │   │
│  │  ☐ CSOs & NGOs                                        │   │
│  │  ☐ Scientific Institutions                            │   │
│  │  ☐ Financial Institutions                             │   │
│  │  ☐ Regional Bodies                                    │   │
│  │  ☐ Development Partners                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  OUTPUT FORMAT:                                              │
│  ○ PDF Brief (summary + key messages)                       │
│  ○ PowerPoint Slides (presentation-ready)                   │
│  ○ Word Document (detailed report)                          │
│  ○ JSON Data (for further analysis)                         │
│                                                              │
│  INCLUDE:                                                    │
│  ☑ Scenario overview                                        │
│  ☑ Anticipated responses                                    │
│  ☑ Engagement advice                                        │
│  ☑ Key metrics & visualizations                             │
│  ☐ Your predictions (comparison)                            │
│                                                              │
│  [Preview]                              [Generate & Export] │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Design Patterns

### Stakeholder Icon Button

```jsx
<button className={`
  relative w-16 h-16 rounded-lg
  border-2 transition-all
  ${selected
    ? 'border-stakeholder-grid bg-stakeholder-grid/10 scale-105'
    : 'border-gray-200 hover:border-stakeholder-grid/50'
  }
`}>
  <img src="/icons/grid-operators.svg" alt="Grid Operators" />
  {selected && (
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2
                    text-xs font-medium text-stakeholder-grid">
      Selected
    </div>
  )}
</button>
```

### Concern Card

```jsx
<div className="border-l-4 border-warning bg-warning-light p-4 rounded-r-md">
  <div className="flex items-start gap-3">
    <span className="text-2xl">⚠</span>
    <div>
      <p className="font-medium text-gray-900">
        Variable renewable share of 70% by 2040 requires significant
        transmission infrastructure upgrades
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Grid operators need time and investment for infrastructure adaptation.
      </p>
      <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500">
        <span className="px-2 py-1 bg-warning/20 rounded">Medium severity</span>
        <span>Metric: renewableShare.2040</span>
      </div>
    </div>
  </div>
</div>
```

### Appreciation Card

```jsx
<div className="border-l-4 border-success bg-success-light p-4 rounded-r-md">
  <div className="flex items-start gap-3">
    <span className="text-2xl">✓</span>
    <div>
      <p className="font-medium text-gray-900">
        Interconnector expansion of 500 MW by 2040 enables regional
        power balancing
      </p>
    </div>
  </div>
</div>
```

### Disclaimer Alert

```jsx
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  <div className="flex gap-3">
    <span className="text-yellow-600 text-xl shrink-0">⚠️</span>
    <div>
      <h3 className="font-semibold text-yellow-900 mb-1">
        ILLUSTRATIVE ESTIMATES ONLY
      </h3>
      <p className="text-sm text-yellow-800">
        These figures show directional impacts for discussion purposes.
        They do NOT replace optimization model technical analysis.
        Always verify feasibility in the full model.
      </p>
    </div>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  mobile: '320px',      // Mobile phones
  tablet: '768px',      // Tablets
  desktop: '1024px',    // Desktop
  wide: '1280px',       // Wide desktop
};
```

### Mobile Adaptations

- Stack stakeholder icons vertically on mobile
- Single-column layout for response view
- Collapsible sections for long content
- Bottom navigation for tabs
- Larger touch targets (min 44x44px)

### Tablet Optimizations

- Two-column layout for stakeholder selection
- Side-by-side prediction/response comparison
- Persistent tab navigation

### Desktop Experience

- Full multi-column layouts
- Persistent sidebar navigation
- Hover states and tooltips
- Keyboard shortcuts

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast

All text meets WCAG AA contrast ratios:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

### Keyboard Navigation

- All interactive elements keyboard accessible
- Visible focus indicators
- Logical tab order
- Keyboard shortcuts (with tooltips)

### Screen Reader Support

- Semantic HTML structure
- ARIA labels for icon buttons
- ARIA live regions for dynamic content
- Alt text for all images

### Other Considerations

- No flashing content
- Sufficient text spacing
- Resizable text (up to 200%)
- Clear error messages

---

## Offline Mode Indicators

### Online Status

```jsx
<div className="flex items-center gap-2 text-sm">
  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
  <span className="text-gray-600">Online - AI enhancement available</span>
</div>
```

### Offline Status

```jsx
<div className="flex items-center gap-2 text-sm">
  <div className="w-2 h-2 bg-gray-400 rounded-full" />
  <span className="text-gray-600">Offline - Using rule-based responses</span>
</div>
```

---

## Animation Guidelines

### Principles

- Use animations to guide attention, not distract
- Keep durations short (150-350ms)
- Respect `prefers-reduced-motion`

### Common Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## Print Styles

For PDF export and printing:

```css
@media print {
  /* Hide navigation and interactive elements */
  nav, button, .no-print {
    display: none !important;
  }

  /* Ensure proper page breaks */
  .stakeholder-response {
    page-break-inside: avoid;
  }

  /* Optimize colors for printing */
  .bg-primary {
    background-color: #0078a7 !important;
    -webkit-print-color-adjust: exact;
  }
}
```
