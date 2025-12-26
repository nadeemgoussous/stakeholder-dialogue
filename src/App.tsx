import { useState } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import TabNavigation from './components/layout/TabNavigation'
import InputTab from './components/input/InputTab'
import StakeholderTab from './components/stakeholder/StakeholderTab'
import ExploreTab from './components/calculator/ExploreTab'
import CommunicateTab from './components/output/CommunicateTab'
import { ScenarioProvider } from './context/ScenarioContext'

function App() {
  const [activeTab, setActiveTab] = useState<'input' | 'dialogue' | 'explore' | 'communicate'>('input')

  return (
    <ScenarioProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header with IRENA branding and online/offline indicator */}
        <Header />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <main className="container mx-auto px-4 py-8 flex-1">
          {activeTab === 'input' && (
            <InputTab onProceedToDialogue={() => setActiveTab('dialogue')} />
          )}

          {activeTab === 'dialogue' && (
            <StakeholderTab />
          )}

          {activeTab === 'explore' && (
            <ExploreTab />
          )}

          {activeTab === 'communicate' && (
            <CommunicateTab />
          )}

          {/* Important Disclaimer - shown on all tabs */}
          <div className="disclaimer max-w-4xl mx-auto mt-8">
            <p className="font-semibold text-yellow-800 mb-2">⚠️ ILLUSTRATIVE TOOL ONLY</p>
            <p className="text-sm text-yellow-700">
              This tool shows <strong>directional impacts</strong> for discussion purposes.
              It does <strong>NOT</strong> replace energy system optimization models (MESSAGE, OSeMOSYS, LEAP, SPLAT).
              Always verify technical and economic feasibility in the full model.
            </p>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ScenarioProvider>
  )
}

export default App
