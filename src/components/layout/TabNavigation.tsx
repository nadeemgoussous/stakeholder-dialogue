/**
 * Tab navigation component for the four main sections of the tool
 *
 * Tabs:
 * 1. Input - Data import (5 minutes max)
 * 2. Stakeholder Dialogue - Predict-before-reveal learning
 * 3. Explore Impacts - Directional sensitivity (soft metrics only)
 * 4. Communicate - Audience-specific outputs
 *
 * Features:
 * - Active tab highlighting with IRENA blue
 * - Inactive tabs with hover effects
 * - Responsive layout
 * - Keyboard accessible
 */

interface TabNavigationProps {
  activeTab: 'input' | 'dialogue' | 'explore' | 'communicate'
  onTabChange: (tab: 'input' | 'dialogue' | 'explore' | 'communicate') => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'input' as const, label: 'Input', description: 'Import scenario data' },
    { id: 'dialogue' as const, label: 'Stakeholder Dialogue', description: 'Predict & learn' },
    { id: 'explore' as const, label: 'Explore Impacts', description: 'Directional sensitivity' },
    { id: 'communicate' as const, label: 'Communicate', description: 'Audience-specific outputs' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-6 py-4 text-sm font-medium transition-colors duration-200
                  border-b-2 hover:bg-gray-50
                  ${
                    isActive
                      ? 'border-b-2 text-white'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }
                `}
                style={
                  isActive
                    ? { backgroundColor: 'var(--color-irena-blue)', borderColor: 'var(--color-irena-orange)' }
                    : undefined
                }
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{tab.label}</span>
                  <span className={`text-xs ${isActive ? 'text-white opacity-90' : 'text-gray-500'}`}>
                    {tab.description}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
