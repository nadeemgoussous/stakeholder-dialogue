/**
 * Dissemination Tips Component
 *
 * Educational content from IRENA Participatory Processes Toolkit Section 4.3
 * Teaches best practices for disseminating scenario results to different audiences.
 */

import { useState } from 'react';
import type { StakeholderId } from '../../types/stakeholder';
import {
  quickTips,
  allDisseminationPrinciples,
  getContextualTips,
  getAllCaseStudies,
  type DisseminationPrinciple,
  type QuickTip,
  type CaseStudy,
} from '../../data/dissemination-tips';

interface DisseminationTipsProps {
  selectedStakeholderId?: StakeholderId;
  onBack?: () => void;
}

export default function DisseminationTips({
  selectedStakeholderId,
  onBack,
}: DisseminationTipsProps) {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick-tips' | 'principles' | 'case-studies'>('quick-tips');

  const contextualTips = selectedStakeholderId ? getContextualTips(selectedStakeholderId) : null;

  const toggleTip = (tipId: string) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  const togglePrinciple = (principleId: string) => {
    setExpandedPrinciple(expandedPrinciple === principleId ? null : principleId);
  };

  return (
    <div className="dissemination-tips">
      {/* Header */}
      <div className="mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <span>←</span> Back to Strategies
          </button>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dissemination Best Practices
        </h2>
        <p className="text-gray-700">
          Key guidance from IRENA Participatory Processes Toolkit Section 4.3 on effective
          stakeholder communication.
        </p>
      </div>

      {/* Contextual Tips Banner (if stakeholder selected) */}
      {contextualTips && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Tips for {selectedStakeholderId?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </h3>
          <ul className="space-y-2 mb-4">
            {contextualTips.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                <span className="text-blue-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-green-800 mb-2">Recommended Approaches</h4>
              <div className="flex flex-wrap gap-2">
                {contextualTips.recommendedApproaches.map((approach, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium"
                  >
                    {approach}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Approaches to Avoid</h4>
              <div className="flex flex-wrap gap-2">
                {contextualTips.avoidApproaches.map((approach, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium"
                  >
                    {approach}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('quick-tips')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'quick-tips'
              ? 'text-irena-blue border-b-2 border-irena-blue'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quick Tips
        </button>
        <button
          onClick={() => setActiveTab('principles')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'principles'
              ? 'text-irena-blue border-b-2 border-irena-blue'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Toolkit Principles
        </button>
        <button
          onClick={() => setActiveTab('case-studies')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'case-studies'
              ? 'text-irena-blue border-b-2 border-irena-blue'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Case Studies
        </button>
      </div>

      {/* Quick Tips Tab */}
      {activeTab === 'quick-tips' && (
        <div className="quick-tips-grid grid md:grid-cols-2 gap-4">
          {quickTips.map((tip) => (
            <QuickTipCard
              key={tip.id}
              tip={tip}
              isExpanded={expandedTip === tip.id}
              onToggle={() => toggleTip(tip.id)}
            />
          ))}
        </div>
      )}

      {/* Principles Tab */}
      {activeTab === 'principles' && (
        <div className="principles-list space-y-4">
          {allDisseminationPrinciples.map((principle) => (
            <PrincipleCard
              key={principle.id}
              principle={principle}
              isExpanded={expandedPrinciple === principle.id}
              onToggle={() => togglePrinciple(principle.id)}
            />
          ))}
        </div>
      )}

      {/* Case Studies Tab */}
      {activeTab === 'case-studies' && (
        <CaseStudiesGrid caseStudies={getAllCaseStudies()} />
      )}

      {/* Toolkit Reference Footer */}
      <div className="mt-8 p-5 bg-gray-100 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">Source Reference</h4>
        <p className="text-sm text-gray-700 mb-2">
          This content is based on <strong>IRENA Participatory Processes for Strategic Energy
          Planning Toolkit, Section 4.3: Dissemination</strong>.
        </p>
        <p className="text-sm text-gray-600">
          The toolkit provides comprehensive guidance on stakeholder engagement throughout the
          energy planning process, from framing through validation and communication.
        </p>
      </div>
    </div>
  );
}

/**
 * Quick Tip Card Component - Expandable card for key principles
 */
function QuickTipCard({
  tip,
  isExpanded,
  onToggle,
}: {
  tip: QuickTip;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`quick-tip-card bg-white border rounded-lg shadow-sm transition-all ${
        isExpanded ? 'border-irena-blue shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-start gap-3"
        aria-expanded={isExpanded}
      >
        <span className="text-2xl flex-shrink-0">{getTipIcon(tip.icon)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{tip.title}</h3>
          {!isExpanded && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{tip.description}</p>
          )}
        </div>
        <span className="text-gray-400 flex-shrink-0 transition-transform" style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-700 mb-3">{tip.description}</p>
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
            <span className="font-medium">Toolkit Reference:</span> {tip.toolkitReference}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Principle Card Component - Detailed expandable section for toolkit principles
 */
function PrincipleCard({
  principle,
  isExpanded,
  onToggle,
}: {
  principle: DisseminationPrinciple;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`principle-card bg-white border rounded-lg shadow-sm transition-all ${
        isExpanded ? 'border-irena-blue shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-irena-blue bg-blue-50 px-2 py-1 rounded">
              Section {principle.toolkitSection}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-2">{principle.title}</h3>
          </div>
          <span className="text-gray-400 flex-shrink-0 transition-transform text-xl" style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </div>
        {!isExpanded && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{principle.description}</p>
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-5">
          {/* Description */}
          <p className="text-gray-700">{principle.description}</p>

          {/* Implementation Stages */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Implementation Stages</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {principle.implementationStages.map((stage) => (
                <div key={stage.stage} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs font-semibold text-irena-blue uppercase mb-1">
                    {stage.label}
                  </div>
                  <div className="text-xs text-gray-600">{stage.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths, Challenges, Limitations */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span>✓</span> Strengths
              </h5>
              <ul className="space-y-2">
                {principle.strengths.map((strength, index) => (
                  <li key={index} className="text-xs text-green-700">{strength}</li>
                ))}
              </ul>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <span>⚠</span> Challenges
              </h5>
              <ul className="space-y-2">
                {principle.challenges.map((challenge, index) => (
                  <li key={index} className="text-xs text-yellow-700">{challenge}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h5 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <span>⊘</span> Limitations
              </h5>
              <ul className="space-y-2">
                {principle.limitations.map((limitation, index) => (
                  <li key={index} className="text-xs text-red-700">{limitation}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Available Tools</h4>
            <div className="space-y-3">
              {principle.tools.map((tool, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-1">{tool.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                  {tool.examples && tool.examples.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tool.examples.map((example, exIndex) => (
                        <span
                          key={exIndex}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resource Requirements */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Resource Requirements</h4>
            <ul className="grid md:grid-cols-2 gap-2">
              {principle.resourceRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 mt-0.5">→</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Case Studies Grid Component
 */
function CaseStudiesGrid({ caseStudies }: { caseStudies: CaseStudy[] }) {
  // Group by country
  const groupedByCountry = caseStudies.reduce((acc, study) => {
    if (!acc[study.country]) {
      acc[study.country] = [];
    }
    acc[study.country].push(study);
    return acc;
  }, {} as Record<string, CaseStudy[]>);

  return (
    <div className="case-studies-grid">
      <p className="text-gray-700 mb-6">
        Real-world examples of how countries have successfully disseminated energy scenario results
        to different stakeholders.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedByCountry).map(([country, studies]) => (
          <div
            key={country}
            className="case-study-card bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{getCountryFlag(country)}</span>
              <h3 className="font-bold text-gray-900">{country}</h3>
            </div>
            <div className="space-y-3">
              {studies.map((study, index) => (
                <div key={index} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                  <div className="text-sm font-semibold text-irena-blue mb-1">
                    {study.approach}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{study.description}</p>
                  {study.audience && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Audience:</span> {study.audience}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper: Get icon for tip type
 */
function getTipIcon(iconType: string): string {
  const iconMap: Record<string, string> = {
    target: '🎯',
    message: '💬',
    cursor: '👆',
    game: '🎮',
    feedback: '📝',
    layers: '📊',
    globe: '🌐',
    book: '📖',
  };
  return iconMap[iconType] || '💡';
}

/**
 * Helper: Get flag emoji for country
 */
function getCountryFlag(country: string): string {
  const flagMap: Record<string, string> = {
    'Belgium': '🇧🇪',
    'Kenya': '🇰🇪',
    'United Arab Emirates': '🇦🇪',
    'Cyprus': '🇨🇾',
    'Brazil': '🇧🇷',
    'Chile': '🇨🇱',
    'International (IEA)': '🌍',
    'International': '🌐',
  };
  return flagMap[country] || '🏳️';
}
