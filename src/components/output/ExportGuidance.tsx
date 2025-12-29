/**
 * Export Guidance Component - F031
 *
 * Teaches users how to create their own communication materials with:
 * - Step-by-step instructions
 * - Copy Key Data functionality (scenario metrics as text)
 * - Downloadable template files (PowerPoint, Word, Infographic)
 * - Guidance on local customization
 * - Links to IRENA toolkit resources
 *
 * Educational focus: Provide starter materials, not automated generation
 */

import { useState } from 'react';
import type { ScenarioInput } from '../../types/scenario';

interface ExportGuidanceProps {
  scenario: ScenarioInput;
  onBack?: () => void;
}

interface TemplateDownload {
  id: string;
  name: string;
  description: string;
  format: string;
  icon: string;
  filename: string;
}

const TEMPLATE_DOWNLOADS: TemplateDownload[] = [
  {
    id: 'ppt-outline',
    name: 'Presentation Outline',
    description: 'PowerPoint structure with slide titles, key points, and speaker notes placeholders',
    format: 'Markdown (.md)',
    icon: '📊',
    filename: 'presentation-outline.md',
  },
  {
    id: 'policy-brief',
    name: 'Policy Brief Template',
    description: 'Word document structure for executive summaries and policy recommendations',
    format: 'Markdown (.md)',
    icon: '📄',
    filename: 'policy-brief-template.md',
  },
  {
    id: 'infographic-structure',
    name: 'Infographic Structure',
    description: 'Visual layout guide with sections, data callouts, and design tips',
    format: 'Markdown (.md)',
    icon: '🎨',
    filename: 'infographic-structure.md',
  },
  {
    id: 'community-flyer',
    name: 'Community Flyer Template',
    description: 'Simple one-page structure for community outreach materials',
    format: 'Markdown (.md)',
    icon: '📢',
    filename: 'community-flyer-template.md',
  },
];

const CREATION_STEPS = [
  {
    step: 1,
    title: 'Identify Your Audience',
    description: 'Use the Dissemination Strategies tab to understand what formats work best for your target stakeholder group.',
    tip: 'Policy makers prefer 2-page briefs; communities respond to personal impact stories.',
  },
  {
    step: 2,
    title: 'Copy Key Data',
    description: 'Use the "Copy Key Data" button below to get all your scenario metrics in a ready-to-paste format.',
    tip: 'Paste into any document editor, then format to match your template.',
  },
  {
    step: 3,
    title: 'Choose a Template',
    description: 'Download a template structure that matches your chosen format (presentation, brief, infographic).',
    tip: 'Templates are guides—adapt them to your organization\'s style.',
  },
  {
    step: 4,
    title: 'Customize for Context',
    description: 'Add local policy references, regional examples, and your organization\'s branding.',
    tip: 'Include recent government announcements or regional targets that reinforce your scenario.',
  },
  {
    step: 5,
    title: 'Review and Refine',
    description: 'Check that key messages align with stakeholder priorities and that all data is properly sourced.',
    tip: 'Have a colleague from your target audience review before finalizing.',
  },
];

const CUSTOMIZATION_CHECKLIST = [
  { id: 'branding', label: 'Add your organization\'s logo and colors', category: 'Branding' },
  { id: 'local-targets', label: 'Reference national/regional energy targets', category: 'Policy Context' },
  { id: 'recent-policy', label: 'Mention recent policy announcements', category: 'Policy Context' },
  { id: 'local-examples', label: 'Include local project examples or case studies', category: 'Relevance' },
  { id: 'currency', label: 'Convert currency to local denominations', category: 'Relevance' },
  { id: 'language', label: 'Translate key terms to local language if needed', category: 'Accessibility' },
  { id: 'visuals', label: 'Use locally relevant imagery', category: 'Relevance' },
  { id: 'contact', label: 'Add contact information for follow-up', category: 'Engagement' },
];

