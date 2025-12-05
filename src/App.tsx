import { useState } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import TabNavigation from './components/layout/TabNavigation'
import InputTab from './components/input/InputTab'
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
          {activeTab === 'input' && <InputTab />}

          {activeTab === 'dialogue' && (
            <div className="card max-w-4xl mx-auto text-center" id="dialogue-panel" role="tabpanel">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-irena-blue)' }}>
                Stakeholder Dialogue
              </h2>
              <p className="text-gray-600">
                Predict how different stakeholders will respond to your scenario, then compare with simulated responses.
              </p>
              <div className="mt-6 text-gray-500">
                <em>Coming soon: Stakeholder selection and predict-before-reveal interface</em>
              </div>
            </div>
          )}

          {activeTab === 'explore' && (
            <div className="card max-w-4xl mx-auto text-center" id="explore-panel" role="tabpanel">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-irena-blue)' }}>
                Explore Impacts
              </h2>
              <p className="text-gray-600">
                Explore directional impacts of adjusting key scenario parameters.
              </p>
              <div className="mt-6 text-gray-500">
                <em>Coming soon: Directional sensitivity sliders and stakeholder sentiment changes</em>
              </div>
            </div>
          )}

          {activeTab === 'communicate' && (
            <div className="card max-w-4xl mx-auto text-center" id="communicate-panel" role="tabpanel">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-irena-blue)' }}>
                Communicate
              </h2>
              <p className="text-gray-600">
                Generate audience-specific framings of your scenario for effective communication.
              </p>
              <div className="mt-6 text-gray-500">
                <em>Coming soon: Audience selector and communication output generator</em>
              </div>
            </div>
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
