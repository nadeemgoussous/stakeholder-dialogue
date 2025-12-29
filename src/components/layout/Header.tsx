import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useScenario } from '../../context/ScenarioContext'

/**
 * Header component with IRENA branding and status indicators
 *
 * Features:
 * - IRENA blue background (#0078a7)
 * - Tool name and subtitle
 * - Real-time online/offline indicator (NOT alarming - offline is expected)
 * - Auto-save status indicator
 * - Responsive layout
 */
export default function Header() {
  const isOnline = useOnlineStatus()
  const { scenario, storageAvailable, lastSaved, saveError, isLoading } = useScenario()

  // Format time since last save
  const formatLastSaved = () => {
    if (!lastSaved) return null
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)

    if (diff < 5) return 'Just saved'
    if (diff < 60) return `Saved ${diff}s ago`
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
    return `Saved ${Math.floor(diff / 3600)}h ago`
  }

  return (
    <header
      style={{ backgroundColor: 'var(--color-irena-blue)' }}
      className="text-white shadow-md"
      role="banner"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IRENA Scenario Dialogue Tool</h1>
          <p className="text-sm opacity-80">
            Understanding Stakeholder Perspectives on Energy Scenarios
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Storage/Save status indicator */}
          {storageAvailable && scenario && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                saveError
                  ? 'bg-yellow-600 bg-opacity-30 text-yellow-200'
                  : 'bg-white bg-opacity-10 text-white'
              }`}
              role="status"
              aria-live="polite"
              title={saveError || 'Scenario auto-saved to browser storage'}
              data-testid="save-status"
            >
              {isLoading ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Loading...</span>
                </>
              ) : saveError ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-300" />
                  <span>Save error</span>
                </>
              ) : lastSaved ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{formatLastSaved()}</span>
                </>
              ) : null}
            </div>
          )}

          {/* Subtle status indicator - offline is NOT an error state */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isOnline
                ? 'bg-green-600 bg-opacity-20 text-green-200'
                : 'bg-blue-600 bg-opacity-30 text-blue-100'
            }`}
            role="status"
            aria-live="polite"
            title={isOnline ? 'Connected to internet' : 'Working offline - AI enhancement may be limited'}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-300' : 'bg-blue-300'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
