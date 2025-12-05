import { useState } from 'react'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Monitor online/offline status
  useState(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ backgroundColor: 'var(--color-irena-blue)' }} className="text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">IRENA Scenario Dialogue Tool</h1>
            <p className="text-sm opacity-80">
              Understanding Stakeholder Perspectives on Energy Scenarios
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isOnline ? 'text-green-300' : 'text-yellow-300 offline-indicator'}`}>
              {isOnline ? '● Online' : '● Offline Mode'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
            <button className="btn-primary">
              Get Started
            </button>
          </div>
        </div>

        {/* Important Disclaimer */}
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
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Part of IRENA's Participatory Processes for Strategic Energy Planning toolkit
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Version 1.0.0 • Offline-First Design
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
