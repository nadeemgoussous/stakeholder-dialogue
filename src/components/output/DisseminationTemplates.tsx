import React, { useState } from 'react';
import { disseminationTemplates, DisseminationTemplate, TemplateSection } from '../../data/dissemination-templates';

interface DisseminationTemplatesProps {
  selectedStakeholderId?: string;
  scenarioData: Record<string, string | number>;
  scenarioName: string;
  country: string;
}

const DisseminationTemplates: React.FC<DisseminationTemplatesProps> = ({
  selectedStakeholderId,
  scenarioData,
  scenarioName,
  country
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DisseminationTemplate | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Copy text to clipboard
  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Get effort badge color
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Template selection view
  if (!selectedTemplate) {
    return (
      <div className="space-y-6">
        {/* Scenario Context Banner */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">✅</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Using Scenario: <span className="text-green-700">{scenarioName}</span>
              </p>
              <p className="text-xs text-gray-700">
                Country: {country} • Renewable Share 2050: {scenarioData.reShare2050}% •
                Investment: ${scenarioData.investment2050}M • Emissions Reduction: {scenarioData.emissionsReduction}%
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dissemination Format Templates
          </h2>
          <p className="text-gray-700 mb-3">
            Text-based template structures to help you create communication materials.
            These are educational guides, not automated generators - customize them for your context.
          </p>
          <div className="flex items-start gap-2 text-sm text-blue-900">
            <span className="text-lg">💡</span>
            <p>
              <strong>How to use:</strong> Select a template to see its structure, copy sections you need,
              and customize with your scenario data and local context.
            </p>
          </div>
        </div>

        {/* Template cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disseminationTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer bg-white"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="p-6">
                {/* Template name and effort badge */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {template.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEffortColor(template.characteristics.effort)}`}>
                    {template.characteristics.effort.toUpperCase()} EFFORT
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  {template.description}
                </p>

                {/* Characteristics */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium w-24 shrink-0">Length:</span>
                    <span className="text-gray-700">{template.characteristics.length}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium w-24 shrink-0">Tone:</span>
                    <span className="text-gray-700">{template.characteristics.tone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium w-24 shrink-0">Level:</span>
                    <span className="text-gray-700">{template.characteristics.technicalLevel}</span>
                  </div>
                </div>

                {/* Best for */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Best for:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.bestFor.map((audience, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View button */}
                <button
                  className="w-full bg-irena-blue text-white py-2 px-4 rounded-lg hover:bg-irena-blue-dark transition-colors font-medium"
                >
                  View Template Structure →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Toolkit reference */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          📚 <strong>Reference:</strong> These templates are based on dissemination methods from
          IRENA's Participatory Processes Toolkit, Section 4.3 (Knowledge Dissemination).
        </div>
      </div>
    );
  }

  // Template detail view
  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div>
        <button
          onClick={() => setSelectedTemplate(null)}
          className="mb-4 text-irena-blue hover:text-irena-blue-dark font-medium flex items-center gap-2"
        >
          ← Back to Templates
        </button>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedTemplate.name}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEffortColor(selectedTemplate.characteristics.effort)}`}>
              {selectedTemplate.characteristics.effort.toUpperCase()} EFFORT
            </span>
          </div>
          <p className="text-gray-700 mb-3">
            {selectedTemplate.description}
          </p>

          {/* Characteristics grid */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Length:</span>
              <p className="text-gray-900">{selectedTemplate.characteristics.length}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Tone:</span>
              <p className="text-gray-900">{selectedTemplate.characteristics.tone}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Technical Level:</span>
              <p className="text-gray-900">{selectedTemplate.characteristics.technicalLevel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* How to use this template */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span>
          How to Use This Template
        </h3>
        <ul className="space-y-2">
          {selectedTemplate.howToUse.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-700">
              <span className="text-irena-blue font-bold shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Template sections */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Template Structure</h3>

        {selectedTemplate.sections.map((section, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6">
              {/* Section heading */}
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-bold text-gray-900">
                  {idx + 1}. {section.heading}
                </h4>
                <button
                  onClick={() => copyToClipboard(
                    `${section.heading}\n\n${section.description}\n\nKey Points:\n${section.keyPoints.map(p => `• ${p}`).join('\n')}`,
                    `section-${idx}`
                  )}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors flex items-center gap-2"
                >
                  {copiedSection === `section-${idx}` ? (
                    <>✓ Copied</>
                  ) : (
                    <>📋 Copy</>
                  )}
                </button>
              </div>

              {/* Section description */}
              <p className="text-gray-600 mb-4 italic">
                {section.description}
              </p>

              {/* Key points */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Key Points to Include:</p>
                <ul className="space-y-2">
                  {section.keyPoints.map((point, pointIdx) => (
                    <li key={pointIdx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-irena-blue shrink-0">▸</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data fields */}
              {section.dataFields.length > 0 && (
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Scenario Data to Include:</p>
                  <div className="flex flex-wrap gap-2">
                    {section.dataFields.map((field, fieldIdx) => (
                      <code key={fieldIdx} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800">
                        {field}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Example text */}
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="border-b border-gray-300 bg-gray-50 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Example / Full Template</h3>
          <button
            onClick={() => copyToClipboard(selectedTemplate.exampleText, 'full-template')}
            className="px-4 py-2 bg-irena-blue hover:bg-irena-blue-dark text-white rounded font-medium transition-colors flex items-center gap-2"
          >
            {copiedSection === 'full-template' ? (
              <>✓ Copied to Clipboard</>
            ) : (
              <>📋 Copy Full Template</>
            )}
          </button>
        </div>
        <div className="p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
            {selectedTemplate.exampleText}
          </pre>
        </div>
      </div>

      {/* Toolkit reference */}
      {selectedTemplate.toolkitReference && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          📚 <strong>IRENA Toolkit Reference:</strong> {selectedTemplate.toolkitReference}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedTemplate(null)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors"
        >
          ← Back to Templates
        </button>
        <button
          onClick={() => copyToClipboard(selectedTemplate.exampleText, 'full-template-bottom')}
          className="flex-1 bg-irena-blue hover:bg-irena-blue-dark text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          {copiedSection === 'full-template-bottom' ? '✓ Copied!' : '📋 Copy Full Template'}
        </button>
      </div>
    </div>
  );
};

export default DisseminationTemplates;
