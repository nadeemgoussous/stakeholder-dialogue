import { useState, useEffect } from 'react'

/**
 * Header component with IRENA branding and online/offline status indicator
 *
 * Features:
 * - IRENA blue background (#0078a7)
 * - Tool name and subtitle
 * - Real-time online/offline indicator
 * - Responsive layout
 */
export default function Header() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
          <span
            className={`text-sm ${isOnline ? 'text-green-300' : 'text-yellow-300'}`}
            role="status"
            aria-live="polite"
          >
            {isOnline ? '● Online' : '● Offline Mode'}
          </span>
        </div>
      </div>
    </header>
  )
}
