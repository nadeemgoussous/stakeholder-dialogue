import { useOnlineStatus } from '../../hooks/useOnlineStatus'

/**
 * Header component with IRENA branding and online/offline status indicator
 *
 * Features:
 * - IRENA blue background (#0078a7)
 * - Tool name and subtitle
 * - Real-time online/offline indicator (NOT alarming - offline is expected)
 * - Responsive layout
 */
export default function Header() {
  const isOnline = useOnlineStatus()

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
        <div className="flex items-center gap-2">
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