export default function ExportGuidance({ scenario, onBack }: ExportGuidanceProps) {
  const [copiedData, setCopiedData] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Format scenario data as copyable text
  const formatKeyData = (): string => {
    const milestones = scenario.milestones || [];
    const milestone2030 = milestones.find(m => m.year === 2030);
    const milestone2040 = milestones.find(m => m.year === 2040);
    const milestone2050 = milestones.find(m => m.year === 2050);
    const baselineYear = milestones[0]?.year || 2020;
    const baselineMilestone = milestones[0];

    // Calculate emissions reduction
    const emissionsReduction = milestone2050?.emissions?.total && baselineMilestone?.emissions?.total
      ? Math.round((1 - milestone2050.emissions.total / baselineMilestone.emissions.total) * 100)
      : null;

    // Calculate total capacity for latest milestone
    const latestMilestone = milestones[milestones.length - 1];
    const totalCapacity = latestMilestone?.capacity?.total
      ? (latestMilestone.capacity.total.renewables || 0) +
        (latestMilestone.capacity.total.fossil || 0) +
        (latestMilestone.capacity.total.storage || 0) +
        (latestMilestone.capacity.total.other || 0)
      : null;

    const lines: string[] = [
      '='.repeat(50),
      'KEY SCENARIO DATA',
      `Scenario: ${scenario.metadata?.scenarioName || 'Unnamed Scenario'}`,
      `Country: ${scenario.metadata?.country || 'Not specified'}`,
      '='.repeat(50),
      '',
      '--- RENEWABLE ENERGY SHARE ---',
    ];

    if (milestone2030?.reShare) {
      lines.push(`• 2030: ${milestone2030.reShare.toFixed(1)}%`);
    }
    if (milestone2040?.reShare) {
      lines.push(`• 2040: ${milestone2040.reShare.toFixed(1)}%`);
    }
    if (milestone2050?.reShare) {
      lines.push(`• 2050: ${milestone2050.reShare.toFixed(1)}%`);
    }

    lines.push('', '--- INSTALLED CAPACITY ---');
    if (totalCapacity) {
      const unit = latestMilestone?.capacity?.unit || 'MW';
      lines.push(`• Total (${latestMilestone?.year}): ${totalCapacity.toLocaleString()} ${unit}`);
    }
    if (latestMilestone?.capacity?.total?.renewables) {
      const unit = latestMilestone?.capacity?.unit || 'MW';
      lines.push(`• Renewables: ${latestMilestone.capacity.total.renewables.toLocaleString()} ${unit}`);
    }
    if (latestMilestone?.capacity?.total?.storage) {
      const unit = latestMilestone?.capacity?.unit || 'MW';
      lines.push(`• Storage: ${latestMilestone.capacity.total.storage.toLocaleString()} ${unit}`);
    }

    lines.push('', '--- INVESTMENT ---');
    if (milestone2050?.investment?.cumulative) {
      const unit = milestone2050.investment?.unit || 'million USD';
      lines.push(`• Cumulative to 2050: ${milestone2050.investment.cumulative.toLocaleString()} ${unit}`);
    }
    if (milestone2030?.investment?.annual) {
      const unit = milestone2030.investment?.unit || 'million USD';
      lines.push(`• Annual (2030): ${milestone2030.investment.annual.toLocaleString()} ${unit}`);
    }

    lines.push('', '--- EMISSIONS ---');
    if (emissionsReduction !== null) {
      lines.push(`• Reduction by 2050: ${emissionsReduction}% (from ${baselineYear} baseline)`);
    }
    if (milestone2050?.emissions?.total) {
      const unit = milestone2050.emissions?.unit || 'Mt CO2';
      lines.push(`• 2050 emissions: ${milestone2050.emissions.total.toFixed(2)} ${unit}`);
    }

    lines.push('', '--- GENERATION MIX ---');
    const genMilestone = milestone2050 || latestMilestone;
    if (genMilestone?.generation?.total) {
      const unit = genMilestone.generation?.unit || 'GWh';
      if (genMilestone.generation.total.renewables) {
        lines.push(`• Renewables: ${genMilestone.generation.total.renewables.toLocaleString()} ${unit}`);
      }
      if (genMilestone.generation.total.fossil) {
        lines.push(`• Fossil: ${genMilestone.generation.total.fossil.toLocaleString()} ${unit}`);
      }
    }

    lines.push(
      '',
      '='.repeat(50),
      'Source: Scenario Dialogue Tool / Energy Model Output',
      `Generated: ${new Date().toLocaleDateString()}`,
      '='.repeat(50),
    );

    return lines.join('\n');
  };

  const handleCopyKeyData = async () => {
    const data = formatKeyData();
    try {
      await navigator.clipboard.writeText(data);
      setCopiedData(true);
      setTimeout(() => setCopiedData(false), 3000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = data;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedData(true);
      setTimeout(() => setCopiedData(false), 3000);
    }
  };

  const handleDownloadTemplate = (template: TemplateDownload) => {
    const content = generateTemplateContent(template.id, scenario);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = template.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleCheckedItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Communication Strategies
        </button>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-irena-blue)' }}>
          Export Guidance
        </h1>
        <p className="text-gray-700">
          Step-by-step instructions for creating your own communication materials using your scenario data.
        </p>
      </div>

      {/* Scenario Context Banner */}
      <div className="mb-8 bg-green-50 border border-green-300 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-gray-800">
              Using Scenario: {scenario.metadata?.scenarioName || 'Unnamed Scenario'}
            </p>
            <p className="text-sm text-gray-600">
              {scenario.metadata?.country || 'Country not specified'} •
              Milestones: {scenario.milestones?.map(m => m.year).join(', ') || 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          How to Create Your Materials
        </h2>
        <div className="space-y-4">
          {CREATION_STEPS.map((step) => (
            <div
              key={step.step}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
            >
              <div className="flex gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: 'var(--color-irena-blue)' }}
                >
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-700 mb-2">{step.description}</p>
                  <p className="text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded inline-block">
                    💡 {step.tip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Copy Key Data Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Copy Key Data
        </h2>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            Click the button below to copy all your scenario metrics as formatted text.
            Paste into any document editor (Word, Google Docs, PowerPoint, etc.).
          </p>
          <button
            onClick={handleCopyKeyData}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              copiedData
                ? 'bg-green-600 text-white'
                : 'bg-irena-blue text-white hover:bg-blue-700'
            }`}
          >
            {copiedData ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied to Clipboard!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Key Data to Clipboard
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Includes: RE share, capacity, investment, emissions, and generation data for all milestones.
          </p>
        </div>
      </section>

      {/* Download Templates Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Download Template Files
        </h2>
        <p className="text-gray-700 mb-4">
          These templates provide structure and guidance—customize them with your scenario data and local context.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATE_DOWNLOADS.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <p className="text-xs text-gray-500 mb-3">Format: {template.format}</p>
                  <button
                    onClick={() => handleDownloadTemplate(template)}
                    className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customization Checklist */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Customization Checklist
        </h2>
        <p className="text-gray-700 mb-4">
          Before finalizing your materials, ensure you've addressed these key customization areas:
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-3">
            {CUSTOMIZATION_CHECKLIST.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.id)}
                  onChange={() => toggleCheckedItem(item.id)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-irena-blue focus:ring-irena-blue cursor-pointer"
                />
                <div>
                  <span className={`block ${checkedItems.has(item.id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-500">{item.category}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Progress: {checkedItems.size} of {CUSTOMIZATION_CHECKLIST.length} items completed
            </p>
          </div>
        </div>
      </section>

      {/* Toolkit Resources */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          IRENA Toolkit Resources
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-800 mb-4">
            For more detailed guidance on knowledge dissemination, refer to the IRENA Participatory Processes Toolkit:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">📘</span>
              <span><strong>Section 4.3:</strong> Knowledge Dissemination - Detailed strategies for each stakeholder type</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">📘</span>
              <span><strong>Case Studies:</strong> Belgium "My2050", Kenya Energy Calculator, UAE Board Game</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">📘</span>
              <span><strong>Best Practices:</strong> Interactive tools, layered communication, storytelling with data</span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-white rounded border border-blue-100">
            <p className="text-xs text-gray-600">
              💡 <em>Remember: The goal is to adapt these materials to your local context.
              Templates provide structure; your knowledge of local stakeholders makes them effective.</em>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Generate template content based on template type
 */
function generateTemplateContent(templateId: string, scenario: ScenarioInput): string {
  const scenarioName = scenario.metadata?.scenarioName || '[Your Scenario Name]';
  const country = scenario.metadata?.country || '[Country]';
  const milestones = scenario.milestones || [];
  const milestone2030 = milestones.find(m => m.year === 2030);
  const milestone2050 = milestones.find(m => m.year === 2050);

  switch (templateId) {
    case 'ppt-outline':
      return `# Presentation Outline: ${scenarioName}
## ${country} Energy Transition Scenario

---

### Slide 1: Title Slide
- **Title:** ${scenarioName}
- **Subtitle:** Energy Scenario Analysis for ${country}
- **Date:** [Insert Date]
- **Presented by:** [Your Name/Organization]

*Speaker Notes:* Welcome attendees, introduce yourself and your role.

---

### Slide 2: Executive Summary
- **Key Message 1:** Renewable energy share reaches ${milestone2050?.reShare?.toFixed(0) || '[X]'}% by 2050
- **Key Message 2:** [Investment requirement]
- **Key Message 3:** [Emissions reduction achievement]

*Speaker Notes:* This is your "elevator pitch" - what are the 3 things you want the audience to remember?

---

### Slide 3: Current State
- Current energy mix breakdown
- Key challenges today
- Recent policy context

*Speaker Notes:* Ground the audience in where we are today before showing the future.

---

### Slide 4: The Scenario Vision
- 2030 targets: RE share of ${milestone2030?.reShare?.toFixed(0) || '[X]'}%
- 2050 targets: RE share of ${milestone2050?.reShare?.toFixed(0) || '[X]'}%
- Technology pathway

*Speaker Notes:* Paint a picture of what success looks like.

---

### Slide 5: Investment Requirements
- Total investment needed
- Annual investment by decade
- Comparison to current spending

*Speaker Notes:* Be prepared for questions about financing sources.

---

### Slide 6: Benefits - Jobs
- Jobs created by sector
- Regional distribution
- Skills development needs

*Speaker Notes:* Jobs are often the most compelling benefit for policymakers.

---

### Slide 7: Benefits - Environment
- Emissions reduction trajectory
- Air quality improvements
- Climate commitments alignment

*Speaker Notes:* Connect to NDC targets and health co-benefits.

---

### Slide 8: Implementation Pathway
- Key milestones and decision points
- Policy enablers needed
- Risks and mitigation

*Speaker Notes:* Show this is achievable with the right actions.

---

### Slide 9: Call to Action
- What decisions are needed now?
- Who needs to act?
- Next steps

*Speaker Notes:* End with clear, actionable requests.

---

### Slide 10: Discussion
- Questions for the audience
- Contact information
- Resources for more information

*Speaker Notes:* Leave time for Q&A - this is where real engagement happens.

---

## Tips for This Presentation:
1. Keep text minimal on slides - speak the details
2. Use local imagery and examples where possible
3. Anticipate questions from your specific audience
4. Practice the timing - aim for 20-25 minutes + discussion
5. Have backup slides for technical questions

---

*Template generated from Scenario Dialogue Tool*
*Customize this outline for your specific audience and context*
`;

    case 'policy-brief':
      return `# Policy Brief Template: ${scenarioName}
## Executive Summary for Decision Makers

---

### HEADER SECTION
**Title:** [Compelling title - e.g., "Powering ${country}'s Future: A Roadmap to ${milestone2050?.reShare?.toFixed(0) || 'X'}% Renewables"]

**Date:** [Month Year]

**Prepared by:** [Organization Name]

**Length:** 2-4 pages recommended

---

### EXECUTIVE SUMMARY (1 paragraph)
[Write 3-4 sentences summarizing:
- The scenario's main goal
- The key benefit (jobs, emissions, energy security)
- The main ask/recommendation]

Example:
"This scenario demonstrates a pathway for ${country} to achieve ${milestone2050?.reShare?.toFixed(0) || 'X'}% renewable energy by 2050, creating [X] jobs while reducing emissions by [Y]%. Achieving this vision requires [key policy action] and [investment amount]. We recommend [specific action] as an immediate priority."

---

### KEY FINDINGS (bullet points)

**Renewable Energy Transition**
- RE share increases from [current]% to ${milestone2030?.reShare?.toFixed(0) || '[X]'}% by 2030
- RE share reaches ${milestone2050?.reShare?.toFixed(0) || '[X]'}% by 2050
- Primary technologies: [list main technologies]

**Investment Requirements**
- Total investment: [amount] over [period]
- Annual investment: [amount] per year
- Comparison: [X] times current investment levels

**Economic Benefits**
- Jobs created: [total jobs]
- GDP contribution: [if available]
- Energy cost trajectory: [direction]

**Environmental Impact**
- Emissions reduced by [X]% by 2050
- Air quality improvements: [description]
- Paris Agreement alignment: [status]

---

### CONTEXT (2-3 paragraphs)
[Describe:
- Current energy situation in ${country}
- Recent policy developments
- Why this analysis matters now]

---

### SCENARIO DESCRIPTION (2-3 paragraphs)
[Explain:
- What this scenario assumes
- Key technology choices
- Timeline of major changes]

---

### RECOMMENDATIONS (numbered list)

1. **[First recommendation - highest priority]**
   - Specific action: [what]
   - Responsible party: [who]
   - Timeline: [when]

2. **[Second recommendation]**
   - Specific action: [what]
   - Responsible party: [who]
   - Timeline: [when]

3. **[Third recommendation]**
   - Specific action: [what]
   - Responsible party: [who]
   - Timeline: [when]

---

### RISKS AND MITIGATION
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [Action] |
| [Risk 2] | [H/M/L] | [H/M/L] | [Action] |
| [Risk 3] | [H/M/L] | [H/M/L] | [Action] |

---

### NEXT STEPS
1. [Immediate action - next 30 days]
2. [Short-term action - next 6 months]
3. [Medium-term milestone - next 2 years]

---

### CONTACT
[Name]
[Title]
[Organization]
[Email]
[Phone]

---

### REFERENCES
- [Model used]
- [Data sources]
- [Related policies]

---

*Template generated from Scenario Dialogue Tool*
*Adapt this structure to your organization's format and style guide*
`;

    case 'infographic-structure':
      return `# Infographic Structure Guide: ${scenarioName}
## Visual Communication for ${country} Energy Scenario

---

## LAYOUT OVERVIEW

Recommended size: A3 (297 x 420 mm) or 11 x 17 inches
Orientation: Portrait or Landscape depending on content
Sections: 5-7 distinct areas

---

## SECTION 1: HEADER (Top 15%)

**Elements:**
- [ ] Compelling headline (max 10 words)
- [ ] Subheadline with country/timeframe
- [ ] Organization logo
- [ ] Visual element (icon or small graphic)

**Example Headlines:**
- "Powering ${country}'s Future: ${milestone2050?.reShare?.toFixed(0) || 'X'}% Clean by 2050"
- "${country}'s Energy Transformation at a Glance"
- "From Coal to Clean: ${country}'s Path Forward"

**Design Tips:**
- Use bold, large font (48-72pt for main headline)
- Include a single striking image or icon
- Keep background uncluttered

---

## SECTION 2: THE BIG NUMBERS (20%)

**3-4 Key Statistics to Highlight:**

1. **${milestone2050?.reShare?.toFixed(0) || '[X]'}%**
   Label: "Renewable Energy by 2050"
   Icon suggestion: Sun + wind turbine

2. **[X]**
   Label: "Jobs Created"
   Icon suggestion: Person/group icon

3. **[X]%**
   Label: "Emissions Reduction"
   Icon suggestion: Cloud with down arrow

4. **$[X]B**
   Label: "Total Investment"
   Icon suggestion: Building/coin stack

**Design Tips:**
- Use extra-large numbers (72-120pt)
- Circle or highlight treatments
- Consistent icon style
- Color-code by theme (green for environment, blue for jobs, etc.)

---

## SECTION 3: TIMELINE/JOURNEY (25%)

**Visual: Arrow or path showing progression**

**Milestones to mark:**
${milestones.map(m => `- ${m.year}: RE share ${m.reShare?.toFixed(0) || '?'}%`).join('\n')}

**Design Options:**
- Horizontal timeline with icons at each year
- Winding path/road graphic
- Stacked bar showing progression
- Circular/radial timeline

**Design Tips:**
- Left-to-right or bottom-to-top progression
- Distinct markers for each milestone
- Brief labels (2-3 words max)

---

## SECTION 4: COMPARISON/CONTRAST (20%)

**Show before/after or scenario comparison:**

**Option A: Then vs Now vs Future**
| | 2020 | 2030 | 2050 |
|---|---|---|---|
| RE Share | [X]% | ${milestone2030?.reShare?.toFixed(0) || '[X]'}% | ${milestone2050?.reShare?.toFixed(0) || '[X]'}% |

**Option B: Pie Charts**
- Current energy mix (pie chart)
- 2050 energy mix (pie chart)

**Option C: Icon Arrays**
- 10 lightbulbs showing current vs future RE share

**Design Tips:**
- Use consistent colors across comparisons
- Highlight the change/improvement
- Keep comparisons to 2-3 elements

---

## SECTION 5: PERSONAL IMPACT (15%)

**Make it relatable to individuals:**

**Ideas:**
- "What this means for your family"
- "Enough clean energy to power [X] homes"
- "[X] fewer sick days from air pollution"
- "Your energy bill could [direction]"

**Visual:**
- House icon with benefits listed
- Family silhouette with surrounding icons
- Daily life scenes (home, commute, work)

**Design Tips:**
- Use "you" and "your" language
- Concrete, tangible benefits
- Positive framing

---

## SECTION 6: CALL TO ACTION (5%)

**Single clear message:**
- "Support [specific policy]"
- "Learn more at [website]"
- "Join the conversation: [hashtag]"

**Include:**
- [ ] QR code to more information
- [ ] Organization website
- [ ] Social media handles

---

## COLOR PALETTE SUGGESTIONS

**For energy/environment themes:**
- Primary: Green (#22C55E) or Blue (#0078A7 - IRENA blue)
- Accent: Yellow/Orange (#F7941D) or Teal
- Neutral: Dark gray (#374151) for text
- Background: White or very light gray

**Avoid:**
- Too many colors (max 4-5)
- Red unless showing something negative
- Low contrast combinations

---

## TYPOGRAPHY

**Headlines:** Bold, sans-serif (e.g., Arial Bold, Helvetica Bold)
**Body text:** Clean, readable (e.g., Arial, Calibri)
**Numbers:** Extra bold, possibly different color

**Sizes:**
- Main headline: 48-72pt
- Big numbers: 72-120pt
- Section headers: 24-36pt
- Body text: 12-16pt
- Fine print: 8-10pt

---

## ICONS AND GRAPHICS

**Recommended icon themes:**
- Solar panel, wind turbine, battery
- Factory/industry
- House/building
- Person/group
- Graph trending up
- Leaf/tree
- Lightning bolt

**Sources for icons:**
- Flaticon.com
- Noun Project
- Icons8
- Custom illustrations

---

## CHECKLIST BEFORE FINALIZING

- [ ] Can someone understand the main message in 10 seconds?
- [ ] Are all numbers sourced and accurate?
- [ ] Is text readable from arm's length?
- [ ] Do colors work for colorblind viewers?
- [ ] Is organization branding included?
- [ ] Is there clear hierarchy (what to read first, second, third)?
- [ ] Has someone unfamiliar with the topic reviewed it?

---

*Template generated from Scenario Dialogue Tool*
*Work with a designer to bring this structure to life*
`;

    case 'community-flyer':
      return `# Community Flyer Template: ${scenarioName}
## One-Page Handout for ${country} Residents

---

## PAGE LAYOUT (A4 or Letter size)

---

### TOP SECTION: HEADLINE (20% of page)

**Main Headline (large, bold):**
"[Your Community]'s Clean Energy Future"

**Subheadline:**
"What ${country}'s energy plan means for you and your family"

**Visual:**
- Local landscape with wind turbine/solar panel
- OR happy family with home in background

---

### MIDDLE SECTION: KEY BENEFITS (50% of page)

**Layout:** 3-4 boxes or icons with brief text

---

**Box 1: Your Energy Bills**
Icon: 💡 or lightbulb

"[Direction] energy costs as we shift to renewables"

Supporting fact:
"Renewable energy now costs less than fossil fuels to produce"

---

**Box 2: Local Jobs**
Icon: 👷 or tools

"[Number] new jobs in our region"

Supporting fact:
"Construction, operations, and maintenance jobs that stay local"

---

**Box 3: Cleaner Air**
Icon: 🌬️ or lungs

"[X]% less pollution from power plants"

Supporting fact:
"Fewer asthma attacks and sick days for our children"

---

**Box 4: Energy Security**
Icon: 🔒 or plug

"Reliable power from local sources"

Supporting fact:
"Less dependence on imported fuels and price swings"

---

### BOTTOM SECTION: GET INVOLVED (30% of page)

**Heading:** "Have Your Say"

**Options for community input:**
- [ ] Attend a community meeting: [Date/Location]
- [ ] Complete online survey: [URL or QR code]
- [ ] Contact your representative: [Name/email]
- [ ] Join our community group: [Facebook/WhatsApp group]

**QR Code:** Link to more information

---

### FOOTER

- Organization logo
- Contact information
- Website
- "Part of ${country}'s ${milestone2050?.reShare?.toFixed(0) || ''}% renewable energy by 2050 plan"

---

## DESIGN GUIDELINES

**Do:**
- Use simple, everyday language (no jargon)
- Include images of local landmarks or people
- Make text large enough to read easily
- Use positive, hopeful messaging
- Include clear ways to participate

**Don't:**
- Overwhelm with numbers and statistics
- Use technical terms without explanation
- Make the page too cluttered
- Forget contact information
- Use threatening or fear-based messaging

---

## LANGUAGE TO USE

**Instead of:** "Decarbonization pathway"
**Say:** "Cleaner energy sources"

**Instead of:** "Grid integration challenges"
**Say:** "Keeping the lights on reliably"

**Instead of:** "Levelized cost of electricity"
**Say:** "What you pay for power"

**Instead of:** "Installed capacity in megawatts"
**Say:** "Enough power for [X] homes"

---

## TRANSLATION CHECKLIST

If translating to local languages:
- [ ] Headlines translated and culturally appropriate
- [ ] Numbers formatted for local convention
- [ ] Currency converted to local denomination
- [ ] Cultural references updated
- [ ] Contact info includes local language options

---

## DISTRIBUTION IDEAS

- Community centers and libraries
- Local markets and shops
- Schools (for parents)
- Religious institutions
- Health clinics
- Municipal offices
- Bus stops and transit hubs
- Door-to-door distribution

---

*Template generated from Scenario Dialogue Tool*
*Customize with local details, images, and language*
`;

    default:
      return `# Template: ${templateId}\n\nTemplate content not found. Please try another template.`;
  }
}
