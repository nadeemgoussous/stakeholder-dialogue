import { useState } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import TabNavigation from './components/layout/TabNavigation'

function App() {
  const [activeTab, setActiveTab] = useState<'input' | 'dialogue' | 'explore' | 'communicate'>('input')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with IRENA branding and online/offline indicator */}
      <Header />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {activeTab === 'input' && (
          <div className="card max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-irena-blue)' }}>
              Welcome to the Scenario Dialogue Tool
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              This interactive tool helps energy planners understand how different stakeholders
              would perceive and respond to their energy scenarios.
            </p>

            {/* Offline-first indicator */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Offline-First Design</h3>
                  <p className="text-sm text-green-700 mt-1">
                    This tool works fully offline after the initial load. All core features are available
                    without an internet connection - perfect for workshop environments.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-left">
                <div className="text-3xl mb-2" style={{ color: 'var(--color-irena-blue)' }}>1</div>
                <h3 className="font-semibold mb-2">Import Scenario</h3>
                <p className="text-gray-600 text-sm">
                  Load your energy model results in under 5 minutes using our Excel template or quick entry form.
                </p>
              </div>
              <div className="text-left">
                <div className="text-3xl mb-2" style={{ color: 'var(--color-irena-orange)' }}>2</div>
                <h3 className="font-semibold mb-2">Predict & Learn</h3>
                <p className="text-gray-600 text-sm">
                  Predict how stakeholders will respond, then compare with simulated responses.
                </p>
              </div>
              <div className="text-left">
                <div className="text-3xl mb-2 text-green-600">3</div>
                <h3 className="font-semibold mb-2">Communicate</h3>
                <p className="text-gray-600 text-sm">
                  Generate audience-specific framings of your scenario for effective communication.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                className="btn-primary"
                onClick={() => setActiveTab('dialogue')}
              >
                Get Started
              </button>
            </div>
          </div>
        )}

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
  )
}

export default App
